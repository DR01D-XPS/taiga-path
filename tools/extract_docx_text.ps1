param(
  [string]$DocxPath = "..\\игра МП ф..docx",
  [string]$OutputPath = "..\\data\\scenario-source.txt"
)

Add-Type -AssemblyName System.IO.Compression.FileSystem

$resolvedDocx = Resolve-Path -LiteralPath $DocxPath
$resolvedOutput = Resolve-Path -LiteralPath (Split-Path -Parent $OutputPath) -ErrorAction SilentlyContinue

if (-not $resolvedOutput) {
  New-Item -ItemType Directory -Path (Split-Path -Parent $OutputPath) -Force | Out-Null
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($resolvedDocx)
$entry = $zip.Entries | Where-Object { $_.FullName -eq "word/document.xml" }

if (-not $entry) {
  $zip.Dispose()
  throw "Файл word/document.xml не найден в DOCX."
}

$reader = [System.IO.StreamReader]::new($entry.Open())
$xmlText = $reader.ReadToEnd()
$reader.Close()
$zip.Dispose()

[xml]$xml = $xmlText
$ns = New-Object System.Xml.XmlNamespaceManager($xml.NameTable)
$ns.AddNamespace("w", "http://schemas.openxmlformats.org/wordprocessingml/2006/main")

$paragraphs = $xml.SelectNodes("//w:p", $ns)
$lines = foreach ($p in $paragraphs) {
  $textNodes = $p.SelectNodes(".//w:t", $ns) | ForEach-Object { $_."#text" }
  $line = ($textNodes -join "")
  if ($line.Trim()) { $line }
}

$lines | Set-Content -Path $OutputPath -Encoding UTF8
Write-Host "Сохранено строк:" $lines.Count
Write-Host "Файл:" (Resolve-Path -LiteralPath $OutputPath)
