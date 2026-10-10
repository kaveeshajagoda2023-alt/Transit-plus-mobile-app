@echo off
cd /d "%~dp0"
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "ANDROID_HOME=C:\Users\Lochana\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\Lochana\AppData\Local\Android\Sdk"
gradlew.bat assembleDebug --stacktrace
set "BUILD_EXIT_CODE=%ERRORLEVEL%"
echo BUILD_EXIT_CODE=%BUILD_EXIT_CODE%
exit /b %BUILD_EXIT_CODE%
