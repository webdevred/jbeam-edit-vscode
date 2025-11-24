$ErrorActionPreference = "Stop"

Write-Host "Creating directory $zipDir..."
$zipDir = "C:\jbeam-lsp-server"
New-Item -ItemType Directory -Force -Path $zipDir | Out-Null
Write-Host "Directory created."

$version = if ($env:VERSION) { 
    $env:VERSION 
} else { 
    "v0.0.4" 
}

$archiveName="jbeam-edit-$version-experimental.zip"

Write-Host "Downloading release $version from GitHub..."
gh release download $version --repo webdevred/jbeam_edit --pattern $archiveName --dir $zipDir
Write-Host "Download complete."

$zipPath = Join-Path $zipDir $archiveName
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
