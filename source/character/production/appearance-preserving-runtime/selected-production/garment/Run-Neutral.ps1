$ErrorActionPreference='Stop'
$taskProject=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$taskGodot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe'))
$taskArguments=@('--path',$taskProject,'--rendering-method','gl_compatibility','--resolution','1100x850','--max-fps','60','--position','-2200,-1500','--script','res://selected-production/garment/capture-neutral.gd','--quit-after','900')
$taskReceiptPath=Join-Path $PSScriptRoot 'reports/neutral-gpu.json'
@{completed=$false;status='pending'}|ConvertTo-Json|Set-Content -LiteralPath $taskReceiptPath -Encoding utf8
$taskProcess=Start-Process -FilePath $taskGodot -ArgumentList $taskArguments -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput (Join-Path $PSScriptRoot 'reports/neutral.stdout.log') -RedirectStandardError (Join-Path $PSScriptRoot 'reports/neutral.stderr.log')
$taskCode=$taskProcess.ExitCode
if(Select-String -LiteralPath (Join-Path $PSScriptRoot 'reports/neutral.stderr.log') -Pattern 'ERROR:|SCRIPT ERROR:' -Quiet){$taskCode=1}
$taskReceipt=Get-Content -LiteralPath $taskReceiptPath -Raw|ConvertFrom-Json
if($taskReceipt.completed -ne $true -or $taskReceipt.pass_render_wiring_only -ne $true){$taskCode=1}
exit $taskCode
