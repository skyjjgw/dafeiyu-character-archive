import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),runtime=path.resolve(here,'..');
const sha=b=>crypto.createHash('sha256').update(b).digest('hex');
const file=p=>({path:'res://'+p,bytes:fs.statSync(path.join(runtime,p)).size,sha256:sha(fs.readFileSync(path.join(runtime,p)))});
const component=(id,files,scope)=>({id,required:true,status:'active-current-work',finalAccepted:false,files:files.map(file),scope});
const manifest={schema:'dafeiyu.selected-production.components.v1',version:'0.1.0-current',status:'current-production-in-progress-not-final',appearanceAuthority:'http://127.0.0.1:4348/character-preview.html',appearancePolicy:'Retain the selected original girl. Components improve structure and motion; never fall back to rejected generic native art.',scene:'res://selected-production/current.tscn',controller:'One existing CharacterBody3D controller; source bones, greeting override and hand rig share the same action queue/cancel/camera.',coordinateContract:{source:'Frozen selected study units, Y up +Z forward',metersPerSourceUnit:.35,modelLiftSourceUnits:1.055,physicalScaleMeasured:false},capabilities:{state:true,wave:true,cancel:true,walk:true,turn:true,look:true,fingerMotion:true,pickup:false,release:false,forceClosureGrasp:false,voiceLipSync:false},components:[
 component('selected-look-and-body22',['assets/selected-appearance.glb','assets/source-rendering.json','assets/source-float-colors.json','assets/source-float-colors.bin','assets/motion-rig.json','motion_asset.gd','static_comparison.gd','motion_controller.gd','motion_rig.gd'],'Original source appearance and 22-body-bone locomotion. Whole-body anatomy/side/back remain incomplete.'),
 component('source-face-default',['face-kernel/component-manifest.json','face-kernel/selected_face_kernel.gdextension','face-kernel/bin/selected_face_kernel.windows.release.x86_64.dll','face-kernel/face_adapter.gd','face-kernel/source-equations.json','face-kernel/source-descriptors.json'],'Original source-default continuous facial kernel. No audio => talk0. Not the structural head v3 kernel.'),
 component('local-hands-v2',['hands-candidate/assets/hand-package.json','hands-candidate/assets/hand-package.bin','hands-candidate/hand_adapter.gd','hands-candidate/greeting_rig.gd','hands-candidate/scene.gd'],'Real local fingers, exact body22 mapping, explicit packed skin weight error; limited greeting pose improvement, not force-closure grasp.')
 ],reservedComponents:[{id:'continuous-head-v3',status:'awaiting-native-roles20-24-and-depth-cage-adapter',loaded:false},{id:'headband-continuous-shell',status:'awaiting-valid-conforming-mid-surface',loaded:false},{id:'selected-garment-cloth',status:'awaiting-source-frame-solver-and-barycentric-package',loaded:false},{id:'selected-hair-secondary',status:'pending',loaded:false}],unsupportedActions:{pickup:'Not implemented: no verified hand-object contact or grasp constraint.',release:'Not implemented: no held-object state; do not acknowledge a fabricated release.'},quality:{selectedIdentityRetained:true,fullAngles:false,naturalActingComplete:false,allPhysicsComplete:false,finalAccepted:false}};
for(const p of ['assets/linear-textures.json'])manifest.components[0].files.push(file(p));
const textures=JSON.parse(fs.readFileSync(path.join(runtime,'assets/linear-textures.json')));for(const t of textures)manifest.components[0].files.push(file('assets/'+t.linearCache));
manifest.version='0.1.1-current';manifest.capabilities.tailSecondary=true;
manifest.capabilities.remoteActions=['state','wave','cancel'];manifest.capabilities.localControls={walk:true,turn:true,look:true,fingerMotion:true,cameraViews:true};
manifest.components.push(component('selected-tail-jolt',['selected-production/assets/tail-jolt.json','selected-production/tail_jolt.gd'],'Three original blue tail bones driven by true Jolt rigid-body angular springs, gravity and root boundary; approximate convex contacts, self-contact and garment coupling incomplete.'));
manifest.components.push(component('current-scene-host',['selected-production/current.gd','selected-production/component_registry.gd','motion_scene.gd'],'Single composable current host; required component guard, truthful capabilities, lifecycle and explicit unsupported action responses.'));
const headContractPath='selected-production/components/continuous-head-v3/contract.json';
const headContract=JSON.parse(fs.readFileSync(path.join(runtime,headContractPath)));
const head=component('continuous-head-v3',[headContractPath,...headContract.files.map(f=>'selected-production/components/continuous-head-v3/'+f.path)],'Actual reviewed continuous head and closed eyes/socket/oral structure; original paint and expression channels retained. Performance and full all-angle anatomy are not accepted.');
head.required=false;manifest.components.push(head);manifest.version='0.1.2-current';manifest.startupComponents={continuousHeadV3:true};
const bandRoot='selected-production/components/headband-v2/';const bandContract=JSON.parse(fs.readFileSync(path.join(runtime,bandRoot+'contract.json')));
const band=component('headband-continuous-shell',[bandRoot+'contract.json',...bandContract.files.map(f=>bandRoot+f.path)],'Reviewed continuous rigid Head-local ribbon and source grey-white paint. Fixed attachment, not cloth simulation or final visual quality.');
band.required=false;manifest.components.push(band);manifest.version='0.1.3-current';manifest.startupComponents.headbandV2=true;
manifest.reservedComponents=manifest.reservedComponents.filter(row=>!['continuous-head-v3','headband-continuous-shell'].includes(row.id));
manifest.components.find(row=>row.id==='source-face-default').status='available-original-comparison';
for(const id of ['continuous-head-v3','headband-continuous-shell'])manifest.components.find(row=>row.id===id).status='startup-selected-development';
manifest.version='0.1.4-current';
const hairRoot='selected-production/components/hair-v1/';const hairContract=JSON.parse(fs.readFileSync(path.join(runtime,hairRoot+'contract.json')));
const hair=component('selected-hair-continuous',[hairRoot+'contract.json',...hairContract.files.map(f=>hairRoot+f.path)],'Five source-painted continuous locks, static Head-local attachment. Repairs finite side/back topology, not hair physics or accepted final all-angle art.');
hair.required=false;hair.status='startup-selected-development';manifest.components.push(hair);manifest.startupComponents.hairV1=true;manifest.capabilities.hairPhysics=false;manifest.version='0.1.5-current';
for(const folder of ['reports','assets'])fs.mkdirSync(path.join(here,folder),{recursive:true});
fs.writeFileSync(path.join(here,'component-manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log(JSON.stringify({version:manifest.version,components:manifest.components.length,requiredFiles:manifest.components.reduce((n,c)=>n+c.files.length,0),finalAccepted:false}));
