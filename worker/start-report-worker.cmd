@echo off
REM skill.supply report worker, crash-resilient loop.
REM Runs from the repo root regardless of caller's cwd (uses this script's own
REM location). Restarts node if it ever exits (an uncaught exception should
REM not permanently kill the queue fallback). Logs to worker\worker.log
REM (gitignored). Started hidden via start-report-worker-hidden.vbs.

setlocal
cd /d "%~dp0.."

:loop
echo [%date% %time%] worker (re)starting >> worker\worker.log
node worker\report-worker.mjs >> worker\worker.log 2>&1
echo [%date% %time%] worker exited, restarting in 5s >> worker\worker.log
timeout /t 5 /nobreak >nul
goto loop
