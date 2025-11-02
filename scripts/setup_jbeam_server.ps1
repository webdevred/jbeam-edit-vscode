$ErrorActionPreference = "Stop"

$zipDir = "C:\jbeam-lsp-server"
New-Item -ItemType Directory -Force -Path $zipDir | Out-Null

gh release download v0.0.4 --repo webdevred/jbeam_edit --pattern "jbeam-edit-v0.0.4-experimental.zip" --dir $zipDir

$zipPath = Join-Path $zipDir "jbeam-edit-v0.0.4-experimental.zip"
Expand-Archive $zipPath -DestinationPath $zipDir -Force

$setupExe = Join-Path $zipDir "jbeam-edit-setup.exe"
if (!(Test-Path $setupExe)) {
    Write-Host "ERROR: Setup executable not found."
    exit 1
}

Start-Process -FilePath $setupExe -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-" -Wait

$serverExe = "C:\Program Files (x86)\jbeam-edit\jbeam-lsp-server.exe"
if (!(Test-Path $serverExe)) {
    Write-Host "ERROR: jbeam-lsp-server.exe not found."
    exit 1
}
