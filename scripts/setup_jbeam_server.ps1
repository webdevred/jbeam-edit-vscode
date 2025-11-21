$ErrorActionPreference = "Stop"

Write-Host "Creating directory $zipDir..."
$zipDir = "C:\jbeam-lsp-server"
New-Item -ItemType Directory -Force -Path $zipDir | Out-Null
Write-Host "Directory created."

Write-Host "Downloading release v0.0.4 from GitHub..."
gh release download v0.0.4 --repo webdevred/jbeam_edit --pattern "jbeam-edit-v0.0.4-experimental.zip" --dir $zipDir
Write-Host "Download complete."

$zipPath = Join-Path $zipDir "jbeam-edit-v0.0.4-experimental.zip"
Write-Host "Extracting $zipPath..."
Expand-Archive $zipPath -DestinationPath $zipDir -Force
Write-Host "Extraction complete."

$setupExe = Join-Path $zipDir "jbeam-edit-setup.exe"
if (!(Test-Path $setupExe)) {
    Write-Host "ERROR: Setup executable not found."
    exit 1
}
Write-Host "Setup executable found. Launching installer..."

Start-Process -FilePath $setupExe -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-" -Wait
Write-Host "Installation complete."

$serverExe = "C:\Program Files (x86)\jbeam-edit\jbeam-lsp-server.exe"
if (!(Test-Path $serverExe)) {
    Write-Host "ERROR: jbeam-lsp-server.exe not found."
    exit 1
}
Write-Host "jbeam-lsp-server.exe found. Ready to run."
