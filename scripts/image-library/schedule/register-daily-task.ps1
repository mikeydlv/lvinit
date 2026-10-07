# ---------------------------------------------------------------------------
# Registers the LVINIT Media Image Library in Windows Task Scheduler (run once,
# from the LVINIT repo folder, as Mikey):
#
#   powershell -ExecutionPolicy Bypass -File scripts\image-library\schedule\register-daily-task.ps1
#
#   LVINIT Media Image Library   every day 8:00 PM   10 new editorial images from
#                                                   LVINIT footage -> C:\LVINIT\Images,
#                                                   public/images/editorial, the index,
#                                                   one commit pushed to main
#
# Same conventions as register-sunday-tasks.ps1: refuses unless the PC is on
# Pacific Time (Windows applies PST/PDT itself, so 8:00 PM stays 8:00 PM Las
# Vegas time); runs from a dedicated worktree that follows origin/main, never
# from the folder Mikey works in; WakeToRun; StartWhenAvailable catches a missed
# day at the next startup; never two runs at once.
# ---------------------------------------------------------------------------
param(
  [string]$At = "20:00",
  [string]$TaskName = "LVINIT Media Image Library"
)
$ErrorActionPreference = "Stop"

$tz = (Get-TimeZone).Id
if ($tz -ne "Pacific Standard Time") {
  Write-Error "This PC is on '$tz', not Pacific Time. Set the timezone before registering."
  exit 1
}

$mainRepo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$home_ = Join-Path $env:USERPROFILE ".lvinit\image-library"
$worktree = Join-Path $home_ "repo"
New-Item -ItemType Directory -Force $home_ | Out-Null

# 1. Worktree (created once; the wrapper updates it every run).
if (-not (Test-Path (Join-Path $worktree ".git"))) {
  git -C $mainRepo fetch --quiet origin main
  git -C $mainRepo worktree add --detach $worktree origin/main
  if ($LASTEXITCODE -ne 0) { Write-Error "Could not create the worktree at $worktree"; exit 1 }
  Push-Location $worktree
  & npm.cmd ci --no-audit --no-fund
  Pop-Location
  Set-Content (Join-Path $home_ "package-lock.sha") (Get-FileHash (Join-Path $worktree "package-lock.json")).Hash
}

# 2. The wrapper lives outside the repo so it can report a broken repo.
$wrapper = Join-Path $home_ "daily-runner.ps1"
Copy-Item -Force (Join-Path $PSScriptRoot "daily-runner.ps1") $wrapper

$arg = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$wrapper`" -Worktree `"$worktree`""
$action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arg -WorkingDirectory $worktree
$trigger = New-ScheduledTaskTrigger -Daily -At $At
$settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -MultipleInstances IgnoreNew `
  -ExecutionTimeLimit (New-TimeSpan -Hours 2) -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
  -Description "LVINIT Media Image Library Agent: 10 new article-ready images a day from LVINIT footage, indexed in data/image-library/lvinit-image-library.json and pushed to main. Fails safe: nothing partial is pushed." -Force | Out-Null
$info = Get-ScheduledTask -TaskName $TaskName | Get-ScheduledTaskInfo
Write-Output "Registered '$TaskName': daily at $At Pacific. Next run: $($info.NextRunTime)"
Write-Output "Worktree: $worktree   Logs: $(Join-Path $home_ 'runs')"
