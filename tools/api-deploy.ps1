param(
  [string]$Message,
  [switch]$NoWait
)

$ErrorActionPreference = "Stop"

$Owner = "Galois37"
$Repo = "personal-site"
$Branch = "main"
$siteRoot = Split-Path -Parent $PSScriptRoot
Set-Location $siteRoot
$siteRootFull = (Get-Item -LiteralPath $siteRoot).FullName.TrimEnd("\", "/")

if (!$Message) {
  $Message = "Update site assets $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

$env:HTTP_PROXY = ""
$env:HTTPS_PROXY = ""
$env:ALL_PROXY = ""
$env:GIT_HTTP_PROXY = ""
$env:GIT_HTTPS_PROXY = ""

function Get-GitHubToken {
  $credentialInput = "protocol=https`nhost=github.com`n`n"
  $credentialOutput = $credentialInput | git credential-manager get
  $tokenLine = $credentialOutput | Select-String "^password="
  if (!$tokenLine) {
    throw "GitHub credentials were not found in Git Credential Manager. Please sign in to GitHub first."
  }
  return $tokenLine.ToString().Substring(9)
}

$GitHubToken = Get-GitHubToken
$Headers = @{
  Authorization = "Bearer $GitHubToken"
  Accept = "application/vnd.github+json"
  "X-GitHub-Api-Version" = "2022-11-28"
  "User-Agent" = "Galois37-Site-Deployer"
}

function Invoke-GitHubApi {
  param(
    [string]$Method,
    [string]$Path,
    $Body = $null
  )

  $params = @{
    Method = $Method
    Uri = "https://api.github.com$Path"
    Headers = $Headers
  }

  if ($null -ne $Body) {
    $params.Body = ($Body | ConvertTo-Json -Depth 20 -Compress)
    $params.ContentType = "application/json; charset=utf-8"
  }

  return Invoke-RestMethod @params
}

function Get-WorkflowRunForCommit {
  param([string]$CommitSha)

  $encodedSha = [uri]::EscapeDataString($CommitSha)
  $runs = Invoke-GitHubApi -Method "Get" -Path "/repos/$Owner/$Repo/actions/runs?head_sha=$encodedSha&per_page=10"
  return @($runs.workflow_runs | Where-Object { $_.head_sha -eq $CommitSha } | Sort-Object created_at -Descending | Select-Object -First 1)
}

function Show-WorkflowFailureSummary {
  param($Run)

  Write-Host ""
  Write-Host "Deployment failed in GitHub Actions." -ForegroundColor Red
  Write-Host "Run: $($Run.html_url)"

  $logZip = Join-Path $env:TEMP "galois37-actions-$($Run.id).zip"
  $logDir = Join-Path $env:TEMP "galois37-actions-$($Run.id)"

  try {
    Remove-Item -LiteralPath $logDir -Recurse -Force -ErrorAction SilentlyContinue
    Invoke-WebRequest -Uri "https://api.github.com/repos/$Owner/$Repo/actions/runs/$($Run.id)/logs" -Headers $Headers -OutFile $logZip | Out-Null
    Expand-Archive -LiteralPath $logZip -DestinationPath $logDir -Force

    $matches = @(Get-ChildItem -LiteralPath $logDir -Recurse -File |
      Select-String -Pattern "ERROR|Error|Failed|failed|Authentication error|Invalid access token|Missing GitHub secret|Process completed with exit code" -Encoding utf8 -Context 1,3)

    if ($matches.Count -gt 0) {
      Write-Host ""
      Write-Host "Key log lines:" -ForegroundColor Yellow
      $matches | Select-Object -Last 12 | ForEach-Object {
        Write-Host ($_.ToString())
      }
    }

    $allText = (Get-ChildItem -LiteralPath $logDir -Recurse -File | Get-Content -Encoding utf8 -Raw) -join "`n"
    if ($allText -match "Invalid access token|Authentication error") {
      Write-Host ""
      Write-Host "Likely fix:" -ForegroundColor Yellow
      Write-Host "GitHub secret CLOUDFLARE_API_TOKEN is invalid or expired."
      Write-Host "Create a fresh Cloudflare API token with Pages edit permission, then replace the GitHub repository secret named CLOUDFLARE_API_TOKEN."
    }
  } catch {
    Write-Host "Could not download workflow logs: $($_.Exception.Message)" -ForegroundColor Yellow
  }
}

function Wait-GitHubDeployment {
  param([string]$CommitSha)

  Write-Host ""
  Write-Host "Waiting for GitHub Actions deployment..."

  $run = $null
  for ($i = 1; $i -le 30; $i++) {
    $run = Get-WorkflowRunForCommit -CommitSha $CommitSha
    if ($run) {
      break
    }
    Start-Sleep -Seconds 4
  }

  if (!$run) {
    Write-Host "No GitHub Actions run appeared yet. Check manually: https://github.com/$Owner/$Repo/actions" -ForegroundColor Yellow
    return
  }

  Write-Host "Run: $($run.html_url)"
  while ($run.status -ne "completed") {
    Write-Host ("Status: {0}..." -f $run.status)
    Start-Sleep -Seconds 8
    $run = Invoke-GitHubApi -Method "Get" -Path "/repos/$Owner/$Repo/actions/runs/$($run.id)"
  }

  if ($run.conclusion -eq "success") {
    Write-Host ""
    Write-Host "Cloudflare Pages deployment succeeded." -ForegroundColor Green
    Write-Host "Site: https://galois37.top"
    return
  }

  Show-WorkflowFailureSummary -Run $run
  throw "GitHub Actions deployment failed."
}

function Get-RelativeSitePath {
  param([string]$InputPath)

  $full = (Get-Item -LiteralPath $InputPath).FullName
  if (!$full.StartsWith($siteRootFull, [StringComparison]::OrdinalIgnoreCase)) {
    throw "Path is outside site root: $InputPath"
  }
  return $full.Substring($siteRootFull.Length).TrimStart("\", "/")
}

function Get-RepoFiles {
  $excludedDirs = @(
    ".git",
    ".wrangler",
    "node_modules"
  )
  $excludedFiles = @(
    ".dev.vars"
  )

  Get-ChildItem -Path $siteRoot -Recurse -File -Force | Where-Object {
    $relative = Get-RelativeSitePath $_.FullName
    $parts = $relative -split "[\\/]"
    $hasExcludedDir = $false
    foreach ($part in $parts) {
      if ($excludedDirs -contains $part) {
        $hasExcludedDir = $true
        break
      }
    }
    (-not $hasExcludedDir) -and (-not ($excludedFiles -contains $_.Name))
  }
}

Write-Host "Reading GitHub main branch..."
$ref = Invoke-GitHubApi -Method "Get" -Path "/repos/$Owner/$Repo/git/ref/heads/$Branch"
$headSha = $ref.object.sha

$files = @(Get-RepoFiles)
Write-Host "Uploading $($files.Count) files to GitHub..."

$treeEntries = @()
$index = 0
foreach ($file in $files) {
  $index += 1
  $relativePath = (Get-RelativeSitePath $file.FullName).Replace("\", "/")
  Write-Host ("[{0}/{1}] {2}" -f $index, $files.Count, $relativePath)

  $bytes = [IO.File]::ReadAllBytes($file.FullName)
  $content = [Convert]::ToBase64String($bytes)
  $blob = Invoke-GitHubApi -Method "Post" -Path "/repos/$Owner/$Repo/git/blobs" -Body @{
    content = $content
    encoding = "base64"
  }

  $treeEntries += @{
    path = $relativePath
    mode = "100644"
    type = "blob"
    sha = $blob.sha
  }
}

Write-Host "Creating GitHub commit..."
$tree = Invoke-GitHubApi -Method "Post" -Path "/repos/$Owner/$Repo/git/trees" -Body @{
  tree = $treeEntries
}

$commit = Invoke-GitHubApi -Method "Post" -Path "/repos/$Owner/$Repo/git/commits" -Body @{
  message = $Message
  tree = $tree.sha
  parents = @($headSha)
}

Invoke-GitHubApi -Method "Patch" -Path "/repos/$Owner/$Repo/git/refs/heads/$Branch" -Body @{
  sha = $commit.sha
  force = $false
} | Out-Null

Write-Host ""
Write-Host "Pushed to GitHub: https://github.com/$Owner/$Repo/commit/$($commit.sha)"
Write-Host "GitHub Actions will deploy to Cloudflare Pages: https://github.com/$Owner/$Repo/actions"

if (-not $NoWait) {
  Wait-GitHubDeployment -CommitSha $commit.sha
}
