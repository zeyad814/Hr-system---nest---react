@echo off
echo Running database seeder...
cd back-end\server
call npm run seed
echo.
echo Seeder completed!
pause
