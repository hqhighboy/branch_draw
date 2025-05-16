@echo off
chcp 65001 > nul
echo ===================================
echo      数据库工具集 - 快速启动
echo ===================================
echo.
echo 此工具可以帮助您:
echo 1. 检查数据库连接和表结构
echo 2. 创建必要的表结构
echo 3. 导入Excel数据到数据库
echo 4. 查询数据库中的数据
echo.
echo 正在启动数据库工具集...
echo.
node scripts/run-tools.js
pause
