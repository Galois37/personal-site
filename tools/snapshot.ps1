param(
  [string]$Label = "manual",
  [switch]$IncludeLargeAssets
)

$ErrorActionPreference = "Stop"
$siteRoot = Split-Path -Parent $PSScriptRoot
$taskRoot = Split-Path -Parent (Split-Path -Parent $siteRoot)
$backupRoot = Join-Path $taskRoot "backups"

if (!(Test-Path -LiteralPath $backupRoot)) {
  New-Item -ItemType Directory -Path $backupRoot | Out-Null
}

$safeLabel = ($Label -replace "[^A-Za-z0-9._-]", "-").Trim("-")
if (!$safeLabel) {
  $safeLabel = "manual"
}

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$destination = Join-Path $backupRoot "personal-site-$safeLabel-$timestamp.zip"
$tempRoot = Join-Path $env:TEMP "personal-site-snapshot-$timestamp"

if (Test-Path -LiteralPath $tempRoot) {
  Remove-Item -LiteralPath $tempRoot -Recurse -Force
}

New-Item -ItemType Directory -Path $tempRoot | Out-Null

$sourceName = Split-Path -Leaf $siteRoot
$stagingRoot = Join-Path $tempRoot $sourceName
New-Item -ItemType Directory -Path $stagingRoot | Out-Null

$excludeDirs = @(".git", ".wrangler", "node_modules")
$excludeFiles = @("*.log", "Thumbs.db", ".DS_Store")

Get-ChildItem -LiteralPath $siteRoot -Recurse -Force | ForEach-Object {
  $relative = $_.FullName.Substring($siteRoot.Length).TrimStart("\", "/")
  $parts = $relative -split "[\\/]"

  if ($parts.Count -gt 0 -and ($excludeDirs -contains $parts[0])) {
    return
  }

  if (!$IncludeLargeAssets -and $relative -match "^assets[\\/]music[\\/]") {
    return
  }

  if (!$_.PSIsContainer) {
    foreach ($pattern in $excludeFiles) {
      if ($_.Name -like $pattern) { return }
    }
  }

  $target = Join-Path $stagingRoot $relative
  if ($_.PSIsContainer) {
    if (!(Test-Path -LiteralPath $target)) {
      New-Item -ItemType Directory -Path $target | Out-Null
    }
    return
  }

  $targetParent = Split-Path -Parent $target
  if (!(Test-Path -LiteralPath $targetParent)) {
    New-Item -ItemType Directory -Path $targetParent | Out-Null
  }
  Copy-Item -LiteralPath $_.FullName -Destination $target -Force
}

Compress-Archive -LiteralPath $stagingRoot -DestinationPath $destination -Force
Remove-Item -LiteralPath $tempRoot -Recurse -Force

Write-Host "Snapshot created:"
Write-Host $destination
if (!$IncludeLargeAssets) {
  Write-Host "Note: assets\music was skipped. Re-run with -IncludeLargeAssets for a full media backup."
}
