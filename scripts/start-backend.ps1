param(
    [int]$Port = 8000,
    [switch]$NoReload
)

$repoRoot = Split-Path -Parent $PSScriptRoot
$backendDir = Join-Path $repoRoot 'backend'
Set-Location $backendDir

$pythonExe = Join-Path $backendDir '.venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $pythonExe -PathType Leaf)) {
    $pythonCommand = Get-Command python.exe -ErrorAction SilentlyContinue
    if (-not $pythonCommand) {
        throw 'The backend virtual environment and python.exe were not found.'
    }
    $pythonExe = $pythonCommand.Source
}

$commonArgs = @('main:app', '--host', '0.0.0.0', '--port', "$Port")
if (-not $NoReload) {
    $commonArgs += '--reload'
}

& $pythonExe -m uvicorn @commonArgs
$childExitCode = $LASTEXITCODE
if ($null -eq $childExitCode) {
    throw 'Uvicorn exited without reporting a child-process exit code.'
}
exit $childExitCode
