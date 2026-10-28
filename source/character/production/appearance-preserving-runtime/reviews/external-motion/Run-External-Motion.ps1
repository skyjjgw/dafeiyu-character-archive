param([switch]$HeadlessTest,[switch]$UICheck)
$taskMotionProject = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../..')).Path
$taskMotionRoot = (Resolve-Path -LiteralPath (Join-Path $PSScriptRoot '../../../..')).Path
$taskMotionGodot = Join-Path $taskMotionRoot 'tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64_console.exe'
if ($UICheck) {
    & $taskMotionGodot --path $taskMotionProject --script res://reviews/external-motion/ui_check.gd --resolution 1100x860 --fixed-fps 60
} elseif ($HeadlessTest) {
    & $taskMotionGodot --headless --path $taskMotionProject res://reviews/external-motion/scene.tscn --fixed-fps 60 -- --external-test
} else {
    & $taskMotionGodot --path $taskMotionProject res://reviews/external-motion/scene.tscn --resolution 1100x860
}
exit $LASTEXITCODE
