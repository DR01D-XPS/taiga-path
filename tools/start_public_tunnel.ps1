param(
  [int]$Port = 4173,
  [string]$ProjectRoot = "E:\informatica\vnm"
)

$runDir = Join-Path $ProjectRoot ".run"
New-Item -ItemType Directory -Path $runDir -Force | Out-Null

$watchdogPidFile = Join-Path $runDir "watchdog.pid"

if (Test-Path $watchdogPidFile) {
  $oldPid = Get-Content $watchdogPidFile -ErrorAction SilentlyContinue | Select-Object -First 1
  if ($oldPid) {
    Stop-Process -Id ([int]$oldPid) -Force -ErrorAction SilentlyContinue
  }
  Remove-Item $watchdogPidFile -Force -ErrorAction SilentlyContinue
}

# Чистим старые одноразовые процессы, чтобы не плодить дубли.
Get-CimInstance Win32_Process |
  Where-Object {
    ($_.Name -eq "ssh.exe" -and $_.CommandLine -match "localhost\.run") -or
    ($_.Name -eq "python.exe" -and $_.CommandLine -match "http\.server\s+$Port" -and $_.CommandLine -match "127\.0\.0\.1")
  } |
  ForEach-Object {
    Stop-Process -Id $_.ProcessId -Force -ErrorAction SilentlyContinue
  }

$watchScript = Join-Path $ProjectRoot "tools\watch_public_tunnel.ps1"
$proc = Start-Process -FilePath "powershell.exe" `
  -ArgumentList @(
    "-NoProfile",
    "-ExecutionPolicy", "Bypass",
    "-File", $watchScript,
    "-Port", "$Port",
    "-ProjectRoot", $ProjectRoot
  ) `
  -WindowStyle Hidden `
  -PassThru

Set-Content -Path $watchdogPidFile -Value $proc.Id -Encoding UTF8

Start-Sleep -Seconds 4

$urlFile = Join-Path $runDir "public-url.txt"
$url = if (Test-Path $urlFile) { Get-Content $urlFile -ErrorAction SilentlyContinue | Select-Object -First 1 } else { $null }

Write-Output "watchdog_pid=$($proc.Id)"
if ($url) {
  Write-Output "public_url=$url"
} else {
  Write-Output "public_url=waiting..."
}

