$ErrorActionPreference = "Stop"

$packageJson = Get-Content package.json | ConvertFrom-Json
$minVersion = $packageJson.requiredJbeamEditVersion
$minVscodeVersion = $packageJson.engines.vscode -replace '^[^\d]+', ''

$releases = gh release list --repo webdevred/jbeam_edit |
    ForEach-Object { ($_ -split '\s+')[0] -replace '^v', '' } |
    Where-Object { $_ -match '^\d+\.\d+\.\d+$' } |
    Sort-Object { [Version]$_ }

$selectedRelease = $releases |
    Where-Object { [Version]$_ -gt [Version]$minVersion } |
    Select-Object -Last 1

$jbeamVersions = @("v$minVersion")
if ($selectedRelease) {
    $jbeamVersions += "v$selectedRelease"
}

$vscodeVersions = @($minVscodeVersion, "stable")

$matrix = @()
foreach ($jbeam in $jbeamVersions) {
    foreach ($vscode in $vscodeVersions) {
        $matrix += @{ jbeam_lsp_server = $jbeam; vscode_version = $vscode }
    }
}

$matrixJson = [pscustomobject]@{ include = $matrix } | ConvertTo-Json -Compress -Depth 3

Write-Host $matrixJson

if ($env:GITHUB_OUTPUT) {
    "matrix=$matrixJson" | Out-File -FilePath $env:GITHUB_OUTPUT -Append -Encoding utf8NoBOM
}
