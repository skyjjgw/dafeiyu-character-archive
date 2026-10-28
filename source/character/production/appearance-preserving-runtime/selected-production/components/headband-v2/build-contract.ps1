$ErrorActionPreference='Stop'
$taskRuntime=[IO.Path]::GetFullPath((Join-Path $PSScriptRoot '../../..'))
$taskGeometry=Get-Content -LiteralPath (Join-Path $PSScriptRoot 'geometry-contract.json') -Raw|ConvertFrom-Json
$taskFiles=@('factory.gd','headband-material.gdshader','headband-v2.glb','geometry-contract.json')|ForEach-Object{
 $taskFile=Get-Item -LiteralPath (Join-Path $PSScriptRoot $_)
 @{path=$_;bytes=$taskFile.Length;sha256=(Get-FileHash -LiteralPath $taskFile.FullName -Algorithm SHA256).Hash.ToLowerInvariant()}
}
$taskContract=[ordered]@{
 schema='dafeiyu.selected-production.external-component.v1'
 id='headband-continuous-shell'
 version='headband-v2-frozen-20261028'
 headLocal=$true
 parent='Original head-control; identity attached once by handle.commit()'
 sourceGlbSha256='8cdc482600a30d370ffe39b70a58a1674659756092dd197d19e5562fc87a0078'
 files=$taskFiles
 originalMeshesReplaced=$taskGeometry.attach.replaces
 geometryAssetSha256=$taskGeometry.asset.sha256
 sourceGeneratorSha256='72769501a9c7258d864c4581b7a0b90128c37dba7b9e0988af53e807f8a3cfb7'
 texture='Host source_textures[0], already linear RGBA16F; no second sRGB decode'
 palette='GLB COLOR_0 float RGB transferred to CUSTOM0 RGBA_FLOAT after exact POSITION/UV/UV2 lookup and ArrayMesh roundtrip checks'
 paintWeight='UV2.x preserved, including both shell sides'
 setup='Validate and prepare hidden unparented identity model; source unchanged'
 commit='Once-only Head attachment, exact 7 mesh.resource_name visibility replacement'
 dispose='Idempotent; restores 7 saved visibility flags and releases only owned resources'
 clothPhysics=$false
 status='partial-improvement'
 finalAccepted=$false
 limitations=@('Frozen rest geometry and rigid Head attachment only','Material/side artistic acceptance remains pending','Other original hair, face, body and all skins remain source-owned and untouched')
}
$taskContract|ConvertTo-Json -Depth 12|Set-Content -LiteralPath (Join-Path $PSScriptRoot 'contract.json') -Encoding utf8
