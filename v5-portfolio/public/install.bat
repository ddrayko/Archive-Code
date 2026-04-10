@echo off
setlocal

echo ==================================================
echo       Portfolio V4 - Auto Installation Script
echo ==================================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed. Install Node.js v18+.
    pause
    exit /b 1
)

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed. Install Git.
    pause
    exit /b 1
)

echo [OK] Node.js and Git detected.
echo.

REM Clone the repository if package.json is not present
if exist "package.json" goto SKIP_CLONE

echo [CLONE] Downloading project from GitHub...
echo ---------------------------------------------------
set /p "install_dir=Installation folder name (default: v4-portfolio): "
if "%install_dir%"=="" set "install_dir=v4-portfolio"

if exist "%install_dir%\package.json" (
    echo [INFO] Folder %install_dir% already contains the project. Using existing folder.
    cd "%install_dir%"
    goto SKIP_CLONE
)

if exist "%install_dir%" (
    echo [ERROR] Folder %install_dir% already exists but does not look like this project.
    echo Please remove it or choose another folder.
    pause
    exit /b 1
)

git clone https://github.com/GraphStats/v4-portfolio.git "%install_dir%"
if %errorlevel% neq 0 (
    echo [ERROR] Repository clone failed.
    pause
    exit /b 1
)

cd "%install_dir%"
echo [OK] Project cloned into %install_dir%.
echo.

:SKIP_CLONE

if not exist ".env" goto CONFIGURE_ENV

echo [INFO] .env file already exists.
set /p "overwrite=Do you want to replace it? (y/n): "
if /i not "%overwrite%"=="y" goto SKIP_CONFIG

:CONFIGURE_ENV
echo.
echo [CONFIG] Configuring environment variables...
echo ------------------------------------------------------
echo.
echo -- Firebase --
set /p "fb_api_key=API Key: "
set /p "fb_auth_domain=Auth Domain: "
set /p "fb_project_id=Project ID: "
set /p "fb_storage_bucket=Storage Bucket: "
set /p "fb_msg_sender_id=Messaging Sender ID: "
set /p "fb_app_id=App ID: "
set /p "fb_measurement_id=Measurement ID: "
echo.
echo -- Clerk (Auth) --
set /p "clerk_pub_key=Publishable Key: "
set /p "clerk_secret_key=Secret Key: "
echo.
echo -- Cloudflare (Optional, press Enter to skip) --
set /p "cf_zone_id=Zone ID: "
set /p "cf_api_token=API Token: "

echo.
echo Writing .env file...
echo # Firebase config> .env
echo NEXT_PUBLIC_FIREBASE_API_KEY=%fb_api_key%>> .env
echo NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=%fb_auth_domain%>> .env
echo NEXT_PUBLIC_FIREBASE_PROJECT_ID=%fb_project_id%>> .env
echo NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=%fb_storage_bucket%>> .env
echo NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=%fb_msg_sender_id%>> .env
echo NEXT_PUBLIC_FIREBASE_APP_ID=%fb_app_id%>> .env
echo NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=%fb_measurement_id%>> .env
echo.>> .env
echo # Clerk>> .env
echo NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=%clerk_pub_key%>> .env
echo CLERK_SECRET_KEY=%clerk_secret_key%>> .env
echo.>> .env
echo # Cloudflare>> .env
echo CLOUDFLARE_ZONE_ID=%cf_zone_id%>> .env
echo CLOUDFLARE_API_TOKEN=%cf_api_token%>> .env

echo [OK] .env created successfully.

:SKIP_CONFIG
echo.
echo [INSTALL] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo [ERROR] npm install failed.
    pause
    exit /b 1
)

echo.
echo [BUILD] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Build failed.
    pause
    exit /b 1
)

echo.
echo ==================================================
echo       [OK] Installation complete!
echo ==================================================
echo.
echo To start the app:
echo   npm start
echo.
pause
