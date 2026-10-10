@echo off
setlocal
cd /d "%~dp0"
set "JAVA_HOME=C:\Program Files\Java\jdk-17"
set "ANDROID_HOME=C:\Users\Lochana\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\Lochana\AppData\Local\Android\Sdk"
> "gradle-build-diagnostic.log" (
  echo JAVA_HOME=%JAVA_HOME%
  echo JAVA_EXECUTABLE=%JAVA_HOME%\bin\java.exe
  "%JAVA_HOME%\bin\java.exe" -version
  echo JAVA_VERSION_EXIT=%ERRORLEVEL%
  echo JAVA_PATH=%PATH%
  echo WHERE_JAVA
  where java
  echo GRADLE_VERSION
  gradlew.bat --version
  echo GRADLE_VERSION_EXIT=%ERRORLEVEL%
  echo STARTING_ANDROID_DEBUG_BUILD
  gradlew.bat --no-daemon assembleDebug --stacktrace
  echo GRADLE_BUILD_EXIT=%ERRORLEVEL%
)
set "BUILD_EXIT_CODE=%ERRORLEVEL%"
echo BUILD_EXIT_CODE=%BUILD_EXIT_CODE%
exit /b %BUILD_EXIT_CODE%
