@echo off
REM 一次性脚本：把「提交者已改回与作者一致」的历史强推到 GitHub。
REM 为什么要强推：修正提交者必须重写这 25 个提交（哈希会变），普通 push 会被拒。
REM --force-with-lease 是安全的强推：只在远程没有别人新提交时才生效，
REM 万一有别的新提交，它会拒绝而不是覆盖掉。
REM 用完这个脚本就可以删掉，之后的正常推送用 push-when-online.bat。

cd /d D:\PROG2002-A3

echo.
echo === 待推送的 25 个提交（作者 / 提交者 应一致）===
git log --pretty="%%h  author=%%an  committer=%%cn  %%s" origin/master..HEAD
echo.

set RETRIES=10
set WAIT=10

for /L %%i in (1,1,%RETRIES%) do (
    echo --- 第 %%i 次尝试 ---
    git push --force-with-lease origin master
    if not errorlevel 1 (
        echo.
        echo === 推送成功 ===
        git status -sb
        goto :done
    )
    echo 没成功，%WAIT% 秒后重试（VPN 要保持打开）...
    timeout /t %WAIT% /nobreak >nul
)

echo.
echo === 试了 %RETRIES% 次都没通 ===
echo 请确认：1）VPN 或代理是开的，浏览器能打开 github.com；
echo        2）然后再双击这个脚本。

:done
pause
