param(
  [switch]$Strict
)

$ErrorActionPreference = "Stop"
$siteRoot = Split-Path -Parent $PSScriptRoot
Set-Location $siteRoot

$errors = New-Object System.Collections.Generic.List[string]
$warnings = New-Object System.Collections.Generic.List[string]

function Add-CheckError {
  param([string]$Message)
  $errors.Add($Message) | Out-Null
  Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Add-CheckWarning {
  param([string]$Message)
  $warnings.Add($Message) | Out-Null
  Write-Host "[WARN]  $Message" -ForegroundColor Yellow
}

function Add-CheckOk {
  param([string]$Message)
  Write-Host "[OK]    $Message" -ForegroundColor Green
}

function Get-CommandPath {
  param([string]$Name)
  $cmd = Get-Command $Name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

function Get-NodePath {
  $taskRoot = Split-Path -Parent (Split-Path -Parent $siteRoot)
  $localNode = Join-Path $taskRoot "work\tools\node-v24.16.0-win-x64\node.exe"
  if (Test-Path -LiteralPath $localNode) { return $localNode }

  $node = Get-CommandPath "node"
  if ($node) { return $node }

  return $null
}

Write-Host "Maintenance check for: $siteRoot"
Write-Host ""

$requiredFiles = @(
  "index.html",
  "about.html",
  "notes.html",
  "articles.html",
  "ask.html",
  "archive.html",
  "moments.html",
  "friends.html",
  "music.html",
  "admin.html",
  "script.js",
  "admin.js",
  "styles.css",
  "wrangler.toml",
  "schema.sql",
  ".github\workflows\deploy.yml",
  "HANDOFF_CONTEXT.md",
  "MAINTENANCE.md",
  "CHANGELOG.md"
)

foreach ($file in $requiredFiles) {
  if (Test-Path -LiteralPath (Join-Path $siteRoot $file)) {
    Add-CheckOk "Required file exists: $file"
  } else {
    Add-CheckError "Missing required file: $file"
  }
}

Write-Host ""
if (Test-Path -LiteralPath ".git") {
  $status = @(git status --short)
  if ($status.Count -eq 0) {
    Add-CheckOk "Git working tree is clean"
  } else {
    Add-CheckWarning "Git working tree has $($status.Count) changed path(s)"
    $status | Select-Object -First 40 | ForEach-Object { Write-Host "        $_" }
    if ($status.Count -gt 40) {
      Write-Host "        ... $($status.Count - 40) more"
    }
  }
} else {
  Add-CheckError "Site root is not a Git repository"
}

Write-Host ""
$nodePath = Get-NodePath
if (!$nodePath) {
  Add-CheckWarning "Node.js not found; skipped JavaScript syntax checks"
} else {
  Add-CheckOk "Using Node.js: $nodePath"
  $jsFiles = Get-ChildItem -LiteralPath $siteRoot -Recurse -File |
    Where-Object {
      $_.Extension -eq ".js" -and
      $_.FullName -notmatch "\\.git\\" -and
      $_.FullName -notmatch "\\.wrangler\\" -and
      $_.FullName -notmatch "\\node_modules\\"
    }

  foreach ($file in $jsFiles) {
    $relative = $file.FullName.Substring($siteRoot.Length).TrimStart("\", "/")
    try {
      & $nodePath --check $file.FullName *> $null
      if ($LASTEXITCODE -eq 0) {
        Add-CheckOk "JavaScript syntax ok: $relative"
      } else {
        Add-CheckError "JavaScript syntax failed: $relative"
      }
    } catch {
      Add-CheckWarning "Could not run Node.js syntax check for $relative`: $($_.Exception.Message)"
      break
    }
  }
}

Write-Host ""
$highRiskSecretPattern = "ghp_[A-Za-z0-9_]{20,}|github_pat_[A-Za-z0-9_]{20,}|sk-[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|AKIA[0-9A-Z]{16}|(?i)cloudflare[a-z0-9_-]*[_-]?api[_-]?token\s*[:=]\s*['""][^'""]{12,}|(?i)admin[_-]?session[_-]?token\s*[:=]\s*['""][^'""]{12,}"
$scanFiles = Get-ChildItem -LiteralPath $siteRoot -Recurse -File |
  Where-Object {
    $_.FullName -notmatch "\\.git\\" -and
    $_.FullName -notmatch "\\.wrangler\\" -and
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\assets\\music\\" -and
    $_.Extension -in @(".js", ".html", ".toml", ".md", ".bat", ".ps1", ".yml", ".yaml", ".sql", ".css", ".txt")
  }

$secretMatches = @()
if ($scanFiles.Count -gt 0) {
  $secretMatches = @(Select-String -Path $scanFiles.FullName -Pattern $highRiskSecretPattern -ErrorAction SilentlyContinue)
}

if ($secretMatches.Count -eq 0) {
  Add-CheckOk "No high-risk literal secret patterns found in scanned source files"
} else {
  Add-CheckWarning "Found $($secretMatches.Count) high-risk literal secret pattern(s); review path and line number only"
  $secretMatches | Select-Object -First 60 | ForEach-Object {
    $relative = $_.Path.Substring($siteRoot.Length).TrimStart("\", "/")
    Write-Host ("        {0}:{1}" -f $relative, $_.LineNumber)
  }
  if ($secretMatches.Count -gt 60) {
    Write-Host "        ... $($secretMatches.Count - 60) more"
  }
}

Write-Host ""
Write-Host "Summary: $($errors.Count) error(s), $($warnings.Count) warning(s)"

if ($errors.Count -gt 0) {
  exit 1
}

if ($Strict -and $warnings.Count -gt 0) {
  exit 1
}

exit 0
