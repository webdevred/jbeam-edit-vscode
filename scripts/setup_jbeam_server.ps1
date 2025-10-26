$ErrorActionPreference = "Stop"

$installDir = "C:\jbeam-lsp-server"
New-Item -ItemType Directory -Force -Path $installDir

gh release download v0.0.4 --repo webdevred/jbeam_edit --pattern "jbeam-edit-v0.0.4-experimental.zip" --dir $installDir

$zipPath = Join-Path $installDir "jbeam-edit-v0.0.4-experimental.zip"
Expand-Archive -Path $zipPath -DestinationPath $installDir -Force
$setupExe = Join-Path $installDir "jbeam-edit-setup.exe"

Start-Process -FilePath $setupExe -ArgumentList "/S" -NoNewWindow
Start-Sleep -Seconds 60

Start-Process -FilePath "jbeam-lsp-server" -NoNewWindow

Write-Host "jbeam-lsp-server installerad och startad via PATH"
