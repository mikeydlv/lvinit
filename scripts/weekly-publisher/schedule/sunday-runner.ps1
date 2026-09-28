# ---------------------------------------------------------------------------
# LVINIT Sunday runner - what Task Scheduler actually starts.
#
# Installed to %USERPROFILE%\.lvinit\weekly-publisher\sunday-runner.ps1 by
# register-sunday-tasks.ps1. It lives OUTSIDE the repo on purpose: if the repo
# code is missing or broken, this script still runs and still reports it.
#
#   -Job producer    Executive Producer: 7 finished draft posts (Sun 7:00 PM)
#   -Job publisher   Weekly Publisher: the one weekly plan file (Sun 8:00 PM)
#
# Why a separate runner checkout: on 2026-09-27 the scheduled run pointed at
# Mikey's working folder, which had been switched to a branch without the
# Executive Producer code, so node could not find the script and nothing was
# reported. The jobs now run from %USERPROFILE%\.lvinit\runner, a dedicated
# git worktree that follows origin/main and that nobody edits or switches.
# ---------------------------------------------------------------------------
param(
  [Parameter(Mandatory = $true)][ValidateSet("producer", "publisher")][string]$Job,
  [Parameter(Mandatory = $true)][string]$Runner,
  [Parameter(Mandatory = $true)][string]$MainRepo
)

$ErrorActionPreference = "Continue"
$home_ = Join-Path $env:USERPROFILE ".lvinit\weekly-publisher"
New-Item -ItemType Directory -Force $home_ | Out-Null
$log = if ($Job -eq "producer") { Join-Path $env:USERPROFILE ".lvinit\executive-producer\weekly.log" } else { Join-Path $home_ "weekly-publisher.log" }
function Log($m) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [$Job] $m" | Out-File -Append -Encoding utf8 $log }

function Show-Toast($title, $body) {
  try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
    $t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $x = $t.GetElementsByTagName('text')
    $x.Item(0).AppendChild($t.CreateTextNode($title)) > $null
    $x.Item(1).AppendChild($t.CreateTextNode($body)) > $null
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('LVINIT Weekly Publisher').Show([Windows.UI.Notifications.ToastNotification]::new($t))
  } catch { Log "toast failed: $($_.Exception.Message)" }
}

# The Monday this run plans, in Las Vegas time (Sat/Sun -> next Monday; Mon-Fri -> this week).
function Get-WeekOf {
  $la = [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, "Pacific Standard Time").Date
  $dow = [int]$la.DayOfWeek
  if ($dow -eq 0) { return $la.AddDays(1).ToString("yyyy-MM-dd") }
  if ($dow -eq 6) { return $la.AddDays(2).ToString("yyyy-MM-dd") }
  return $la.AddDays( - ($dow - 1)).ToString("yyyy-MM-dd")
}

# Last-resort failure report when node could not produce one itself.
function Write-Failure($why) {
  $dash = [char]0x2014; $warn = [char]0x26A0
  $week = Get-WeekOf
  $out = Join-Path $MainRepo "reports\weekly-content"
  New-Item -ItemType Directory -Force $out | Out-Null
  $name = "$week-weekly-content-plan-FAILED.md"
  $stamp = [System.TimeZoneInfo]::ConvertTimeBySystemTimeZoneId([DateTime]::UtcNow, "Pacific Standard Time").ToString("MMM d, yyyy h:mm tt") + " Pacific"
  $body = @"
# LVINIT $dash THIS WEEK

Week of: $week

## $warn FAILED $dash THIS WEEK'S CONTENT PLAN WAS NOT CREATED

The Sunday runner could not run the Weekly Publisher ($stamp).

> $why

Nothing was posted or published.

## What to do

1. Open Claude Code in the LVINIT repo and say: **"The weekly content plan failed $dash fix it and produce this week's plan."**
2. Log: ``$log``
"@
  Set-Content -Path (Join-Path $out $name) -Value $body -Encoding utf8
  Set-Content -Path (Join-Path $out "LATEST.md") -Encoding utf8 -Value "# LVINIT $dash LATEST WEEKLY CONTENT PLAN`n`n**$warn FAILED $dash week of $week.** The plan was not created ($stamp).`n`nOpen: [$name](./$name)`n"
  Show-Toast "LVINIT: weekly content plan FAILED" $why
  Log "FAILURE report written: $(Join-Path $out $name)"
}

