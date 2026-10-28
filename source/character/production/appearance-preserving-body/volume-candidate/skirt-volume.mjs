import * as THREE from '../../rig3d-prototype/vendor/three.module.js';
const smooth=x=>{x=Math.max(0,Math.min(1,x));return x*x*(3-2*x);};

/** One local inferred-Z study; original XY, UV, colors, indices and weights stay. */
export function installSkirtVolume(model,{depthGain=.85}={}){
  if(!Number.isFinite(depthGain)||depthGain<0||depthGain>1.1)throw Error('depthGain must be in [0,1.1]');
  let mesh;model.root.traverse(o=>{if(o.isMesh&&o.name==='continuous flared skirt, painted front apron and encircling ivory hem')mesh=o;});
  if(!mesh)throw Error('Selected original skirt is required');
  const previous=mesh.geometry,geometry=previous.clone(),position=geometry.attributes.position;
  const rings=mesh.userData.volumeStudy?.sectionRings;
  if(rings?.length!==29||rings.some(r=>r.length!==96))throw Error('Unexpected frozen skirt ring contract');
  const modified=new Set();
  for(let row=0;row<rings.length;row++){
    const t=row/(rings.length-1),gain=1+depthGain*smooth((t-.12)/.88);
    for(const id of rings[row]){position.setZ(id,-.015+(position.getZ(id)+.015)*gain);modified.add(id);}
  }
  // Original cap centers follow the average of their actual surrounding ring.
  for(const [ring,id]of [[rings[0],position.count-2],[rings.at(-1),position.count-1]]){
    const z=ring.reduce((sum,v)=>sum+position.getZ(v),0)/ring.length;position.setZ(id,z);modified.add(id);
  }
  position.needsUpdate=true;geometry.computeVertexNormals();geometry.computeBoundingBox();geometry.computeBoundingSphere();mesh.geometry=geometry;
  const metadata={schema:'dafeiyu.selected-skirt-inferred-depth.v1',scope:'Single skirt inferred-depth candidate only, not cloth simulation or final back design',depthGain,modifiedVertices:modified.size,preserved:['position XY','original UV','source textures/materials/colors','index topology','all22 body bones and skin weights'],changed:['position Z inferred from original width','normals derived from actual changed geometry'],sourceCoordinateScale:'Uncalibrated original study units, not physical metres',method:'z = -0.015 + (sourceZ+0.015)*(1+depthGain*smoothstep((rowT-.12)/.88)); cap centers follow actual ring mean',limits:['Front occlusion must be reviewed; fixed XY alone does not guarantee unchanged render','No new side/back painting','No collision, thickness material, dynamics or force validation','Other source body/head/hair/shoe issues remain']};
  return{mesh,geometry,previous,metadata,dispose(){mesh.geometry=previous;geometry.dispose();}};
}
