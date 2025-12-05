@echo off
echo ============================================
echo   COMPLETE SYSTEM RESET - CLEAN EVERYTHING
echo ============================================
echo.

echo Step 1: Stopping all containers...
docker-compose down
timeout /t 2 >nul

echo Step 2: Removing ALL containers, images, and volumes...
docker-compose down -v
timeout /t 2 >nul

echo Step 3: Removing Docker images...
docker rmi hr-project-main-frontend hr-project-main-backend postgres:16-alpine 2>nul
timeout /t 2 >nul

echo Step 4: Pruning Docker system...
docker system prune -af --volumes
timeout /t 3 >nul

echo Step 5: Building everything from scratch (NO CACHE)...
docker-compose build --no-cache
timeout /t 3 >nul

echo Step 6: Starting all services...
docker-compose up -d
timeout /t 10 >nul

echo Step 7: Checking status...
docker-compose ps
echo.

echo Step 8: Showing frontend logs...
docker logs hr-frontend --tail 20
echo.

echo ============================================
echo   DONE! Now do these steps:
echo ============================================
echo.
echo 1. Open browser in INCOGNITO/PRIVATE mode
echo 2. Go to: http://localhost:8080
echo 3. Open DevTools (F12) and check Console
echo.
echo If still not working, RESTART YOUR COMPUTER!
echo.
pause
