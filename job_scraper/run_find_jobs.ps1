# Busqueda diaria de ofertas — ejecutar con el Programador de tareas de Windows
#
# Este script sustituye a run_daily.ps1. A diferencia del anterior, NO necesita
# bun ni los CLI de los portales: find_jobs.py consulta 7 APIs/feeds publicos
# por HTTP directo. Lo unico que necesita son las credenciales de Google para
# escribir en la hoja.
#
# Instalacion (una sola vez):
#   1. Guarda este archivo junto a find_jobs.py, dentro de job_scraper\
#   2. Ajusta las dos rutas de abajo si tu carpeta es distinta
#   3. Programador de tareas -> Crear tarea basica -> Diariamente
#      Accion: Iniciar un programa
#        Programa:   powershell.exe
#        Argumentos: -ExecutionPolicy Bypass -File "C:\Users\Hache\Downloads\CLAUDE\ai-job-search\job_scraper\run_find_jobs.ps1"
#
# Prueba manual antes de programarlo:
#   powershell -ExecutionPolicy Bypass -File .\run_find_jobs.ps1

$ErrorActionPreference = "Stop"

# --- Ajusta estas rutas si hace falta ---------------------------------------
$JobScraperDir = "C:\Users\Hache\Downloads\CLAUDE\ai-job-search\job_scraper"
$CredentialsPath = "$JobScraperDir\service-account.json"

# --- Configuracion ----------------------------------------------------------
$env:GOOGLE_APPLICATION_CREDENTIALS = $CredentialsPath
$env:GOOGLE_SHEETS_ID = "1mSfAzJvP0OHBM_shnYpHqGRBKGbtXmKIeAwitUI0nfc"
$env:GMAIL_RECIPIENT = "hachedesign404@gmail.com"
$env:PYTHONIOENCODING = "utf-8"

Set-Location $JobScraperDir

if (-not (Test-Path $CredentialsPath)) {
    Write-Host "ERROR: no encuentro las credenciales en $CredentialsPath" -ForegroundColor Red
    Write-Host "Sin ellas se puede buscar pero no escribir en la hoja." -ForegroundColor Yellow
    Write-Host "Prueba sin escribir con:  python find_jobs.py --dry-run" -ForegroundColor Yellow
    exit 1
}

Write-Host "Buscando ofertas..." -ForegroundColor Cyan
python find_jobs.py --send-email

if ($LASTEXITCODE -eq 0) {
    Write-Host "Listo. Revisa la hoja:" -ForegroundColor Green
    Write-Host "https://docs.google.com/spreadsheets/d/$($env:GOOGLE_SHEETS_ID)/edit"
} else {
    Write-Host "La busqueda fallo (codigo $LASTEXITCODE). Revisa job_scraper\pipeline_log.txt" -ForegroundColor Red
}
