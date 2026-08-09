' Start the skill.supply report worker with NO window at all, same pattern
' as sellsniper.com's start-scan-worker-hidden.vbs and summon.company's
' start-summon-hidden.vbs. Runs start-report-worker.cmd hidden. Check
' worker\worker.log for activity, or stop it from Task Manager (node.exe
' running report-worker.mjs).
'
' Registered as a Windows Scheduled Task ("skill.supply Report Worker") at
' logon. Double-click this file to also start it immediately.
Dim shell, scriptDir
Set shell = CreateObject("WScript.Shell")
scriptDir = Left(WScript.ScriptFullName, InStrRev(WScript.ScriptFullName, "\"))
shell.Run """" & scriptDir & "start-report-worker.cmd""", 0, False
