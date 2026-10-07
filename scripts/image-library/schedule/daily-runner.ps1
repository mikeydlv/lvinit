# ---------------------------------------------------------------------------
# LVINIT Media Image Library - what Task Scheduler actually starts (daily 8 PM).
#
# Installed to %USERPROFILE%\.lvinit\image-library\daily-runner.ps1 by
# register-daily-task.ps1. It lives OUTSIDE the repo on purpose: if the repo
# code is missing or broken, this script still runs and still reports it.
#
# Runs from its own worktree, %USERPROFILE%\.lvinit\image-library\repo, which
# follows origin/main and that nobody edits or switches (the same pattern as
# the Sunday runner, which uses %USERPROFILE%\.lvinit\runner). Separate
# worktrees mean the Sunday 8 PM Weekly Publisher and this job never touch the
# same checkout.
# ---------------------------------------------------------------------------
param(
  [Parameter(Mandatory = $true)][string]$Worktree,
  [string[]]$NodeArgs = @()
)

$ErrorActionPreference = "Continue"
$home_ = Join-Path $env:USERPROFILE ".lvinit\image-library"
New-Item -ItemType Directory -Force $home_ | Out-Null
$log = Join-Path $home_ "image-library.log"
function Log($m) { "$(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') [runner] $m" | Out-File -Append -Encoding utf8 $log }

function Show-Toast($title, $body) {
  try {
    [Windows.UI.Notifications.ToastNotificationManager, Windows.UI.Notifications, ContentType = WindowsRuntime] > $null
    $t = [Windows.UI.Notifications.ToastNotificationManager]::GetTemplateContent([Windows.UI.Notifications.ToastTemplateType]::ToastText02)
    $x = $t.GetElementsByTagName('text')
    $x.Item(0).AppendChild($t.CreateTextNode($title)) > $null
    $x.Item(1).AppendChild($t.CreateTextNode($body)) > $null
    [Windows.UI.Notifications.ToastNotificationManager]::CreateToastNotifier('LVINIT Media Image Library').Show([Windows.UI.Notifications.ToastNotification]::new($t))
  } catch { Log "toast failed: $($_.Exception.Message)" }
}

function Fail($why) {
  Log "FAILED: $why"
  Show-Toast "LVINIT: image library run FAILED" $why
  exit 1
}

Log "start (worktree $Worktree)"
if (-not (Test-Path (Join-Path $Worktree ".git"))) {
  Fail "The worktree $Worktree is missing. Re-run scripts\image-library\schedule\register-daily-task.ps1 from the LVINIT repo."
}

# 1. Follow origin/main - unless an unpushed image commit or local changes are
#    present, which the node script handles (retries the push / refuses).
git -C $Worktree fetch --quiet origin main 2>&1 | ForEach-Object { Log "git: $_" }
$pending = git -C $Worktree rev-list "origin/main..HEAD" 2>$null
$dirty = git -C $Worktree status --porcelain 2>$null
if (-not $pending -and -not $dirty) {
  git -C $Worktree checkout --quiet --detach origin/main 2>&1 | ForEach-Object { Log "git: $_" }
} else {
  Log "worktree has an unpushed commit or local changes; leaving it for the agent to resolve."
}

# 2. Dependencies only when package-lock.json changed.
$lockHash = (Get-FileHash (Join-Path $Worktree "package-lock.json")).Hash
$stampFile = Join-Path $home_ "package-lock.sha"
if (-not (Test-Path (Join-Path $Worktree "node_modules")) -or -not (Test-Path $stampFile) -or (Get-Content $stampFile) -ne $lockHash) {
  Log "installing dependencies (npm ci)"
  Push-Location $Worktree
  & npm.cmd ci --no-audit --no-fund 2>&1 | Select-Object -Last 5 | ForEach-Object { Log "npm: $_" }
  $npmExit = $LASTEXITCODE
  Pop-Location
  if ($npmExit -eq 0) { Set-Content $stampFile $lockHash } else { Fail "npm ci failed ($npmExit) in $Worktree" }
}
Log "worktree at $(git -C $Worktree rev-parse --short HEAD)"

# 3. Run the agent.
$node = (Get-Command node -ErrorAction SilentlyContinue).Source
if (-not $node) { $node = "C:\Program Files\nodejs\node.exe" }
$script = Join-Path $Worktree "scripts\image-library\run.mjs"
if (-not (Test-Path $script)) { Fail "The agent script is missing from the worktree ($script)." }
Push-Location $Worktree
$env:IMAGE_LIBRARY_STDOUT_ONLY = "1"
& $node $script @NodeArgs 2>&1 | ForEach-Object { "$_" | Out-File -Append -Encoding utf8 $log }
$code = $LASTEXITCODE
Pop-Location
Log "exit $code"
if ($code -ne 0) {
  Show-Toast "LVINIT: image library run did not finish" "See %USERPROFILE%\.lvinit\image-library\runs for the reason. Nothing partial was pushed."
}
exit $code
