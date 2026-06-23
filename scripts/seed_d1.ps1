# Resumable D1 seeder: runs each SQL file in order against the remote 'silsilah' DB.
# Idempotent (schema IF NOT EXISTS, data INSERT OR IGNORE), so re-running resumes safely.
$ErrorActionPreference = 'Continue'
$root = 'C:\Users\Jonathan\Desktop\HadithCriticBlog'
$seedDir = Join-Path $root 'scripts\d1seed'
$marker = Join-Path $seedDir '.seeded'
Set-Location $root
if (-not (Test-Path $marker)) { New-Item -ItemType File $marker | Out-Null }
$done = Get-Content $marker -ErrorAction SilentlyContinue
$files = Get-ChildItem $seedDir -Filter *.sql | Sort-Object Name
Write-Host ("Seeding {0} files to D1 'silsilah'..." -f $files.Count) -ForegroundColor Cyan
foreach ($f in $files) {
  if ($done -contains $f.Name) { Write-Host ("skip (done) {0}" -f $f.Name) -ForegroundColor DarkGray; continue }
  $t = Get-Date
  Write-Host ("`n[{0}] importing {1} ({2:N1} MB)..." -f (Get-Date -Format HH:mm:ss), $f.Name, ($f.Length/1MB)) -ForegroundColor Cyan
  $out = & npx --yes wrangler d1 execute silsilah --remote --file=$($f.FullName) 2>&1 | Out-String
  if ($out -match '"success": true' -or $out -match 'Executed \d+ queries' -or $out -match 'queries executed') {
    Add-Content $marker $f.Name
    $secs = [int]((Get-Date)-$t).TotalSeconds
    $written = if ($out -match 'rows written":?\s*"?(\d+)') { $matches[1] } else { '?' }
    Write-Host ("  OK in {0}s (rows written: {1})" -f $secs, $written) -ForegroundColor Green
  } else {
    Write-Host ("  FAILED: {0}" -f $f.Name) -ForegroundColor Red
    Write-Host ($out -split "`n" | Select-Object -Last 8 | Out-String) -ForegroundColor Yellow
    Write-Host "Stopping. Fix and re-run this script to resume." -ForegroundColor Red
    exit 1
  }
}
Write-Host "`n=== D1 SEED COMPLETE ===" -ForegroundColor Green
& npx --yes wrangler d1 execute silsilah --remote --command="SELECT (SELECT COUNT(*) FROM hadith) AS hadith, (SELECT COUNT(*) FROM hadith_fts) AS fts, (SELECT COUNT(*) FROM collections) AS collections, (SELECT COUNT(*) FROM books) AS books;" 2>&1 | Out-String | Write-Host
