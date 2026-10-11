@echo off
setlocal

set "SOURCE=app\src\main\res\drawable\hexdroid_logo.png"

if not exist "%SOURCE%" (
    echo ERROR: Logo source not found: %SOURCE%
    exit /b 1
)

for %%D in (mdpi hdpi xhdpi xxhdpi xxxhdpi) do (
    if not exist "app\src\main\res\mipmap-%%D" mkdir "app\src\main\res\mipmap-%%D"
    copy /Y "%SOURCE%" "app\src\main\res\mipmap-%%D\ic_launcher.png" >nul
    copy /Y "%SOURCE%" "app\src\main\res\mipmap-%%D\ic_launcher_round.png" >nul
    copy /Y "%SOURCE%" "app\src\main\res\mipmap-%%D\ic_launcher_foreground.png" >nul
)

copy /Y "%SOURCE%" "app\src\main\ic_launcher-playstore.png" >nul

echo Launcher icons synchronized successfully.
endlocal
