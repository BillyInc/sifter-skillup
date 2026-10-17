param(
    [switch]$Web,
    [switch]$Clear,
    [switch]$Tunnel
)

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$expoCli = Join-Path $repoRoot 'node_modules/expo/bin/cli'
if (-not (Test-Path -LiteralPath $expoCli -PathType Leaf)) {
    throw "The local Expo CLI was not found at $expoCli. Run the repository's dependency install first."
}

$nodeCommand = Get-Command node.exe -ErrorAction SilentlyContinue
if (-not $nodeCommand) {
    throw 'node.exe was not found. Install Node.js or repair PATH, then rerun this script.'
}

$startArgs = @($expoCli, 'start')
if ($Web) {
    $startArgs += '--web'
}
if ($Clear) {
    $startArgs += '--clear'
}
if ($Tunnel) {
    $startArgs += '--tunnel'
}

# Run the checked-in CLI with node.exe directly. This avoids PowerShell's
# npx.ps1 shim, npm/npx network resolution and package-manager shell ambiguity.
& $nodeCommand.Source @startArgs
$childExitCode = $LASTEXITCODE
if ($null -eq $childExitCode) {
    throw 'Expo exited without reporting a child-process exit code.'
}
exit $childExitCode
