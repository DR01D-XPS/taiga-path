param(
  [int]$Port = 4173,
  [string]$ProjectRoot = "E:\informatica\vnm"
)

$runDir = Join-Path $ProjectRoot ".run"
$watchdogPidFile = Join-Path $runDir "watchdog.pid"

if (Test-Path $watchdogPidFile) {
  $pid = Get-Content $watchdogPidFile -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($pid) {
    Stop-Process -Id ([int]$pid) -Force -ErrorAction SilentlyContinue
  }
  Remove-Item $watchdogPidFile -Force -ErrorAction SilentlyContinue
}

Get-CimInstance Win32_Process |
  Where-Object {
    ($_.Name -eq "ssh.exe" -and $_.CommandLine -match "localhost\.run") -or
    ($_.Name -eq "python.exe" -and $_.CommandLine -match "http\.server\s+$Port" -and $_.CommandLine -match "127\.0\.0\.1")
  } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }

Write-Output "public tunnel stopped"

