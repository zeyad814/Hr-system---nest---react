@echo off
REM Script to apply Prisma migrations to production database

echo ========================================
echo  Production Migration Script
echo ========================================
echo.

REM Check if DATABASE_URL is set
if "%DATABASE_URL%"=="" (
    echo [ERROR] DATABASE_URL environment variable is not set
    echo Please set your production database URL:
    echo set DATABASE_URL=postgresql://user:password@host:port/database
    exit /b 1
)

echo [OK] Database URL found
echo.

REM Generate Prisma Client
echo [STEP 1/3] Generating Prisma Client...
call npx prisma generate
if errorlevel 1 (
    echo [ERROR] Failed to generate Prisma Client
    exit /b 1
)
echo [OK] Prisma Client generated
echo.

REM Deploy migrations
echo [STEP 2/3] Deploying migrations to production...
call npx prisma migrate deploy
if errorlevel 1 (
    echo [ERROR] Failed to deploy migrations
    exit /b 1
)
echo [OK] Migrations deployed successfully
echo.

REM Show migration status
echo [STEP 3/3] Migration Status:
call npx prisma migrate status
echo.

echo ========================================
echo  Migration completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Verify the changes in your production database
echo 2. Test the new features on your production app
echo 3. Monitor the application logs for any issues
echo.
pause
