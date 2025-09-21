@echo off
echo 🚀 Starting Leave Management System...
echo.

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    pause
    exit /b 1
)

echo ✅ Node.js is installed
echo.

REM Start backend server
echo 🔧 Starting backend server...
cd backend
call npm install >nul 2>&1
start "Backend Server" cmd /k "npm run dev"

REM Wait a moment for backend to start
timeout /t 3 /nobreak >nul

REM Start frontend server
echo 🎨 Starting frontend server...
cd ..\frontend
call npm install >nul 2>&1
start "Frontend Server" cmd /k "npm start"

echo.
echo 🎉 Leave Management System is starting up!
echo.
echo 📊 Backend API: http://localhost:5001
echo 🌐 Frontend Website: http://localhost:3000
echo.
echo 👤 Employee Login: http://localhost:3000/login
echo 🔐 HR Admin Login: http://localhost:3000/admin/login
echo.
echo Press any key to exit...
pause >nul
