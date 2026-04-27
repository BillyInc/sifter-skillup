param(
    [switch]$Web,
    [switch]$Clear,
    [switch]$Tunnel
)

$repoRoot = Split-Path -Parent $PSScriptRoot
Set-Location $repoRoot

$args = @('expo', 'start')
if ($Web) {
    $args += '--web'
}
if ($Clear) {
    $args += '--clear'
}
if ($Tunnel) {
    $args += '--tunnel'
}

& npx @args
exit $LASTEXITCODE
