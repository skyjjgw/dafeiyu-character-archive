$ErrorActionPreference = 'Stop'
$taskSource = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../native-character/assets/dafeiyu-native-v2-study.glb'))
$taskSourceManifest = [IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../native-character/assembled-v2-manifest.json'))
$taskDestination = Join-Path $PSScriptRoot 'assets/character.glb'
if (-not (Test-Path -LiteralPath $taskSource)) { Write-Output 'Native character is not exported yet; main will wait for the asset.'; exit 0 }
$taskBytes = [IO.File]::ReadAllBytes($taskSource)
if ($taskBytes.Length -lt 20 -or [BitConverter]::ToUInt32($taskBytes,0) -ne 0x46546c67 -or [BitConverter]::ToUInt32($taskBytes,4) -ne 2 -or [BitConverter]::ToUInt32($taskBytes,8) -ne $taskBytes.Length) { throw 'Source GLB is incomplete; leave the previous runtime asset untouched.' }
$taskHasher = [Security.Cryptography.SHA256]::Create()
try { $taskHash = [BitConverter]::ToString($taskHasher.ComputeHash($taskBytes)).Replace('-','').ToLowerInvariant() } finally { $taskHasher.Dispose() }
if (Test-Path -LiteralPath $taskSourceManifest) {
  $taskManifestCheck = Get-Content -LiteralPath $taskSourceManifest -Raw | ConvertFrom-Json
  if ($taskManifestCheck.glb_sha256 -and $taskManifestCheck.glb_sha256 -ne $taskHash) { throw 'Manifest and source GLB differ; retain the previous runtime snapshot.' }
}
$taskSourceAssets = Split-Path -Parent $taskSource
$taskCagePath = Join-Path $taskSourceAssets 'skirt-physics-cage-v2.json'
$taskBindPath = Join-Path $taskSourceAssets 'runtime-rig-bind.json'
foreach ($taskRequired in @($taskCagePath,$taskBindPath)) { if (-not (Test-Path -LiteralPath $taskRequired)) { throw 'Matching physical cage/bind metadata is required before changing the runtime snapshot.' } }
$taskCageBytes = [IO.File]::ReadAllBytes($taskCagePath)
$taskBindBytes = [IO.File]::ReadAllBytes($taskBindPath)
$taskBind = [Text.Encoding]::UTF8.GetString($taskBindBytes) | ConvertFrom-Json
function Get-TaskByteHash([byte[]]$Data) {
  $taskHashAlgorithm = [Security.Cryptography.SHA256]::Create()
  try { [BitConverter]::ToString($taskHashAlgorithm.ComputeHash($Data)).Replace('-','').ToLowerInvariant() } finally { $taskHashAlgorithm.Dispose() }
}
$taskCageHash = Get-TaskByteHash $taskCageBytes
$taskBindHash = Get-TaskByteHash $taskBindBytes
if ($taskBind.sourceHashes.'dafeiyu-native-v2-study.glb' -ne $taskHash -or $taskBind.sourceHashes.'skirt-physics-cage-v2.json' -ne $taskCageHash) { throw 'GLB, physical bind and cloth cage are different source versions; previous runtime snapshot retained.' }
$taskBlendPath = [IO.Path]::GetFullPath((Join-Path $taskSourceAssets '../dafeiyu-native-v2-study.blend'))
if (-not (Test-Path -LiteralPath $taskBlendPath)) { throw 'Source blend is missing for source-hash verification.' }
$taskBlendHash = Get-TaskByteHash ([IO.File]::ReadAllBytes($taskBlendPath))
if ($taskBind.sourceHashes.'dafeiyu-native-v2-study.blend' -ne $taskBlendHash) { throw 'Physical bind was exported from a different source blend; previous runtime snapshot retained.' }
$taskPetticoatPath = Join-Path $taskSourceAssets 'petticoat-support-v1.json'
if (Test-Path -LiteralPath $taskPetticoatPath) {
  $taskPetticoatBytes = [IO.File]::ReadAllBytes($taskPetticoatPath)
  $taskPetticoat = [Text.Encoding]::UTF8.GetString($taskPetticoatBytes) | ConvertFrom-Json
  if ($taskPetticoat.sourceCage.sha256 -ne $taskCageHash) { throw 'Petticoat was authored against a different cloth cage; previous runtime snapshot retained.' }
}
[IO.File]::WriteAllBytes($taskDestination,$taskBytes)
if (Test-Path -LiteralPath $taskSourceManifest) { Copy-Item -LiteralPath $taskSourceManifest -Destination (Join-Path $PSScriptRoot 'assets/source-manifest.json') -Force }
[IO.File]::WriteAllBytes((Join-Path $PSScriptRoot 'assets/skirt-physics-cage-v2.json'),$taskCageBytes)
[IO.File]::WriteAllBytes((Join-Path $PSScriptRoot 'assets/runtime-rig-bind.json'),$taskBindBytes)
if ($taskPetticoatBytes) { [IO.File]::WriteAllBytes((Join-Path $PSScriptRoot 'assets/petticoat-support-v1.json'),$taskPetticoatBytes) }
$taskReceipt = [pscustomobject]@{ Source=$taskSource; RuntimeAsset=$taskDestination; Bytes=$taskBytes.Length; SHA256=$taskHash; PhysicalBindSHA256=$taskBindHash; ClothCageSHA256=$taskCageHash; SourceBlendSHA256=$taskBlendHash; PetticoatSHA256=$(if ($taskPetticoatBytes) { Get-TaskByteHash $taskPetticoatBytes } else { $null }); SourceVersionsVerified=$true } | ConvertTo-Json
[IO.File]::WriteAllText((Join-Path $PSScriptRoot 'reports/runtime-asset.json'),$taskReceipt,(New-Object Text.UTF8Encoding($false)))
Write-Output "Synced native GLB: $($taskBytes.Length) bytes"
