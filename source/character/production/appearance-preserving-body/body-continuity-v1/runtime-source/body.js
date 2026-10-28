import * as THREE from '../../../rig3d-prototype/vendor/three.module.js';

// Only the uncluttered garment area of the accepted front concept is used.
// The source video remains authoritative for the face and hair.
export function createStudyBust({parent,resources,garmentTexture}) {
  const root=new THREE.Group();root.name='auxiliary-painted-garment';parent.add(root);
  const own=v=>{resources.add(v);return v;};
  const basic=color=>own(new THREE.MeshBasicMaterial({color,toneMapped:false}));
  const navy=basic('#202c46'),shade=basic('#172139'),cream=basic('#c9c3b9'),skin=basic('#c8b9a9');
  const mesh=(name,geometry,material,position,scale)=>{
    const m=new THREE.Mesh(own(geometry),material);m.name=name;
    if(position)m.position.set(...position);if(scale)m.scale.set(...scale);root.add(m);return m;
  };
  mesh('neck inside collar',new THREE.CylinderGeometry(.080,.095,.22,40),skin,[0,.686,-.015]);
  // Back and side volume stays plain: no room, face, or hands are sampled.
  mesh('closed upper garment volume',new THREE.SphereGeometry(1,48,36),navy,[0,.285,-.045],[.355,.385,.235]);
  const positions=[],uv=[],indices=[];
  const rows=58,cols=64;
  for(let iy=0;iy<=rows;iy++) {
    const y=-.08+iy/rows*.735;
    const norm=(y-.285)/.385;
    const width=.355*Math.sqrt(Math.max(.025,1-norm*norm));
    for(let ix=0;ix<=cols;ix++) {
      const u=ix/cols*2-1,x=width*u;
      const z=-.045+.238*Math.sqrt(Math.max(.002,1-norm*norm))*Math.sqrt(Math.max(0,1-u*u));
      positions.push(x,y,z+.003);
      uv.push((580+x*201)/1144,1-(835-y*201)/1375);
      if(ix<cols&&iy<rows){const k=iy*(cols+1)+ix;indices.push(k,k+1,k+cols+1,k+1,k+cols+2,k+cols+1);}
    }
  }
  const g=own(new THREE.BufferGeometry());g.setAttribute('position',new THREE.Float32BufferAttribute(positions,3));g.setAttribute('uv',new THREE.Float32BufferAttribute(uv,2));g.setIndex(indices);g.computeVertexNormals();
  const paint=own(new THREE.MeshBasicMaterial({map:garmentTexture,color:garmentTexture?0xffffff:0x202c46,toneMapped:false,side:THREE.FrontSide}));
  const front=new THREE.Mesh(g,paint);front.name='curved garment paint only';root.add(front);
  for(const sign of [-1,1]) {
    const sleeve=mesh(`${sign<0?'left':'right'} shaped sleeve`,new THREE.SphereGeometry(1,40,28),navy,[sign*.36,.37,-.025],[.155,.265,.18]);sleeve.rotation.z=sign*.24;
    mesh(`${sign<0?'left':'right'} sleeve fold`,new THREE.SphereGeometry(1,32,24),shade,[sign*.421,.29,.113],[.045,.17,.025]);
    const arm=mesh(`${sign<0?'left':'right'} sleeve continuation`,new THREE.CapsuleGeometry(.106,.31,12,32),navy,[sign*.411,.01,-.015]);arm.rotation.z=sign*.10;
  }
  // Collar pieces are recessed below the head rather than a large white ring.
  for(const sign of [-1,1]) {
    const shape=new THREE.Shape();shape.moveTo(sign*.032,.677);shape.lineTo(sign*.15,.642);shape.lineTo(sign*.098,.548);shape.lineTo(sign*.012,.612);shape.closePath();
    mesh('pointed ivory collar',new THREE.ShapeGeometry(shape,8),cream,[0,0,.145]);
  }
  function update(dt,time,state) {
    const idle=state.mode==='idle';root.rotation.y=state.yaw*.22;
    root.position.y=idle?Math.sin(time*1.65)*.004:0;
  }
  return{root,update,metadata:{scope:'head and shoulder visual probe',garmentSource:'production/v1/neutral-front.png',garmentIsAuxiliary:true}};
}
