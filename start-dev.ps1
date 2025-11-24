# Kill any process using port 3000
Write-Host "Checking for processes on port 3000..." -ForegroundColor Yellow

$port = 3000
$processId = Get-NetTCPConnection -LocalPort $port -ErrorAction SilentlyContinue | Select-Object -ExpandProperty OwningProcess -Unique

if ($processId) {
    Write-Host "Found process $processId using port $port. Terminating..." -ForegroundColor Red
    Stop-Process -Id $processId -Force -ErrorAction SilentlyContinue
    Start-Sleep -Seconds 2
    Write-Host "Process terminated." -ForegroundColor Green
} else {
    Write-Host "No process found on port $port." -ForegroundColor Green
}

# Start the dev server
Write-Host "`nStarting development server..." -ForegroundColor Cyan
npm run dev
