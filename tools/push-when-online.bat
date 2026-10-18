@echo off
REM 网络一通，双击这个脚本就能把本地未上传的提交推到 GitHub。
REM 推的是 D:\PROG2002-A3 主仓库（历史已修正，和远程同步）。
REM 失败会自动重试 10 次，每次等 15 秒，中途网络恢复就能一次成功。
REM 如果要求登录，浏览器里请用 Carlos-001-max 授权。

cd /d D:\PROG2002-A3

echo.
echo === 当前身份 ===
git config user.name
git config user.email
echo.
echo === 待推送提交数 ===
git log --oneline origin/master..HEAD | find /c /v ""
echo.

set RETRIES=10
set WAIT=15

for /L %%i in (1,1,%RETRIES%) do (
    echo --- 第 %%i 次尝试 ---
    git push origin master
    if not errorlevel 1 (
        echo.
        echo === 推送成功 ===
        git status
        goto :done
    )
    echo 没成功，%WAIT% 秒后重试...
    timeout /t %WAIT% /nobreak >nul
)

echo.
echo === 试了 %RETRIES% 次都没通 ===
echo 说明这台电脑到 github.com 仍然不通。
echo 用离线包在别的机器上推：submission\chengyu-carried-26-commits.bundle
echo 用法：git clone 仓库后，git pull 那个bundle HEAD，再 git push origin master

:done
pause
