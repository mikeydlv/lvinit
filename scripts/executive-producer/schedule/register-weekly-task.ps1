# ---------------------------------------------------------------------------
# Registers the weekly production run in Windows Task Scheduler.
# Mikey chose Sunday 8:00 PM delivery (confirmed 2026-09-21), so it starts at 7:00 PM:
#
#   powershell -ExecutionPolicy Bypass -File scripts\executive-producer\schedule\register-weekly-task.ps1 -Day Sunday -At 19:00
#
# Behaviour:
#   * Weekly, on -Day at -At (this PC's local time; the script refuses to register
#     unless the PC is on Pacific Time, so "19:00" means 7:00 PM Las Vegas time).
#     On Saturday/Sunday it produces the week starting the next Monday.
#   * WakeToRun: wakes the PC from sleep to run
#   * StartWhenAvailable: if the PC was off at that time, runs at next startup
#   * Retries twice, 30 minutes apart, if the run fails
#   * IgnoreNew: never two runs at once. weekly.mjs's DONE marker also makes any
#     re-run of a finished week exit immediately, so no duplicate batches.
#   * Output: OneDrive\Documents\LVINIT\Weekly Posts\Week of <date>\
#     A failed run leaves RUN-FAILED.md in that folder and logs to
#     %USERPROFILE%\.lvinit\executive-producer\weekly.log
# ---------------------------------------------------------------------------
param(
  [Parameter(Mandatory = $true)][string]$At,
  [ValidateSet("Sunday","Monday","Saturday")][string]$Day = "Sunday",
  [string]$TaskName = "LVINIT Weekly Production"
)

$tz = (Get-TimeZone).Id
if ($tz -ne "Pacific Standard Time") {
  Write-Error "This PC is on '$tz', not Pacific Time. Set the timezone or adjust -At before registering."
  exit 1
}

$repo = (Resolve-Path (Join-Path $PSScriptRoot "..\..\..")).Path
$node = (Get-Command node).Source
$log = Join-Path $env:USERPROFILE ".lvinit\executive-producer\weekly.log"
$cmd = "/c `"`"$node`" scripts\executive-producer\weekly.mjs >> `"$log`" 2>&1`""

$action = New-ScheduledTaskAction -Execute "cmd.exe" -Argument $cmd -WorkingDirectory $repo
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek $Day -At $At
$settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -MultipleInstances IgnoreNew `
  -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 30) -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
  -Description "LVINIT Executive Producer: seven finished draft posts for the coming week. Never publishes." -Force
Write-Output "Registered '$TaskName' for ${Day}s at $At Pacific. Log: $log"