Log "start (runner $Runner)"

# 1. Bring the runner checkout to origin/main. Skipped while the other job is
#    mid-run (an Executive Producer lock), so files never change under it.
$busy = Get-ChildItem -Path (Join-Path $env:USERPROFILE "OneDrive\Documents\LVINIT\Weekly Posts") -Filter ".run.lock" -Recurse -Force -ErrorAction SilentlyContinue |
  Where-Object { $_.LastWriteTime -gt (Get-Date).AddHours(-3) }
if (-not (Test-Path (Join-Path $Runner ".git"))) {
  Write-Failure "The runner checkout $Runner is missing. Re-run scripts\weekly-publisher\schedule\register-sunday-tasks.ps1 from the LVINIT repo."
  exit 1
}
if ($Job -eq "producer" -or -not $busy) {
  git -C $Runner fetch --quiet origin main 2>&1 | ForEach-Object { Log "git: $_" }
  git -C $Runner checkout --quiet --detach --force origin/main 2>&1 | ForEach-Object { Log "git: $_" }
  if ($LASTEXITCODE -ne 0) { Log "warning: could not update the runner; using the checkout as it is." }
  # Dependencies only when package-lock.json changed.
  $lockHash = (Get-FileHash (Join-Path $Runner "package-lock.json")).Hash
  $stampFile = Join-Path $home_ "package-lock.sha"
  if (-not (Test-Path (Join-Path $Runner "node_modules")) -or -not (Test-Path $stampFile) -or (Get-Content $stampFile) -ne $lockHash) {
    Log "installing dependencies (npm ci)"
    Push-Location $Runner
    & npm.cmd ci --no-audit --no-fund 2>&1 | Select-Object -Last 5 | ForEach-Object { Log "npm: $_" }
    $npmExit = $LASTEXITCODE
    Pop-Location
    if ($npmExit -eq 0) { Set-Content $stampFile $lockHash } else { Log "warning: npm ci failed ($npmExit)" }
  }
} else {
  Log "Executive Producer is mid-run; not updating the runner checkout."
}
Log "runner at $(git -C $Runner rev-parse --short HEAD)"

# 2. Run the job.
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { $node = "C:\Program Files\nodejs\node.exe" }
if ($Job -eq "producer") {
  $script = Join-Path $Runner "scripts\executive-producer\weekly.mjs"
  $jobArgs = @($script, "--catalog=$(Join-Path $MainRepo 'data\executive-producer\footage-catalog.json')")
} else {
  $script = Join-Path $Runner "scripts\weekly-publisher\run.mjs"
  $jobArgs = @($script, "--main-repo=$MainRepo")
}
if (-not (Test-Path $script)) {
  $why = "The $Job script is missing from the runner checkout ($script)."
  Log $why
  if ($Job -eq "publisher") { Write-Failure $why } else { Show-Toast "LVINIT: weekly social batch FAILED" $why }
  exit 1
}
Push-Location $Runner
& $node @jobArgs 2>&1 | ForEach-Object { "$_" | Out-File -Append -Encoding utf8 $log }
$code = $LASTEXITCODE
Pop-Location
Log "exit $code"

# 3. Node ran but left no result at all (crash before its own reporting).
if ($Job -eq "publisher" -and $code -ne 0) {
  $week = Get-WeekOf
  $out = Join-Path $MainRepo "reports\weekly-content"
  if (-not (Test-Path (Join-Path $out "$week-weekly-content-plan-FAILED.md")) -and -not (Test-Path (Join-Path $out "$week-weekly-content-plan.md"))) {
    Write-Failure "The Weekly Publisher exited with code $code without writing a report. See the log."
  }
}
if ($Job -eq "producer" -and $code -ne 0) {
  Show-Toast "LVINIT: weekly social batch did not finish" "The 8 PM Weekly Publisher will still run and list what is missing."
}
exit $code
