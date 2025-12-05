@echo off
echo ==========================================
echo   FIX BACKEND DATABASE MIGRATIONS
echo ==========================================
echo.

echo Step 1: Reset database and apply all migrations...
docker exec hr-backend npx prisma migrate reset --force
echo.

echo Step 2: Generate Prisma Client...
docker exec hr-backend npx prisma generate
echo.

echo Step 3: Run seeder to create test users...
docker exec hr-backend npm run seed
echo.

echo Step 4: Restart backend container...
docker-compose restart backend
timeout /t 5 >nul
echo.

echo Step 5: Check backend logs...
docker logs hr-backend --tail 30
echo.

echo ==========================================
echo   DONE! Backend should be working now
echo ==========================================
echo.
echo Test login at: http://localhost:8080/login
echo Email: admin@test.com
echo Password: Pass123!
echo.
pause
