param(
    [int]$Port = 8000,
    [switch]$NoReload
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
Set-Location $backendDir

$commonArgs = @('main:app', '--host', '0.0.0.0', '--port', "$Port")
if (-not $NoReload) {
    $commonArgs += '--reload'
}

if (Get-Command uv -ErrorAction SilentlyContinue) {
    & uv run uvicorn @commonArgs
    exit $LASTEXITCODE
}

if (Get-Command python -ErrorAction SilentlyContinue) {
    & python -m uvicorn @commonArgs
    exit $LASTEXITCODE
}

throw 'Neither uv nor python is available in this PowerShell session.'
