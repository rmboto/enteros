@echo off
rem Arranca Feria Neon 84 con su servidor local: las puntuaciones se guardan solas en jugadores.json, en esta carpeta.
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Hace falta tener Node.js instalado: https://nodejs.org
  pause
  exit /b 1
)
node servidor.js --abrir %*
pause
