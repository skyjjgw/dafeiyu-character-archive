param([switch]$ImportOnly,[switch]$Inspect,[switch]$NoMips,[switch]$LinearTextures,[switch]$FloatColors,[switch]$ColorProbe)
$ErrorActionPreference='Stop'
$taskAppearanceRoot=$PSScriptRoot
$taskGodotExecutable=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe'))
$taskPreviousAppData=$env:APPDATA
$taskPreviousLocalAppData=$env:LOCALAPPDATA
try {
  $env:APPDATA=Join-Path $PSScriptRoot '.runtime-user/roaming'
  $env:LOCALAPPDATA=Join-Path $PSScriptRoot '.runtime-user/local'
  New-Item -ItemType Directory -Path $env:APPDATA,$env:LOCALAPPDATA,(Join-Path $PSScriptRoot 'reports') -Force|Out-Null
  if($ImportOnly){ & $taskGodotExecutable --headless --editor --path $taskAppearanceRoot --import; exit $LASTEXITCODE }
  if($Inspect){ & $taskGodotExecutable --headless --path $taskAppearanceRoot --script 'res://inspect_import.gd'; exit $LASTEXITCODE }
  if($ColorProbe){ & $taskGodotExecutable --headless --path $taskAppearanceRoot --script 'res://probe_color.gd'; exit $LASTEXITCODE }
  $taskAppearanceArguments=@('--path',$taskAppearanceRoot,'--rendering-method','gl_compatibility','--resolution','640x704','--position','-2000,-1500','--max-fps','30','--quit-after','120','res://main.tscn')
  if($NoMips -or $LinearTextures -or $FloatColors){$taskAppearanceArguments+='--'}
  if($NoMips){$taskAppearanceArguments+='--no-mips'}
  if($LinearTextures){$taskAppearanceArguments+='--linear-textures'}
  if($FloatColors){$taskAppearanceArguments+='--float-colors'}
  $taskAppearanceProcess=Start-Process -FilePath $taskGodotExecutable -ArgumentList $taskAppearanceArguments -WindowStyle Hidden -PassThru -Wait -RedirectStandardOutput (Join-Path $PSScriptRoot 'reports/capture.stdout.log') -RedirectStandardError (Join-Path $PSScriptRoot 'reports/capture.stderr.log')
  $taskAppearanceExit=$taskAppearanceProcess.ExitCode
  if(Select-String -LiteralPath (Join-Path $PSScriptRoot 'reports/capture.stderr.log') -Pattern 'ERROR:|SCRIPT ERROR:' -Quiet){$taskAppearanceExit=1}
} finally {
  $env:APPDATA=$taskPreviousAppData
  $env:LOCALAPPDATA=$taskPreviousLocalAppData
}
exit $taskAppearanceExit
