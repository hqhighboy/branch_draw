@echo off
echo Starting Branch Analysis System...

REM Start backend server
start cmd /k "cd server && node server.js"

REM Wait 2 seconds to ensure backend server is started
timeout /t 2 /nobreak > nul

REM Start frontend application
start cmd /k "npm start"

echo System started!
echo Frontend: http://localhost:3000
echo Backend: http://localhost:3002
