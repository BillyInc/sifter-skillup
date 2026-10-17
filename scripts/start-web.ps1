param(
    [string]$HostAddress = '127.0.0.1',
    [int]$Port = 5173
)

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$viteCli = Join-Path $repoRoot 'node_modules\vite\bin\vite.js'
if (-not (Test-Path -LiteralPath $viteCli -PathType Leaf)) {
    throw "The local Vite CLI was not found at $viteCli. Restore project dependencies first."
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
    throw 'node.exe was not found. Install Node.js or repair PATH, then rerun this task.'
}

$viteConfig = Join-Path $repoRoot 'web\vite.config.mjs'
& $nodeCommand.Source $viteCli --config $viteConfig --host $HostAddress --port "$Port" --strictPort
$childExitCode = $LASTEXITCODE
if ($null -eq $childExitCode) {
    throw 'Vite exited without reporting a child-process exit code.'
}
exit $childExitCode
