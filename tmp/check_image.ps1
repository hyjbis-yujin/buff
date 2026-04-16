Add-Type -AssemblyName System.Drawing
$img = [System.Drawing.Image]::FromFile("src/assets/images/banner_260415.jpg")
Write-Host "Width: $($img.Width)"
Write-Host "Height: $($img.Height)"
$img.Dispose()
