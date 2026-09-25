@echo off
echo ========================================================
echo Drivo Store — Workspace Folder Rename
echo ========================================================
echo.
echo Please close your IDE/editor window first to release any open file locks.
echo Then press any key in this window to rename 'drivo_base44' to 'drivo-store'.
echo.
pause
cd /d "e:\MyProjects"
ren "drivo_base44" "drivo-store"
echo.
echo Done! Successfully renamed to: e:\MyProjects\drivo-store
echo You can now reopen 'e:\MyProjects\drivo-store' in Antigravity IDE.
pause
