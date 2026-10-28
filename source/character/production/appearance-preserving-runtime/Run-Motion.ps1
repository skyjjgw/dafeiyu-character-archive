param([switch]$Capture,[switch]$AutoCheck,[switch]$Headless,[switch]$Checks)
$ErrorActionPreference='Stop'
$taskAppearanceRoot=$PSScriptRoot
$taskGodotExecutable=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe'))
$taskOldAppData=$env:APPDATA
$taskOldLocalAppData=$env:LOCALAPPDATA
try {
  $env:APPDATA=Join-Path $PSScriptRoot '.runtime-user/roaming'
  $env:LOCALAPPDATA=Join-Path $PSScriptRoot '.runtime-user/local'
  New-Item -ItemType Directory -Path $env:APPDATA,$env:LOCALAPPDATA,(Join-Path $PSScriptRoot 'reports') -Force|Out-Null
  $taskMotionArgs=@('--path',$PSScriptRoot,'--rendering-method','gl_compatibility','--resolution','1100x850','--max-fps','60','res://motion.tscn')
  if($Checks){$taskMotionArgs=@('--path',$PSScriptRoot,'--rendering-method','gl_compatibility','--resolution','1100x850','--max-fps','60','--script','res://motion_checks.gd','--quit-after','2400')}
  if($Headless){$taskMotionArgs=@('--headless')+$taskMotionArgs}
  if($Capture -or $Checks){$taskMotionArgs+=@('--position','-2000,-1500')}
  if($Capture){$taskMotionArgs+=@('--quit-after','1800')}
  if($Capture -or $AutoCheck){$taskMotionArgs+='--'}
  if($Capture){$taskMotionArgs+='--capture-motion'}
  if($AutoCheck){$taskMotionArgs+='--auto-check'}
  if($Capture -or $Headless -or $Checks){
    $taskMotionLogStem=if($Headless){'motion-headless'}else{'motion'}
    $taskMotionStdout=Join-Path $PSScriptRoot ('reports/'+$taskMotionLogStem+'.stdout.log')
    $taskMotionStderr=Join-Path $PSScriptRoot ('reports/'+$taskMotionLogStem+'.stderr.log')
    $taskMotionProcess=Start-Process -FilePath $taskGodotExecutable -ArgumentList $taskMotionArgs -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput $taskMotionStdout -RedirectStandardError $taskMotionStderr
    $taskMotionCode=$taskMotionProcess.ExitCode
    if(Select-String -LiteralPath $taskMotionStderr -Pattern 'ERROR:|SCRIPT ERROR:' -Quiet){$taskMotionCode=1}
  }else{& $taskGodotExecutable @taskMotionArgs;$taskMotionCode=$LASTEXITCODE}
}finally{$env:APPDATA=$taskOldAppData;$env:LOCALAPPDATA=$taskOldLocalAppData}
exit $taskMotionCode
