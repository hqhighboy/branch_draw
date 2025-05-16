@echo off
echo ===================================
echo Dify连接测试工具
echo ===================================
echo.

cd /d %~dp0
node scripts/test-dify-connection.js

pause
