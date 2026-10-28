param([ValidateSet('Api','Physics','InspectAsset','Editor','Main','Capture','NativeSmoke','NativeStress')][string]$Mode = 'Physics', [string]$Model = 'res://assets/character.glb', [ValidateSet('front','side','back')][string]$View = 'front', [ValidateSet('neutral','halfblink','closed','combo')][string]$Expression='neutral', [switch]$Portrait, [switch]$RefreshAsset)
$ErrorActionPreference = 'Stop'
$taskNativeProject = $PSScriptRoot
$taskGodotExecutable = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe'))
if (-not (Test-Path -LiteralPath $taskGodotExecutable)) { throw 'Verified portable Godot is missing; see tools/godot/verified-download.json.' }
$taskOldAppData = $env:APPDATA
$taskOldLocalAppData = $env:LOCALAPPDATA
try {
  $env:APPDATA = Join-Path $taskNativeProject '.runtime-user/roaming'
  $env:LOCALAPPDATA = Join-Path $taskNativeProject '.runtime-user/local'
  New-Item -ItemType Directory -Path $env:APPDATA,$env:LOCALAPPDATA -Force | Out-Null
  if ($Mode -in @('Main','Capture','NativeSmoke','NativeStress') -and ($RefreshAsset -or -not (Test-Path -LiteralPath (Join-Path $PSScriptRoot 'assets/character.glb')))) { & (Join-Path $PSScriptRoot 'Sync-Asset.ps1') }
  if ($Mode -eq 'Main') {
    & $taskGodotExecutable --path $taskNativeProject --rendering-method gl_compatibility --max-fps 60 'res://scenes/main.tscn'
  } elseif ($Mode -eq 'Capture') {
    $taskCaptureName = "native-main-$View" + $(if ($Expression -ne 'neutral') { "-$Expression" } else { '' }) + $(if ($Portrait) { '-portrait' } else { '' })
    $taskCaptureArguments = @('--path',$taskNativeProject,'--rendering-method','gl_compatibility','--resolution','960x720','--position','-2000,-1500','--fixed-fps','60','--max-fps','0','--quit-after','360','res://scenes/main.tscn','--','--capture',"res://reports/$taskCaptureName.png",'--frames','90','--view',$View,'--expression',$Expression)
    if ($Portrait) { $taskCaptureArguments += @('--portrait','true') }
    $taskCaptureProcess = Start-Process -FilePath $taskGodotExecutable -ArgumentList $taskCaptureArguments -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput (Join-Path $taskNativeProject "reports/$taskCaptureName.stdout.log") -RedirectStandardError (Join-Path $taskNativeProject "reports/$taskCaptureName.stderr.log")
    $global:LASTEXITCODE = $taskCaptureProcess.ExitCode
  } elseif ($Mode -eq 'NativeSmoke') {
    & $taskGodotExecutable --headless --path $taskNativeProject --fixed-fps 120 --max-fps 0 --script 'res://scripts/native_smoke.gd'
  } elseif ($Mode -eq 'NativeStress') {
    $taskStressArguments = @('--path',$taskNativeProject,'--rendering-method','gl_compatibility','--resolution','960x720','--position','-2000,-1500','--fixed-fps','60','--max-fps','0','--script','res://scripts/native_stress.gd')
    $taskStressProcess = Start-Process -FilePath $taskGodotExecutable -ArgumentList $taskStressArguments -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput (Join-Path $taskNativeProject 'reports/native-stress.stdout.log') -RedirectStandardError (Join-Path $taskNativeProject 'reports/native-stress.stderr.log')
    $global:LASTEXITCODE = $taskStressProcess.ExitCode
  } elseif ($Mode -eq 'Editor') {
    & $taskGodotExecutable --path $taskNativeProject --editor --rendering-method gl_compatibility --max-fps 30
  } elseif ($Mode -eq 'InspectAsset') {
    & $taskGodotExecutable --headless --path $taskNativeProject --script 'res://scripts/inspect_glb.gd' -- $Model
  } else {
    $taskScript = if ($Mode -eq 'Api') { 'res://scripts/api_smoke.gd' } else { 'res://scripts/physics_smoke.gd' }
    & $taskGodotExecutable --headless --path $taskNativeProject --fixed-fps 120 --max-fps 0 --script $taskScript
  }
  $taskResult = $LASTEXITCODE
} finally {
  $env:APPDATA = $taskOldAppData
  $env:LOCALAPPDATA = $taskOldLocalAppData
}
exit $taskResult
