Add-Type -AssemblyName System.Drawing
$b = [System.Drawing.Bitmap]::FromFile('d:\internship\project\project\skillnova\skillnova\public\logo.png.bak')
$w = $b.Width
$h = $b.Height

Write-Host "Row profile (every 10 rows):"
for ($y = 0; $y -lt $h; $y += 10) {
    $count = 0
    for ($x = 0; $x -lt $w; $x++) {
        $p = $b.GetPixel($x, $y)
        $isBg = ($p.A -eq 0) -or ($p.R -gt 245 -and $p.G -gt 245 -and $p.B -gt 245)
        if (-not $isBg) { $count++ }
    }
    if ($count -gt 5) {
        Write-Host "Row $($y) : $($count) pixels"
    }
}

Write-Host "`nColumn profile (every 10 columns):"
for ($x = 0; $x -lt $w; $x += 10) {
    $count = 0
    for ($y = 0; $y -lt $h; $y++) {
        $p = $b.GetPixel($x, $y)
        $isBg = ($p.A -eq 0) -or ($p.R -gt 245 -and $p.G -gt 245 -and $p.B -gt 245)
        if (-not $isBg) { $count++ }
    }
    if ($count -gt 5) {
        Write-Host "Col $($x) : $($count) pixels"
    }
}
$b.Dispose()
