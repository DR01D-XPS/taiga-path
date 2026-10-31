$urlFile = "E:\informatica\vnm\.run\public-url.txt"

if (Test-Path $urlFile) {
  Get-Content $urlFile | Select-Object -First 1
} else {
  Write-Output "URL not ready yet."
}

