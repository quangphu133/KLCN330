# Ghi chú nhóm: Script khởi tạo và chạy backend ở chế độ mô phỏng.
$ErrorActionPreference = 'Stop'

$configPath = Join-Path $PSScriptRoot '.env.simulation'
# DATABASE_URL is loaded from backend/.env so the simulation uses the configured PostgreSQL instance.
Get-Content -LiteralPath $configPath | ForEach-Object {
    if ($_ -match '^\s*([^#=]+)=(.*)$') {
        [Environment]::SetEnvironmentVariable($matches[1].Trim(), $matches[2].Trim(), 'Process')
    }
}

Push-Location $PSScriptRoot
try {
    python -m app.db.init_db
    if ($LASTEXITCODE -ne 0) {
        throw 'Could not initialize the SQLite simulation database.'
    }
    python -m uvicorn app.main:app --host 127.0.0.1 --port 8001
} finally {
    Pop-Location
}
