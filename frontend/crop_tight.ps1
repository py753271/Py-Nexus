Add-Type -AssemblyName System.Drawing

$imgPath = "d:\internship\project\project\skillnova\skillnova\public\logo.png.bak"
if (-not (Test-Path $imgPath)) {
    Write-Host "Error: logo.png.bak not found at $imgPath"
    exit 1
}

$bmp = New-Object System.Drawing.Bitmap($imgPath)
$width = $bmp.Width
$height = $bmp.Height

Write-Host "Original dimensions: $width x $height"

$minX = $width
$maxX = 0
$minY = $height
$maxY = 0

for ($y = 0; $y -lt $height; $y++) {
    for ($x = 0; $x -lt $width; $x++) {
        $pixel = $bmp.GetPixel($x, $y)
        $isBg = $false
        
        # Transparent is background
        if ($pixel.A -eq 0) {
            $isBg = $true
        }
        # White is background
        elseif ($pixel.R -gt 245 -and $pixel.G -gt 245 -and $pixel.B -gt 245) {
            $isBg = $true
        }
        
        if (-not $isBg) {
            if ($x -lt $minX) { $minX = $x }
            if ($x -gt $maxX) { $maxX = $x }
            if ($y -lt $minY) { $minY = $y }
            if ($y -gt $maxY) { $maxY = $y }
        }
    }
}

$bmp.Dispose()

Write-Host "Bounding box of logo content:"
Write-Host "minX: $minX"
Write-Host "maxX: $maxX"
Write-Host "minY: $minY"
Write-Host "maxY: $maxY"
