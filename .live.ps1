$ProgressPreference = 'SilentlyContinue'
$base = 'https://pratyush-dev-one.vercel.app'
$o = @()
for ($i = 0; $i -lt 16; $i++) {
  try {
    $r = Invoke-WebRequest "$base/" -UseBasicParsing -Headers @{ 'Cache-Control' = 'no-cache' }
    $classic = $r.Content.Contains('classic-site')
    $toggle = $r.Content.Contains('/__site?v=new')
    $o += "try $i : status $($r.StatusCode) | classic page: $classic | toggle: $toggle"
    if ($classic -and $toggle) { break }
  } catch { $o += "try $i : ERR $($_.Exception.Message)" }
  Start-Sleep 30
}
try {
  $s = New-Object Microsoft.PowerShell.Commands.WebRequestSession
  $r = Invoke-WebRequest "$base/__site?v=new" -WebSession $s -UseBasicParsing
  $o += "after New: new page: $($r.Content.Contains('main-content')) | classic page: $($r.Content.Contains('classic-site'))"
  $r = Invoke-WebRequest "$base/__site?v=classic" -WebSession $s -UseBasicParsing
  $o += "after Classic: classic page: $($r.Content.Contains('classic-site'))"
  foreach ($p in '/design', '/admin/login', '/sitemap.xml', '/api/keep-alive') {
    $r = Invoke-WebRequest "$base$p" -UseBasicParsing -SkipHttpErrorCheck -MaximumRedirection 0
    $o += "   $p -> $($r.StatusCode)"
  }
} catch { $o += "ERR $($_.Exception.Message)" }
$o | Out-File "$env:TEMP\live.txt" -Encoding utf8
