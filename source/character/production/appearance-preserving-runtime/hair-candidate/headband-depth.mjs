// Independent structural experiment. Never changes the frozen source or default GLB.
// Source X/Y, UV and paint stay in place; only an inferred frill depth field changes.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const sourceFrontZ=(x,y)=>.052+.013*Math.cos(x*8)+.008*Math.sin(y*10);
const inferredFrillFrontZ=(x,y)=>.015+.50*Math.sqrt(Math.max(0,1-(x/.86)**2-((y-.17)/.78)**2));

function capArch(geometry,THREE){
  const source=geometry.attributes.position.array;
  const colors=geometry.attributes.color.array;
  const positions=Array.from(source),rgba=Array.from(colors),indices=Array.from(geometry.index.array);
  const cols=16,segments=96;
  for(const row of [0,segments]){
    const start=row*(cols+1),center=positions.length/3;
    const p=[0,0,0],c=[0,0,0];
    for(let j=0;j<cols;j++)for(let k=0;k<3;k++){p[k]+=source[(start+j)*3+k]/cols;c[k]+=colors[(start+j)*3+k]/cols;}
    positions.push(...p);rgba.push(...c);
    for(let j=0;j<cols;j++){
      let a=start+j,b=start+j+1;
      const u=[positions[a*3]-p[0],positions[a*3+1]-p[1],positions[a*3+2]-p[2]];
      const v=[positions[b*3]-p[0],positions[b*3+1]-p[1],positions[b*3+2]-p[2]];
      const ny=u[2]*v[0]-u[0]*v[2];
      if(ny>0)[a,b]=[b,a]; // Both arch endpoints open toward decreasing Y.
      indices.push(center,a,b);
    }
  }
  geometry.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));
  geometry.setAttribute('color',new THREE.Float32BufferAttribute(rgba,3));
  geometry.setIndex(indices);geometry.computeVertexNormals();
  return {addedVertices:2,addedTriangles:32};
}

export function installSelectedHeadbandCandidate(root,THREE,{strength=.55}={}){
  const entries=[];let cap=null;
  root.traverse(mesh=>{
    if(!mesh.isMesh)return;
    const frill=/^(left|right)-painted-white-frill:/.test(mesh.name);
    const arch=mesh.name==='continuous-rounded-three-dimensional-headband';
    if(!frill&&!arch)return;
    const original=mesh.geometry,geometry=original.clone();mesh.geometry=geometry;
    const rest=Float32Array.from(geometry.attributes.position.array);
    if(arch)cap=capArch(geometry,THREE);
    entries.push({mesh,original,geometry,rest,frill,arch});
  });
  if(entries.filter(e=>e.frill).length!==6||!cap){
    for(const entry of entries){entry.mesh.geometry=entry.original;entry.geometry.dispose();}
    throw Error('Selected source frill/headband names do not match; no generic replacement used');
  }
  let current=0;
  function setStrength(value){
    if(!Number.isFinite(value))throw TypeError('Finite structural depth strength required');
    current=clamp(value);
    for(const entry of entries){
      if(!entry.frill)continue;
      const a=entry.geometry.attributes.position.array;
      for(let i=0;i<a.length;i+=3){
        const x=entry.rest[i],y=entry.rest[i+1];
        a[i+2]=entry.rest[i+2]+current*(inferredFrillFrontZ(x,y)-sourceFrontZ(x,y));
      }
      entry.geometry.attributes.position.needsUpdate=true;
      entry.geometry.computeVertexNormals();entry.geometry.computeBoundingBox();entry.geometry.computeBoundingSphere();
    }
    root.updateMatrixWorld(true);
  }
  setStrength(strength);
  return {
    entries,setStrength,
    metadata(){return {schema:'dafeiyu.selected-headband-depth-candidate.v1',strength:current,meshCount:entries.length,archCaps:cap,inferredDepth:true,frontProjectionAndUVUnchanged:true,scope:'Local Z-only frill experiment and arch end closure. Not an approved style, complete hair reconstruction, cloth physics or full-angle pass.'};},
    dispose(){for(const entry of entries){entry.mesh.geometry=entry.original;entry.geometry.dispose();}}
  };
}
