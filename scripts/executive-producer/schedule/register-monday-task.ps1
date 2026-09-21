# ---------------------------------------------------------------------------
# Registers the Monday production run in Windows Task Scheduler.
# NOT run automatically. Mikey confirms the time and timezone first, then:
#
#   powershell -ExecutionPolicy Bypass -File scripts\executive-producer\schedule\register-monday-task.ps1 -At 05:00
#
# Behaviour:
#   * Weekly, Monday at -At (this PC's local time; the script refuses to register
#     unless the PC is on Pacific Time, so "5:00" means 5:00 AM Las Vegas time)
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
  [string]$TaskName = "LVINIT Monday Production"
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
$trigger = New-ScheduledTaskTrigger -Weekly -DaysOfWeek Monday -At $At
$settings = New-ScheduledTaskSettingsSet -WakeToRun -StartWhenAvailable -MultipleInstances IgnoreNew `
  -RestartCount 2 -RestartInterval (New-TimeSpan -Minutes 30) -ExecutionTimeLimit (New-TimeSpan -Hours 2)

Register-ScheduledTask -TaskName $TaskName -Action $action -Trigger $trigger -Settings $settings `
  -Description "LVINIT Executive Producer: seven finished draft posts every Monday. Never publishes." -Force
Write-Output "Registered '$TaskName' for Mondays at $At Pacific. Log: $log"
