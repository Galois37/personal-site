@echo off
set SCRIPT_DIR=%~dp0
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%tools\api-deploy.ps1"
pause
