param(
  [string]$Message
)

$ErrorActionPreference = "Stop"
$siteRoot = Split-Path -Parent $PSScriptRoot
Set-Location $siteRoot

if (!(Test-Path ".git")) {
  Write-Host "This folder is not a Git repository yet."
  Write-Host "Run the GitHub setup steps in GITHUB_SETUP.md first."
  exit 1
}

$status = git status --short
if (!$status) {
  Write-Host "No local changes to deploy."
  exit 0
}

if (!$Message) {
  $Message = "Update site assets $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
}

git add .
git commit -m $Message
git push

Write-Host ""
Write-Host "Pushed to GitHub. GitHub Actions should now deploy to Cloudflare Pages."
