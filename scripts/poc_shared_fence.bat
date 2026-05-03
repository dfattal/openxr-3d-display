@echo off
setlocal

REM Phase 2 PoC build + run: cross-process ID3D11Fence test.
REM See scripts\poc_shared_fence.cpp for description. Throwaway code; not part of the runtime.

set "POC_DIR=%~dp0"
set "POC_SRC=%POC_DIR%poc_shared_fence.cpp"
set "POC_OUT_DIR=%POC_DIR%..\_package\poc"
set "POC_EXE=%POC_OUT_DIR%\poc_shared_fence.exe"

if not exist "%POC_OUT_DIR%" mkdir "%POC_OUT_DIR%"

REM Mirror build_windows.bat: source VS2022 Community vcvars64.
call "C:\Program Files\Microsoft Visual Studio\2022\Community\VC\Auxiliary\Build\vcvars64.bat" >nul 2>&1
if errorlevel 1 (
    echo [poc] FAIL: could not find VS2022 Community vcvars64.bat
    exit /b 1
)

echo [poc] compiling %POC_SRC%
cl.exe /nologo /EHsc /std:c++17 /O2 /Fe:"%POC_EXE%" /Fo:"%POC_OUT_DIR%\\" "%POC_SRC%" /link /SUBSYSTEM:CONSOLE d3d11.lib
if errorlevel 1 (
    echo [poc] compile FAIL
    exit /b 1
)

echo [poc] running %POC_EXE%
"%POC_EXE%"
exit /b %errorlevel%
