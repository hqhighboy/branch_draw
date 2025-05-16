@echo off
chcp 65001 > nul
echo ===================================
echo      员工数据导入工具 - 快速启动
echo ===================================
echo.
echo 此工具可以帮助您:
echo 1. 将Excel员工数据导入到数据库
echo 2. 查询和统计员工数据
echo.
echo 正在启动员工数据导入工具...
echo.
node scripts/employee-import.js
pause
