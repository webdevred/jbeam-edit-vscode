$ErrorActionPreference = "Stop"

Write-Host "Creating temporary installation directory..."
$installDir = "C:\jbeam-lsp-server"
New-Item -ItemType Directory -Force -Path $installDir | Out-Null

Write-Host "Downloading JBeam Edit release archive..."
gh release download v0.0.4 --repo webdevred/jbeam_edit --pattern "jbeam-edit-v0.0.4-experimental.zip" --dir $installDir

Write-Host "Extracting archive..."
Expand-Archive "$installDir\jbeam-edit-v0.0.4-experimental.zip" -DestinationPath $installDir -Force

$setupExe = Join-Path $installDir "jbeam-edit-setup.exe"
if (!(Test-Path $setupExe)) {
    Write-Host "ERROR: Setup executable not found. Extraction may have failed."
    exit 1
}

Write-Host "Running silent installer..."
Start-Process `
    -FilePath $setupExe `
    -ArgumentList "/SUPPRESSMSGBOXES /NORESTART /SP-" `
    -Wait

Write-Host "Checking PATH for jbeam-lsp-server..."
$serverCmd = Get-Command "jbeam-lsp-server" -ErrorAction SilentlyContinue
if (!$serverCmd) {
    Write-Host "ERROR: jbeam-lsp-server not found on PATH after installation."
    exit 1
}

Write-Host "Starting jbeam-lsp-server..."
Start-Process -FilePath "jbeam-lsp-server" -ArgumentList "--stdio" -NoNewWindow

Write-Host "Install complete."
