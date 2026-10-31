# Public Tunnel (Auto-Restart)

This project is configured to keep a public link alive with an auto-restart watchdog.

## Start

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File E:\informatica\vnm\tools\start_public_tunnel.ps1
```

## Current URL

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File E:\informatica\vnm\tools\get_public_url.ps1
```

The URL is also written to:

`E:\informatica\vnm\.run\public-url.txt`

## Stop

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File E:\informatica\vnm\tools\stop_public_tunnel.ps1
```

## Auto-start on Windows login

Startup launcher created:

`C:\Users\ilyli\AppData\Roaming\Microsoft\Windows\Start Menu\Programs\Startup\VNPublicTunnelWatchdog.cmd`

It starts the watchdog automatically after login.

