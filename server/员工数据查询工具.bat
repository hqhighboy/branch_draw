@echo off
chcp 65001 > nul
echo ===================================
echo      员工数据查询工具 - 快速启动
echo ===================================
echo.
echo 此工具可以帮助您:
echo 1. 查询员工数据
echo 2. 按部门、姓名、技能等级等条件筛选
echo 3. 统计部门和学历分布
echo.
echo 正在启动员工数据查询工具...
echo.
node scripts/employee-query.js
pause
