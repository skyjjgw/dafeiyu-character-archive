param([ValidateSet('full','membrane','bending','collision')][string]$Mode='full',[double]$Duration=4)
$ErrorActionPreference='Stop'
$taskProject=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../..'))
$taskGodot=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe'))
$taskPreviousAppData=$env:APPDATA;$taskPreviousLocal=$env:LOCALAPPDATA
try{
 $env:APPDATA=Join-Path $PSScriptRoot '.runtime-user/roaming';$env:LOCALAPPDATA=Join-Path $PSScriptRoot '.runtime-user/local'
 New-Item -ItemType Directory -Path $env:APPDATA,$env:LOCALAPPDATA,(Join-Path $PSScriptRoot 'reports') -Force|Out-Null
 $taskArguments=@('--headless','--path',$taskProject,'--max-fps','60','--script','res://selected-production/garment/check.gd','--quit-after','1200')
 $taskReportName=if($Mode -eq 'full'){'native-check'}else{$Mode+'-check'}
 $taskArguments+=@('--',"--duration=$Duration","--report=$taskReportName")
 if($Mode -in @('membrane','collision')){$taskArguments+='--no-material'}
 if($Mode -in @('membrane','bending')){$taskArguments+='--no-collisions'}
 $taskReceiptPath=Join-Path $PSScriptRoot "reports/$taskReportName.json"
 @{completed=$false;status='pending'}|ConvertTo-Json|Set-Content -LiteralPath $taskReceiptPath -Encoding utf8
 $taskProcess=Start-Process -FilePath $taskGodot -ArgumentList $taskArguments -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput (Join-Path $PSScriptRoot 'reports/launch.stdout.log') -RedirectStandardError (Join-Path $PSScriptRoot 'reports/launch.stderr.log')
 $taskCode=$taskProcess.ExitCode
 if(Select-String -LiteralPath (Join-Path $PSScriptRoot 'reports/launch.stderr.log') -Pattern 'ERROR:|SCRIPT ERROR:' -Quiet){$taskCode=1}
 $taskReceipt=Get-Content -LiteralPath $taskReceiptPath -Raw|ConvertFrom-Json;if($taskReceipt.completed -ne $true -or $taskReceipt.pass -ne $true){$taskCode=1}
}finally{$env:APPDATA=$taskPreviousAppData;$env:LOCALAPPDATA=$taskPreviousLocal}
exit $taskCode
