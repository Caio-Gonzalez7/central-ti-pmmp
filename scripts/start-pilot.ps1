$ErrorActionPreference = "Stop"
$projectRoot = Split-Path -Parent $PSScriptRoot
$venvPath = Join-Path $projectRoot ".venv"
$pythonPath = Join-Path $venvPath "Scripts\python.exe"
$backendPath = Join-Path $projectRoot "backend"
$bundledPython = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
$bundledPnpm = Join-Path $env:USERPROFILE ".cache\codex-runtimes\codex-primary-runtime\dependencies\bin\fallback\pnpm.cmd"
$basePython = if (Test-Path -LiteralPath $bundledPython) { $bundledPython } else { "python" }
$pnpm = if (Test-Path -LiteralPath $bundledPnpm) { $bundledPnpm } else { "pnpm" }

if (-not (Test-Path -LiteralPath $pythonPath)) {
    & $basePython -m venv $venvPath
}

& $pythonPath -m pip install --disable-pip-version-check -r (Join-Path $backendPath "requirements.txt")

$env:APP_ENV = "development"
$env:DATABASE_URL = "sqlite+aiosqlite:///./central_ti.db"
$env:NEXT_PUBLIC_API_URL = "http://localhost:8000"

$apiProcess = Start-Process -FilePath $pythonPath -ArgumentList @(
    "-m", "uvicorn", "app.main:app",
    "--host", "127.0.0.1",
    "--port", "8000"
) -WorkingDirectory $backendPath -WindowStyle Hidden -PassThru

try {
    Write-Host "API: http://localhost:8000/docs"
    Write-Host "Portal: aguarde o endereço Local exibido abaixo."
    Set-Location -LiteralPath $projectRoot
    & $pnpm dev
}
finally {
    if (-not $apiProcess.HasExited) {
        Stop-Process -Id $apiProcess.Id
    }
}
