param(
    [switch]$SkipChecks
)

$ErrorActionPreference = 'Stop'
$projectRoot = $PSScriptRoot
$npmScript = Join-Path $projectRoot 'scripts\npm.ps1'

Set-Location $projectRoot

if (-not (Test-Path '.env')) {
    Copy-Item '.env.example' '.env'
    Write-Host 'Created .env from .env.example.'
}

if (-not (Test-Path 'node_modules')) {
    Write-Host 'Installing dependencies...'
    & $npmScript install
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host 'Preparing the local database...'
& $npmScript run db:generate
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

& $npmScript run db:push
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if (-not $SkipChecks) {
    Write-Host 'Running typecheck, lint, tests, and production build...'
    & $npmScript run typecheck
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $npmScript run lint
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $npmScript test
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $npmScript run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}

Write-Host 'Starting Little Wonder at http://127.0.0.1:3000'
& $npmScript run dev
exit $LASTEXITCODE