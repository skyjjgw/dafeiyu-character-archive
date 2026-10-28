$ErrorActionPreference = 'Stop'
$taskProject = Join-Path $PSScriptRoot 'project'
$taskGodot = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe'))
foreach ($taskProbe in @('impulse_probe.gd','mass_probe.gd')) {
  & $taskGodot --headless --path $taskProject --script ('res://' + $taskProbe)
  if ($LASTEXITCODE -ne 0) { throw "Calibration failed: $taskProbe" }
}
foreach ($taskDuration in @(1,4)) {
  & $taskGodot --headless --path $taskProject --script res://jolt_probe.gd -- --hz=240 ("--duration=$taskDuration") ("--report=lod-jolt-240hz-$($taskDuration)s")
  if ($LASTEXITCODE -ne 0) { throw "LoD diagnostic failed: $taskDuration s" }
  $taskReport = Get-Content -LiteralPath (Join-Path $PSScriptRoot "reports/lod-jolt-240hz-$($taskDuration)s.json") -Raw | ConvertFrom-Json
  if ($taskReport.trials | Where-Object { -not $_.bounded_diagnostic_pass }) { throw "Bounded diagnostic failed: $taskDuration s" }
}
python (Join-Path $PSScriptRoot 'summarize.py')
