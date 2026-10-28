import * as THREE from '../../../rig3d-prototype/vendor/three.module.js';

// A simple studio floor and derived contact cues, not a collision solver.
export function createContactStage() {
  const root=new THREE.Group();root.name='studio floor';
  const resources=[];
  const own=v=>(resources.push(v),v);
  const floor=new THREE.Mesh(own(new THREE.CircleGeometry(1.9,96)),own(new THREE.MeshBasicMaterial({color:'#e3eae7',transparent:true,opacity:.70,toneMapped:false,depthWrite:false})));
  floor.rotation.x=-Math.PI/2;floor.position.y=-1.062;root.add(floor);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=128;
  const context=canvas.getContext('2d');
  const gradient=context.createRadialGradient(64,64,5,64,64,62);gradient.addColorStop(0,'rgba(38,58,68,0.36)');gradient.addColorStop(.45,'rgba(38,58,68,0.13)');gradient.addColorStop(1,'rgba(38,58,68,0)');
  context.fillStyle=gradient;context.fillRect(0,0,128,128);
  const texture=own(new THREE.CanvasTexture(canvas));texture.colorSpace=THREE.SRGBColorSpace;
  const shadows=['left','right'].map(side=>{
    const material=own(new THREE.MeshBasicMaterial({map:texture,transparent:true,toneMapped:false,depthWrite:false}));
    const mesh=new THREE.Mesh(own(new THREE.PlaneGeometry(.54,.40)),material);mesh.rotation.x=-Math.PI/2;mesh.position.y=-1.057;root.add(mesh);return{side,mesh,material};
  });
  const point=new THREE.Vector3();
  function update(rig,state) {
    root.visible=state.framing==='full';
    const contact=rig.getGrounding?.();
    const floorY=(contact?.groundY??-1.055)+(rig.root.position.y||0);floor.position.y=floorY-.007;
    for(const{side,mesh,material}of shadows) {
      const foot=rig.bones?.[`${side}Foot`];if(!foot)continue;
      const sole=contact?.feet?.[side]?.actualSole;
      if(sole)rig.root.localToWorld(point.fromArray(sole));
      else {foot.getWorldPosition(point);point.y-=.118;}
      const height=Math.max(0,point.y-floorY);
      mesh.position.set(point.x,floorY-.002,point.z+.025);
      material.opacity=THREE.MathUtils.clamp(1-height*5,.12,1);
      mesh.scale.setScalar(1+height*.65);
    }
  }
  return{root,update,dispose(){root.removeFromParent();for(const r of resources)r.dispose();}};
}
