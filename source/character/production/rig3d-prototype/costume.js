import * as THREE from './vendor/three.module.js';

export function buildCostume(c){
  const {add,ellipsoid,segment,shapeGeometry,tube,rigid,between,pelvis,spine,chest,neck,limbs,boneIds,bindPositions}=c;
  const torsoWeight=p=>p.y>1.77?between(chest,neck)(p):between(pelvis,chest)(p);
  const pts=a=>a.map(p=>new THREE.Vector3(...p));
  const skirtDepth=.78;
  const skirtR=y=>{const t=THREE.MathUtils.clamp((1.35-y)/.79,0,1);return .30+.35*Math.pow(t,.74);};
  const frontZ=(x,y,extra=0)=>Math.sqrt(Math.max(.01,skirtR(y)**2-x*x))*skirtDepth+extra;
  function surface(rows,cols,point,material,weighting){
    const p=[],ids=[];
    for(let j=0;j<=rows;j++)for(let i=0;i<=cols;i++)p.push(...point(i/cols,j/rows));
    for(let j=0;j<rows;j++)for(let i=0;i<cols;i++){const k=j*(cols+1)+i;ids.push(k,k+cols+1,k+1,k+1,k+cols+1,k+cols+2);}
    const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(p,3));g.setIndex(ids);g.computeVertexNormals();add(g,material,weighting);
  }
  function mappedShape(shape,material,map,weighting,depth=.008){const g=shapeGeometry(shape,depth),p=g.getAttribute('position');const o=map(0,0,0),x=map(.01,0,0),y=map(0,.01,0),flip=(x[0]-o[0])*(y[1]-o[1])-(x[1]-o[1])*(y[0]-o[0])<0;for(let i=0;i<p.count;i++){const q=map(p.getX(i),p.getY(i),p.getZ(i));p.setXYZ(i,...q);}if(flip)for(let i=0;i<p.count;i+=3){const a=[p.getX(i+1),p.getY(i+1),p.getZ(i+1)];p.setXYZ(i+1,p.getX(i+2),p.getY(i+2),p.getZ(i+2));p.setXYZ(i+2,...a);}g.computeVertexNormals();add(g,material,weighting);}
  function cuff(a,b,r,material,weighting){segment(new THREE.Vector3(...a),new THREE.Vector3(...b),r,r,material,weighting);}

  ellipsoid([0,1.56,-.015],[.365,.365,.265],'dress',torsoWeight,40);
  segment(new THREE.Vector3(0,1.84,0),new THREE.Vector3(0,2.07,0),.105,.10,'skin',between(chest,neck));
  for(const l of limbs){
    const sh=bindPositions.get(l.shoulder),el=bindPositions.get(l.elbow),wr=bindPositions.get(l.wrist);
    ellipsoid(sh.clone().add(new THREE.Vector3(l.side*.015,-.025,0)).toArray(),[.19,.205,.18],'dress',rigid(l.shoulder),32);
    segment(sh,el,.165,.117,'dress',between(l.shoulder,l.elbow));
    ellipsoid(el.toArray(),[.119,.119,.119],'dress',rigid(l.elbow),24);
    segment(el,wr,.118,.077,'dress',between(l.elbow,l.wrist));
    const axis=wr.clone().sub(el).normalize(),upper=wr.clone().addScaledVector(axis,-.045),lower=wr.clone().addScaledVector(axis,.017);
    segment(upper,lower,.092,.095,'white',rigid(l.wrist));
    segment(upper.clone().addScaledVector(axis,.025),upper.clone().addScaledVector(axis,.037),.096,.096,'navy',rigid(l.wrist));
    const hand=wr.clone().add(new THREE.Vector3(l.side*.020,-.095,.025));
    ellipsoid(hand.toArray(),[.096,.107,.054],'skin',rigid(l.wrist),28);
    for(let i=0;i<4;i++){
      const x=hand.x+(i-1.5)*.036,y=hand.y-.069-Math.sin((i+1)/5*Math.PI)*.005;
      ellipsoid([x,y,hand.z+.003],[.023,.042-Math.abs(i-1.5)*.006,.024],'skin',rigid(l.wrist),16);
    }
    ellipsoid([hand.x-l.side*.086,hand.y+.002,hand.z+.029],[.038,.055,.029],'skin',rigid(l.wrist),20);
    segment(bindPositions.get(l.hip),bindPositions.get(l.knee),.125,.109,'skin',between(l.hip,l.knee));
    segment(bindPositions.get(l.knee),bindPositions.get(l.ankle),.112,.084,'white',between(l.knee,l.ankle));
    cuff([l.side*.20,.568,.025],[l.side*.20,.538,.029],.115,'white',rigid(l.knee));
    ellipsoid([l.side*.20,.118,.14],[.158,.112,.239],'navy',rigid(l.ankle),32);
    ellipsoid([l.side*.20,.047,.14],[.161,.027,.242],'ink',rigid(l.ankle),32);
    ellipsoid([l.side*.20,.212,.13],[.093,.020,.123],'white',rigid(l.ankle),24);
    tube(pts([[l.side*.20-.12,.184,.19],[l.side*.20,.235,.205],[l.side*.20+.12,.184,.19]]),.021,'navy',rigid(l.ankle),20);
    ellipsoid([l.side*.20+.12,.185,.194],[.020,.018,.013],'gold',rigid(l.ankle),14);
  }

  // A gently pleated bell skirt, its outer shell following the hips and waist.
  surface(28,96,(u,v)=>{
    const a=u*Math.PI*2,y=1.35-v*.79,r=skirtR(y)+.015*v*v*Math.cos(a*12);
    return [Math.sin(a)*r,y+Math.cos(a*12)*.004*v,Math.cos(a)*r*skirtDepth];
  },'dress',p=>{const t=THREE.MathUtils.smoothstep(p.y,.65,1.36);return[boneIds.get(pelvis),boneIds.get(spine),1-t*.16,t*.16];});
  // One continuous rippled underskirt rather than individual bead-like shapes.
  surface(10,144,(u,v)=>{const a=u*Math.PI*2,r=.60+v*.095+.010*Math.sin(a*24)*v;return[Math.sin(a)*r,.57-v*.09+.020*Math.cos(a*24)*v,Math.cos(a)*r*skirtDepth];},'white',rigid(pelvis));
  for(const y of [.624,.653]){
    const line=[];for(let i=0;i<=96;i++){const a=i/96*Math.PI*2,r=skirtR(y)+.003;line.push(new THREE.Vector3(Math.sin(a)*r,y,Math.cos(a)*r*skirtDepth));}tube(line,.0055,'hairShade',rigid(pelvis),96);
  }
  for(const side of [-1,1])for(let i=0;i<3;i++){
    const a=side*(.84+i*.19),r=skirtR(.765);ellipsoid([Math.sin(a)*r,.765,Math.cos(a)*r*skirtDepth+.006],[.018,.018,.012],'white',rigid(pelvis),12);
  }
  const belt=new THREE.CylinderGeometry(.315,.335,.083,64,2,true);belt.scale(1,1,skirtDepth).translate(0,1.365,0);add(belt,'white',rigid(spine));
  // Rear sash follows the inferred turnaround, rather than exposing a floating
  // belt end at the back. Both wings and folded tails have real thickness.
  const sashWing=new THREE.Shape();sashWing.moveTo(0,0);sashWing.bezierCurveTo(.07,.04,.20,.14,.285,.095);sashWing.quadraticCurveTo(.315,.015,.27,-.08);sashWing.quadraticCurveTo(.15,-.11,0,0);sashWing.closePath();
  const sashTail=new THREE.Shape();sashTail.moveTo(0,0);sashTail.quadraticCurveTo(.075,-.01,.105,-.07);sashTail.lineTo(.185,-.42);sashTail.lineTo(.092,-.385);sashTail.lineTo(.035,-.43);sashTail.quadraticCurveTo(.025,-.17,0,0);sashTail.closePath();
  for(const side of [-1,1]){
    mappedShape(sashWing,'white',(x,y,z)=>[side*x,1.365+y,-.295-z-.09*x],rigid(pelvis),.028);
    mappedShape(sashTail,'white',(x,y,z)=>[side*(x+.02),1.345+y,-skirtR(1.345+y)*skirtDepth-.018-z],rigid(pelvis),.015);
  }
  ellipsoid([0,1.365,-.328],[.042,.052,.033],'white',rigid(pelvis),24);
  // Navy bib, thin white straps and fabric ruffles leave the blue chest visible.
  ellipsoid([0,1.60,.247],[.218,.223,.034],'navy',torsoWeight,32);
  for(const side of [-1,1]){
    surface(26,4,(u,v)=>{const y=1.88-v*.46,x=side*(.195+(u-.5)*.053);return[x,y,.235+.042*Math.sin(v*Math.PI)];},'white',torsoWeight);
    surface(30,6,(u,v)=>{const y=1.88-v*.46,x=side*(.225+u*.055);return[x,y+.006*Math.sin(v*Math.PI*16)*u,.233+.040*Math.sin(v*Math.PI)+.017*Math.sin(v*Math.PI*16)*u];},'white',torsoWeight);
    const collar=new THREE.Shape();collar.moveTo(0,0);collar.quadraticCurveTo(.10,-.01,.14,-.09);collar.lineTo(.055,-.16);collar.lineTo(-.025,-.025);collar.closePath();
    mappedShape(collar,'white',(x,y,z)=>[side*(.035+x),2.00+y,.19+z],rigid(chest),.020);
  }
  const bow=new THREE.Shape();bow.moveTo(0,0);bow.bezierCurveTo(.055,.035,.12,.085,.178,.064);bow.quadraticCurveTo(.195,-.004,.163,-.073);bow.quadraticCurveTo(.07,-.054,0,0);bow.closePath();
  for(const side of [-1,1])mappedShape(bow,'navy',(x,y,z)=>[side*x,1.864+y,.294+z+.06*x],rigid(chest),.032);
  for(const side of [-1,1]){
    const ribbon=new THREE.Shape();ribbon.moveTo(0,0);ribbon.lineTo(.062,-.015);ribbon.lineTo(.093,-.143);ribbon.lineTo(.043,-.119);ribbon.lineTo(-.008,-.140);ribbon.closePath();
    mappedShape(ribbon,'navy',(x,y,z)=>[side*(.025+x),1.846+y,.284+z],rigid(chest),.016);
  }
  ellipsoid([0,1.865,.334],[.039,.049,.026],'gold',rigid(chest),24);
  ellipsoid([0,1.865,.357],[.027,.035,.014],'iris',rigid(chest),24);
  for(let i=0;i<3;i++)ellipsoid([0,1.72-i*.12,.289],[.012,.012,.007],'white',torsoWeight,16);

  function apronAt(u,v){const x=u*(.235+.115*Math.sin(v*Math.PI*.78)),y=1.315-v*.59+.11*u*u*v**4;return[x,y,frontZ(x,y,.022)+.003*Math.sin(u*Math.PI*3)*Math.sin(v*Math.PI)];}
  surface(32,32,(u,v)=>apronAt(u*2-1,v),'white',rigid(pelvis));
  const edge=[];
  for(let i=0;i<=32;i++)edge.push(apronAt(-1,i/32));
  for(let i=1;i<=48;i++)edge.push(apronAt(-1+i/24,1));
  for(let i=1;i<=32;i++)edge.push(apronAt(1,1-i/32));
  surface(6,edge.length-1,(u,v)=>{
    const n=Math.min(edge.length-1,Math.round(v*(edge.length-1))),p=edge[n],prev=edge[Math.max(0,n-1)],next=edge[Math.min(edge.length-1,n+1)];
    const dx=next[0]-prev[0],dy=next[1]-prev[1],len=Math.hypot(dx,dy)||1,phase=v*Math.PI*2*17;
    const x=p[0]-dy/len*u*.048,y=p[1]+dx/len*u*.048+.004*Math.sin(phase)*u;
    return[x,y,frontZ(x,y,.023)+Math.sin(phase)*.016*u];
  },'white',rigid(pelvis));
  const whale=new THREE.Shape();
  whale.moveTo(-.135,-.010);whale.bezierCurveTo(-.14,.060,-.065,.105,.012,.080);whale.bezierCurveTo(.070,.060,.090,.002,.12,.024);whale.quadraticCurveTo(.12,.075,.170,.070);whale.quadraticCurveTo(.170,.025,.131,.007);whale.quadraticCurveTo(.17,-.015,.17,-.050);whale.quadraticCurveTo(.111,-.055,.09,-.027);whale.bezierCurveTo(.018,-.080,-.098,-.074,-.135,-.010);whale.closePath();
  mappedShape(whale,'iris',(x,y,z)=>[x,1.035+y,frontZ(x,1.035+y,.033)+z],rigid(pelvis),.004);
  ellipsoid([-.084,1.06,frontZ(-.084,1.06,.047)],[.009,.009,.004],'white',rigid(pelvis),12);
  const belly=new THREE.Shape();belly.moveTo(-.112,-.018);belly.quadraticCurveTo(-.025,-.024,.055,-.034);belly.quadraticCurveTo(-.04,-.068,-.112,-.018);belly.closePath();mappedShape(belly,'white',(x,y,z)=>[x,1.035+y,frontZ(x,1.035+y,.040)+z],rigid(pelvis),.002);
  ellipsoid([-.003,1.164,frontZ(-.003,1.164,.039)],[.014,.022,.006],'iris',rigid(pelvis),16);
}
