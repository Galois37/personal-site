param(
  [string]$Message
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
