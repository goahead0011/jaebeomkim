param(
  [string]$Root = (Resolve-Path (Join-Path $PSScriptRoot "..")).Path,
  [string]$Version = (Get-Date -Format "yyyyMMddHHmmss"),
  [switch]$IncludeBackups
)

$ErrorActionPreference = "Stop"

$pattern = '(?<prefix><link\b[^>]*\brel=["'"'"']stylesheet["'"'"'][^>]*\bhref=["'"'"'](?<path>[^"'"'"'?]+\.css))(\?v=\d+)?(?<suffix>["'"'"'][^>]*>)'
$updated = 0

$htmlFiles = Get-ChildItem -Path $Root -Recurse -File -Filter "*.html" | Where-Object {
  if ($IncludeBackups) {
    return $true
  }

  return $_.FullName -notmatch "\\backup_[^\\]+\\"
}

$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

foreach ($file in $htmlFiles) {
  $content = [System.IO.File]::ReadAllText($file.FullName)

  $newContent = [regex]::Replace(
    $content,
    $pattern,
    {
      param($m)
      "$($m.Groups['prefix'].Value)?v=$Version$($m.Groups['suffix'].Value)"
    },
    [System.Text.RegularExpressions.RegexOptions]::IgnoreCase
  )

  if ($newContent -ne $content) {
    [System.IO.File]::WriteAllText($file.FullName, $newContent, $utf8NoBom)
    $updated++
    Write-Host "Updated: $($file.FullName)"
  }
}

Write-Host "Version: $Version"
Write-Host "Files updated: $updated"
