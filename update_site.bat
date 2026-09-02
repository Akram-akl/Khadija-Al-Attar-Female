@echo off
chcp 65001 >nul
title Al-Furqan Female Updater
echo ==========================================
echo    Al-Furqan Female Updater
echo ==========================================
echo.
echo 1. Checking changes...
git add .

echo.
set /p commit_msg="Enter commit message: "

if "%commit_msg%"=="" set commit_msg="General update"

echo.
echo 2. Committing locally...
git commit -m "%commit_msg%"

echo.
echo 3. Pushing to GitHub...
git config credential.https://github.com.username Akram-akl
git push origin main

echo.
echo ==========================================
echo Done! Cloudflare will auto-update shortly.
echo ==========================================
pause
