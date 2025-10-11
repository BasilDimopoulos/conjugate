@echo off
REM SRS Database Migration Script for Windows

echo ================================================
echo Migrating Database for SRS System
echo ================================================
echo.

REM Generate migration
echo Step 1: Creating migration...
call npx prisma migrate dev --name add_srs_fields

REM Generate Prisma client
echo.
echo Step 2: Generating Prisma client...
call npx prisma generate

echo.
echo ================================================
echo Migration Complete!
echo ================================================
echo.
echo Your database has been updated with SRS fields.
echo You can now use the review system at /learn
echo.
pause

