param(
  [int]$Port = 4173,
  [string]$ProjectRoot = "E:\informatica\vnm"
)

$ErrorActionPreference = "SilentlyContinue"

$runDir = Join-Path $ProjectRoot ".run"
New-Item -ItemType Directory -Path $runDir -Force | Out-Null

$serverOut = Join-Path $runDir "server.out.log"
$serverErr = Join-Path $runDir "server.err.log"
$tunnelOut = Join-Path $runDir "ssh-tunnel.out.log"
$tunnelErr = Join-Path $runDir "ssh-tunnel.err.log"
$urlFile = Join-Path $runDir "public-url.txt"

function Get-ServerProcess {
  Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -eq "python.exe" -and
      $_.CommandLine -match "http\.server\s+$Port" -and
      $_.CommandLine -match "127\.0\.0\.1"
    } |
    Select-Object -First 1
}

function Get-TunnelProcess {
  Get-CimInstance Win32_Process |
    Where-Object {
      $_.Name -eq "ssh.exe" -and
      $_.CommandLine -match "localhost\.run" -and
      $_.CommandLine -match "127\.0\.0\.1:$Port"
    } |
    Select-Object -First 1
}

function Start-Server {
  Start-Process -FilePath "python" `
    -ArgumentList @("-m", "http.server", "$Port", "--bind", "127.0.0.1") `
    -WorkingDirectory $ProjectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $serverOut `
    -RedirectStandardError $serverErr | Out-Null
}

function Start-Tunnel {
  Start-Process -FilePath "ssh.exe" `
    -ArgumentList @(
      "-o", "StrictHostKeyChecking=no",
      "-o", "ServerAliveInterval=30",
      "-o", "ServerAliveCountMax=3",
      "-o", "ExitOnForwardFailure=yes",
      "-R", "80:127.0.0.1:$Port",
      "nokey@localhost.run"
    ) `
    -WorkingDirectory $ProjectRoot `
    -WindowStyle Hidden `
    -RedirectStandardOutput $tunnelOut `
    -RedirectStandardError $tunnelErr | Out-Null
}

function Stop-Tunnel {
  $tp = Get-TunnelProcess
  if ($tp) {
    Stop-Process -Id $tp.ProcessId -Force -ErrorAction SilentlyContinue
  }
}

function Extract-UrlFromLog {
  if (!(Test-Path $tunnelOut)) {
    return $null
  }

  $text = Get-Content $tunnelOut -Raw -ErrorAction SilentlyContinue
  if (!$text) {
    return $null
  }

  $m = [regex]::Match($text, "https://[a-z0-9\-]+\.[a-z0-9\-]+\.[a-z]{2,}")
  if ($m.Success) {
    return $m.Value
  }

  $m2 = [regex]::Match($text, "([a-z0-9\-]+\.[a-z0-9\-]+\.[a-z]{2,}) tunneled with tls termination")
  if ($m2.Success) {
    return "https://" + $m2.Groups[1].Value
  }

  return $null
}

function Save-Url([string]$url) {
  if (!$url) {
    return
  }

  $prev = if (Test-Path $urlFile) { Get-Content $urlFile -ErrorAction SilentlyContinue | Select-Object -First 1 } else { "" }
  if ($prev -ne $url) {
    Set-Content -Path $urlFile -Value $url -Encoding UTF8
  }
}

function Test-UrlHealthy([string]$url) {
  if (!$url) {
    return $false
  }

  try {
    $resp = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 12
    return ($resp.StatusCode -ge 200 -and $resp.StatusCode -lt 400)
  } catch {
    return $false
  }
}

$tick = 0

while ($true) {
  $server = Get-ServerProcess
  if (!$server) {
    Start-Server
    Start-Sleep -Seconds 1
  }

  $tunnel = Get-TunnelProcess
  if (!$tunnel) {
    Start-Tunnel
    Start-Sleep -Seconds 3
  }

  $url = Extract-UrlFromLog
  Save-Url $url

  # Раз в ~2 минуты проверяем, что внешний URL живой. Если нет - перезапускаем туннель.
  if (($tick % 24) -eq 0 -and $url) {
    if (!(Test-UrlHealthy $url)) {
      Stop-Tunnel
      Start-Sleep -Seconds 1
      Start-Tunnel
      Start-Sleep -Seconds 3
      $url = Extract-UrlFromLog
      Save-Url $url
    }
  }

  $tick += 1
  Start-Sleep -Seconds 5
}

