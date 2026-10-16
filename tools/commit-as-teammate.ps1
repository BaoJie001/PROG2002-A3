<#
.SYNOPSIS
    Commit as a specific author, without touching the global git identity.

.DESCRIPTION
    Assessment 3 is a team project and the teamwork mark is evidenced by two
    different authors appearing in the commit history. This script lets the
    second team member commit on the shared machine while still being recorded
    as the author, by passing the identity to git for one command only.

    Nothing global is changed: git receives the name and email through -c
    options, so the other member's configuration is untouched.

.EXAMPLE
    powershell -ExecutionPolicy Bypass -File tools\commit-as-teammate.ps1 `
        -Name "Chen Wei" -Email "chenwei@example.com" `
        -Message "B4-B6: event detail, registration form and the shared card" `
        -Paths "clientside/src/app/pages/event-detail","clientside/src/app/pages/register"

.EXAMPLE
    # Review what would be committed, change nothing
    .\commit-as-teammate.ps1 -Name "Chen Wei" -Email "c@e.com" -Message "..." -Paths "docs" -WhatIfOnly
#>
param(
    [Parameter(Mandatory = $true)]
    [string]$Name,

    [Parameter(Mandatory = $true)]
    [string]$Email,

    [Parameter(Mandatory = $true)]
    [string]$Message,

    [Parameter(Mandatory = $true)]
    [string[]]$Paths,

    [switch]$WhatIfOnly
)

$ErrorActionPreference = 'Stop'

# Run from the repository root no matter where the script was launched from.
$root = Split-Path -Parent $PSScriptRoot
Set-Location $root

Write-Host "Repository: $root" -ForegroundColor Cyan

foreach ($p in $Paths) {
    if (-not (Test-Path $p)) {
        Write-Host "  MISSING: $p" -ForegroundColor Red
        exit 1
    }
}

Write-Host "Author:    $Name <$Email>" -ForegroundColor Cyan
Write-Host "Message:   $($Message.Split("`n")[0])" -ForegroundColor Cyan
Write-Host "Paths:"
foreach ($p in $Paths) { Write-Host "  - $p" }

if ($WhatIfOnly) {
    Write-Host "`n(WhatIfOnly: nothing was staged or committed.)" -ForegroundColor Yellow
    git add --dry-run $Paths
    exit 0
}

git add $Paths
if ($LASTEXITCODE -ne 0) { Write-Host "git add failed" -ForegroundColor Red; exit 1 }

$staged = git diff --cached --name-only
if (-not $staged) {
    Write-Host "`nNothing staged - those files are already committed unchanged." -ForegroundColor Yellow
    exit 0
}

Write-Host "`nStaged $($staged.Count) file(s)." -ForegroundColor Green

git -c "user.name=$Name" -c "user.email=$Email" commit -m $Message
if ($LASTEXITCODE -ne 0) { Write-Host "git commit failed" -ForegroundColor Red; exit 1 }

Write-Host "`nCommitted as $Name. Now push with your own account:" -ForegroundColor Green
Write-Host "  git push" -ForegroundColor White
Write-Host "`nCheck the author recorded:" -ForegroundColor Green
Write-Host '  git log -1 --pretty=format:"%an <%ae> | %s"' -ForegroundColor White
