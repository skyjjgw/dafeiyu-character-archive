param([switch]$HeadlessCheck,[switch]$TailCheck,[switch]$Capture)
$ErrorActionPreference='Stop'
$taskProject=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '..'))
$taskGodot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe'))
$taskPreviousAppData=$env:APPDATA;$taskPreviousLocal=$env:LOCALAPPDATA
try{
 $env:APPDATA=Join-Path $PSScriptRoot '.runtime-user/roaming';$env:LOCALAPPDATA=Join-Path $PSScriptRoot '.runtime-user/local'
 New-Item -ItemType Directory -Path $env:APPDATA,$env:LOCALAPPDATA,(Join-Path $PSScriptRoot 'reports') -Force|Out-Null
 $taskArguments=@('--path',$taskProject,'--rendering-method','gl_compatibility','--resolution','1100x850','--max-fps','60','res://selected-production/current.tscn')
 if($HeadlessCheck){$taskArguments=@('--headless','--path',$taskProject,'--max-fps','60','--script','res://selected-production/check.gd','--quit-after','900');@{completed=$false;status='pending'}|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'reports/lifecycle-check.json') -Encoding utf8}
 if($TailCheck){$taskArguments=@('--headless','--path',$taskProject,'--max-fps','60','--script','res://selected-production/tail-check.gd','--quit-after','2400');@{completed=$false;status='pending'}|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'reports/tail-check.json') -Encoding utf8}
 if($Capture){$taskArguments=@('--path',$taskProject,'--rendering-method','gl_compatibility','--resolution','1100x850','--max-fps','60','--position','-2200,-1500','--script','res://selected-production/capture.gd','--quit-after','1800');@{completed=$false;status='pending'}|ConvertTo-Json|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'reports/gpu-capture.json') -Encoding utf8}
 $taskProcess=Start-Process -FilePath $taskGodot -ArgumentList $taskArguments -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput (Join-Path $PSScriptRoot 'reports/launch.stdout.log') -RedirectStandardError (Join-Path $PSScriptRoot 'reports/launch.stderr.log')
 $taskCode=$taskProcess.ExitCode
 if(Select-String -LiteralPath (Join-Path $PSScriptRoot 'reports/launch.stderr.log') -Pattern 'ERROR:|SCRIPT ERROR:' -Quiet){$taskCode=1}
 if($HeadlessCheck){$taskReceipt=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'reports/lifecycle-check.json') -Raw|ConvertFrom-Json;if($taskReceipt.completed -ne $true -or $taskReceipt.pass -ne $true){$taskCode=1}}
 if($TailCheck){$taskReceipt=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'reports/tail-check.json') -Raw|ConvertFrom-Json;if($taskReceipt.completed -ne $true -or $taskReceipt.pass -ne $true){$taskCode=1}}
 if($Capture){$taskReceipt=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'reports/gpu-capture.json') -Raw|ConvertFrom-Json;if($taskReceipt.completed -ne $true){$taskCode=1}}
}finally{$env:APPDATA=$taskPreviousAppData;$env:LOCALAPPDATA=$taskPreviousLocal}
exit $taskCode
