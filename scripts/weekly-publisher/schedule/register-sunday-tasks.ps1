# ---------------------------------------------------------------------------
# Registers LVINIT's Sunday chain in Windows Task Scheduler (run once, from the
# LVINIT repo folder, as Mikey):
#
#   powershell -ExecutionPolicy Bypass -File scripts\weekly-publisher\schedule\register-sunday-tasks.ps1
#
# Two tasks, one chain, no overlap in what they produce:
#
#   LVINIT Weekly Production   Sunday 7:00 PM  Executive Producer: 7 finished
#                                              draft posts in OneDrive\...\Weekly Posts
#   LVINIT Weekly Publisher    Sunday 8:00 PM  Editor-in-chief: ONE plan file,
#                                              reports\weekly-content\<Monday>-weekly-content-plan.md
#                                              + LATEST.md, success or FAILED
#
# Times are this PC's local time. The script refuses to register unless the PC
# is on Pacific Time, where Windows applies PST/PDT itself, so 8:00 PM stays
# 8:00 PM Las Vegas time all year (no UTC offsets to shift twice a year).
#
# Both run from a dedicated runner checkout (%USERPROFILE%\.lvinit\runner, a
# git worktree following origin/main), never from the folder Mikey works in.
# WakeToRun wakes the PC; StartWhenAvailable runs a missed Sunday at the next
# startup (a Monday-Friday catch-up plans the current week); two retries 30
# minutes apart; never two runs at once.
# ---------------------------------------------------------------------------
param(
  [string]$ProducerAt = "19:00",
  [string]$PublisherAt = "20:00"
)
$ErrorActionPreference = "Stop"

$tz = (Get-TimeZone).Id
if ($tz -ne "Pacific Standard Time") {
  Write-Error "This PC is on '$tz', not Pacific Time. Set the timezone before registering."
  exit 1
}

$mainRepo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$lvinit = Join-Path $env:USERPROFILE ".lvinit"
$runner = Join-Path $lvinit "runner"
$home_ = Join-Path $lvinit "weekly-publisher"
New-Item -ItemType Directory -Force $home_ | Out-Null

# 1. Runner checkout (created once; the wrapper updates it every run).
if (-not (Test-Path (Join-Path $runner ".git"))) {
  git -C $mainRepo fetch --quiet origin main
  git -C $mainRepo worktree add --detach $runner origin/main
  if ($LASTEXITCODE -ne 0) { Write-Error "Could not create the runner checkout at $runner"; exit 1 }
  Push-Location $runner
  & npm.cmd ci --no-audit --no-fund
  Pop-Location
  Set-Content (Join-Path $home_ "package-lock.sha") (Get-FileHash (Join-Path $runner "package-lock.json")).Hash
}

# 2. The wrapper lives outside the repo so it can report a broken repo.
$wrapper = Join-Path $home_ "sunday-runner.ps1"
Copy-Item -Force (Join-Path $PSScriptRoot "sunday-runner.ps1") $wrapper

function Register($name, $job, $at, $description) {
  $arg = "-NoProfile -NonInteractive -ExecutionPolicy Bypass -WindowStyle Hidden -File `"$wrapper`" -Job $job -Runner `"$runner`" -MainRepo `"$mainRepo`""
  $action = New-ScheduledTaskAction -Execute "powershell.exe" -Argument $arg -WorkingDirectory $runner
  $trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Sunday -At $at
  $settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -MultipleInstances IgnoreNew `
    -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 30) -ExecutionTimeLimit (New-TimeSpan -Hours 3) `
    -AllowStartIfOnBatteries -DontStopIfGoingOnBatteries
  Register-ScheduledTask -TaskName $name -Action $action -Trigger $trigger -Settings $settings -Description $description -Force | Out-Null
  $info = Get-ScheduledTask -TaskName $name | Get-ScheduledTaskInfo
  Write-Output "Registered '$name': Sundays at $at Pacific. Next run: $($info.NextRunTime)"
}

Register "LVINIT Weekly Production" "producer" $ProducerAt "LVINIT Executive Producer: seven finished draft posts for the coming week. Never publishes."
Register "LVINIT Weekly Publisher" "publisher" $PublisherAt "LVINIT Weekly Publisher (editor-in-chief): the one weekly content plan, reports\weekly-content\LATEST.md. Success or a visible FAILED report. Never publishes."
Write-Output "Runner: $runner   Plans: $(Join-Path $mainRepo 'reports\weekly-content')"
