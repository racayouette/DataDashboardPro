@echo off
echo Starting Job Description Manager Application...

REM Set Node.js version
echo Setting Node.js version...
set NODE_ENV=production

REM Start the application
echo Starting server...
node dist/index.js