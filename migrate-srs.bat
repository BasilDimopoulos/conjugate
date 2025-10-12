@echo off
REM SRS & Content Library Database Migration Script for Windows

echo ================================================
echo Migrating Database for SRS & Content Library
echo ================================================
echo.

REM Generate migration
echo Step 1: Creating migration...
call npx prisma migrate dev --name add_srs_and_content_library

REM Generate Prisma client
echo.
echo Step 2: Generating Prisma client...
call npx prisma generate

echo.
echo ================================================
echo Migration Complete!
echo ================================================
echo.
echo Your database has been updated with:
echo  - SRS fields (spaced repetition)
echo  - UserContent model (content library)
echo.
echo You can now:
echo  - Review words at /learn
echo  - Add content at /learn/add-content
echo  - Browse library at /learn/library
echo.
pause

