$repoPath = Resolve-Path (Join-Path $PSScriptRoot "..")
Set-Location $repoPath

function Get-HasChanges {
  $status = git status --porcelain
  return -not [string]::IsNullOrWhiteSpace($status)
}

function Commit-And-Push {
  if (-not (Get-HasChanges)) {
    return
  }

  git add -A | Out-Null
  $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
  $message = "Auto update $timestamp"
  git commit -m $message | Out-Null
  git push
}

if (-not (git remote get-url origin 2>$null)) {
  Write-Host "No Git remote named 'origin' found. Add a remote before using auto-push."
  exit 1
}

$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $repoPath
$watcher.IncludeSubdirectories = $true
$watcher.NotifyFilter = [System.IO.NotifyFilters]'FileName, DirectoryName, LastWrite, Size'
$watcher.Filter = "*.*"

$timer = New-Object System.Timers.Timer
$timer.Interval = 15000
$timer.AutoReset = $false
$timer.add_Elapsed({
  Commit-And-Push
})

function Should-IgnorePath($path) {
  $ignoreParts = @(
    "\.git\",
    "\humanizer-main\",
    "\ui-ux-pro-max-skill-main\",
    "\everything-claude-code-main\"
  )
  foreach ($part in $ignoreParts) {
    if ($path -like "*$part*") {
      return $true
    }
  }
  return $false
}

$action = {
  if (Should-IgnorePath $Event.SourceEventArgs.FullPath) {
    return
  }
  $timer.Stop()
  $timer.Start()
}

Register-ObjectEvent $watcher Changed -Action $action | Out-Null
Register-ObjectEvent $watcher Created -Action $action | Out-Null
Register-ObjectEvent $watcher Deleted -Action $action | Out-Null
Register-ObjectEvent $watcher Renamed -Action $action | Out-Null

$watcher.EnableRaisingEvents = $true
Write-Host "Watching for changes in $repoPath. Press Ctrl+C to stop."

while ($true) {
  Start-Sleep -Seconds 1
}
