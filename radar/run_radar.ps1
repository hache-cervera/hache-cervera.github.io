# Busqueda diaria de Radar — para el Programador de tareas de Windows
#
# Programador de tareas -> Crear tarea basica -> Diariamente
#   Accion: Iniciar un programa
#     Programa:   powershell.exe
#     Argumentos: -ExecutionPolicy Bypass -File "C:\ruta\a\radar\run_radar.ps1"
#
# Requiere ANTHROPIC_API_KEY como variable de entorno del usuario:
#   setx ANTHROPIC_API_KEY "sk-ant-..."

$ErrorActionPreference = "Stop"

# Carpeta que CONTIENE a radar\ (no radar\ en si).
$ProjectDir = Split-Path -Parent $PSScriptRoot

$env:GOOGLE_SHEETS_ID = "1mSfAzJvP0OHBM_shnYpHqGRBKGbtXmKIeAwitUI0nfc"
$env:GOOGLE_APPLICATION_CREDENTIALS = "$ProjectDir\job_scraper\service-account.json"
$env:PYTHONIOENCODING = "utf-8"

Set-Location $ProjectDir

if (-not $env:ANTHROPIC_API_KEY) {
    Write-Host "Aviso: sin ANTHROPIC_API_KEY se clasifica por reglas, bastante peor." -ForegroundColor Yellow
    Write-Host "Ponla con:  setx ANTHROPIC_API_KEY `"sk-ant-...`"" -ForegroundColor Yellow
}

$sheetArg = @()
if (-not (Test-Path $env:GOOGLE_APPLICATION_CREDENTIALS)) {
    Write-Host "Sin credenciales de Google: no se subira al Sheet (queda en local)." -ForegroundColor Yellow
    $sheetArg = @("--sin-sheet")
}

python -m radar.cli buscar @sheetArg

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "Listo. Para revisarlas:" -ForegroundColor Green
    Write-Host "   python -m radar.cli panel"
} else {
    Write-Host "La busqueda fallo (codigo $LASTEXITCODE)." -ForegroundColor Red
}
