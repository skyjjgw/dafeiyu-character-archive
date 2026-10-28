import fs from 'node:fs';
import {createFaceKernel} from './kernel.mjs';
const source=JSON.parse(fs.readFileSync(new URL('./fixtures/source-samples.json',import.meta.url)));
const bytes=fs.readFileSync(new URL('./fixtures/source-samples.bin',import.meta.url));
const kernel=createFaceKernel(JSON.parse(fs.readFileSync(new URL('./fixtures/source-equations.json',import.meta.url))));
const report={schema:'dafeiyu.selected-face-kernel-parity.v1',authority:source.authority,sourceHashes:source.sourceHashes,states:source.frames.length,meshes:source.dynamicMeshes,components:0,unequalFloat32Components:0,maximumError:0,byAttribute:{},byMesh:{},visibilityMismatches:0};
for(const frame of source.frames)for(const target of frame.meshes){
 const mesh=source.meshes[target.index],actual=kernel.evaluateMesh(mesh,frame.state);
 if(actual.visible!==target.visible)report.visibilityMismatches++;
 let meshMax=0;
 for(const[key,view]of Object.entries(target.attributes)){
  const expected=new Float32Array(bytes.buffer,bytes.byteOffset+view.offset,view.length/4),candidate=actual[key];
  if(candidate.length!==expected.length)throw Error(mesh.name+' '+key+' count mismatch');
  const stat=report.byAttribute[key]??={components:0,unequal:0,maxError:0};
  for(let i=0;i<expected.length;i++){if(!Number.isFinite(candidate[i]))throw Error('Nonfinite');const error=Math.abs(candidate[i]-expected[i]);report.components++;stat.components++;if(error){report.unequalFloat32Components++;stat.unequal++;}report.maximumError=Math.max(report.maximumError,error);stat.maxError=Math.max(stat.maxError,error);meshMax=Math.max(meshMax,error);}
 }
 report.byMesh[mesh.name]=Math.max(report.byMesh[mesh.name]??0,meshMax);
}
report.passed=report.maximumError<1e-7&&report.visibilityMismatches===0;
fs.writeFileSync(new URL('./reports/js-source-parity.json',import.meta.url),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify(report));if(!report.passed)process.exitCode=1;
