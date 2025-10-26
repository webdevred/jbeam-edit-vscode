$ErrorActionPreference = "Stop"

Write-Host "Creating temporary installation directory..."
$zipDir = "C:\jbeam-lsp-server"
New-Item -ItemType Directory -Force -Path $zipDir | Out-Null

Write-Host "Downloading JBeam Edit release archive..."
gh release download v0.0.4 --repo webdevred/jbeam_edit --pattern "jbeam-edit-v0.0.4-experimental.zip" --dir $zipDir

Write-Host "Extracting archive..."
Expand-Archive "$zipDir\jbeam-edit-v0.0.4-experimental.zip" -DestinationPath $zipDir -Force

$setupExe = Join-Path $zipDir "jbeam-edit-setup.exe"
if (!(Test-Path $setupExe)) {
    Write-Host "ERROR: Setup executable not found. Extraction may have failed."
    exit 1
}

Write-Host "Running silent installer..."
Start-Process `
    -FilePath $setupExe `
    -ArgumentList "/VERYSILENT /SUPPRESSMSGBOXES /NORESTART /SP-" `
    -Wait

$installDir = "C:Program Files (x86)\jbeam-edit"

dir $installDir

Write-Host "Starting jbeam-lsp-server..."
Start-Process -FilePath "C:Program Files (x86)\jbeam-edit\jbeam-lsp-server.exe" -NoNewWindow

Write-Host "Install complete."
