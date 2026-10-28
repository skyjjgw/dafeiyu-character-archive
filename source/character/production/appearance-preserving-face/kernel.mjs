// Direct mathematical port of the frozen 4348 face. No Three dependency,
// image editing, image frame selection, generic face or replacement iris.
const TAU=Math.PI*2;
const clamp=(v,a=0,b=1)=>Math.min(b,Math.max(a,Number.isFinite(v)?v:0));
const mix=(a,b,t)=>a+(b-a)*t;
const smooth=t=>t*t*(3-2*t);
const srgbToLinear=c=>c<.04045?c*.0773993808:Math.pow(c*.9478672986+.0521327014,2.4);
export function normalizeState(input={}) {
 const talk=input.talk??input.talking??0,mood=['neutral','happy','sad'].includes(input.mood)?input.mood:'neutral';
 return {blink:clamp(Number(input.blink)),talk:clamp(talk===true?1:Number(talk)),mood,happy:clamp(Number(input.happy??(mood==='happy'?1:0))),sad:clamp(Number(input.sad??(mood==='sad'?1:0))),gazeX:clamp(Number(input.gazeX),-1,1),gazeY:clamp(Number(input.gazeY),-1,1)};
}
export function createFaceKernel(config) {
 const eyes=config.eyes,mc=config.mouthCenter,mh=config.mouthHole,outline=config.rightOutline,profile=config.profile;
 const C=Math.cos(config.tilt),S=Math.sin(config.tilt),fields=profile.fields,rows=profile.table;
 function interval(y){let lo=0,hi=outline.length-1;while(hi-lo>1){const mid=(lo+hi)>>1;if(outline[mid][1]>=y)lo=mid;else hi=mid;}return [lo,hi];}
 function centerAt(y){const yy=clamp(y,-.382,.64),[lo,hi]=interval(yy),ay=outline[lo][1],by=outline[hi][1],k=ay===by?0:(ay-yy)/(ay-by);return mix(.023*smooth(clamp((-ay-.1)/.282)),.023*smooth(clamp((-by-.1)/.282)),k);}
 function widthAt(y){const yy=clamp(y,-.382,.64),[lo,hi]=interval(yy),[ax,ay]=outline[lo],[bx,by]=outline[hi];return Math.max(.0001,mix(ax,bx,ay===by?0:(ay-yy)/(ay-by))-centerAt(yy));}
 function section(y){const yy=clamp(y,profile.minY,profile.maxY),p=(yy-profile.minY)/(profile.maxY-profile.minY)*profile.resolution,i=Math.min(profile.resolution-1,Math.floor(p)),k=p-i,s={y:yy};for(let n=0;n<fields.length;n++)s[fields[n]]=mix(rows[i][n],rows[i+1][n],k);if(s.width<.05){s.width=widthAt(yy);s.center=centerAt(yy);}return s;}
 function lateral(s,x){if(s.width<1e-8)return 0;let u=(x-s.center)/s.width;if(Math.abs(u)>.96){const w=widthAt(s.y);u=w>1e-8?(x-centerAt(s.y))/w:0;}u=clamp(u,-1,1);return Math.abs(u)>1-1e-6?Math.sign(u):u;}
 function frontZ(x,y){const s=section(y),u=lateral(s,x),o=profile.parameters;if(Math.abs(u)===1)return mix(.015,s.seamZ,o.strength);const legacy=curve=>.015+s.legacyDepth*(curve??Math.pow(Math.max(0,1-u*u),.25))+s.legacyNose*Math.exp(-Math.pow((x-.02)/.075,2));if(o.strength===0)return legacy();const curve=Math.pow(Math.max(0,1-u*u),o.cheekExponent),base=s.seamZ+(s.baseCenterZ-s.seamZ)*curve,axis=clamp(s.axisX,s.center-s.width,s.center+s.width),axisU=lateral(s,axis),atAxis=s.seamZ+(s.baseCenterZ-s.seamZ)*Math.pow(Math.max(0,1-axisU*axisU),o.cheekExponent),available=x>=axis?s.center+s.width-axis:axis-(s.center-s.width),q=available>1e-8?(x-axis)/available:0,kernel=Math.exp(-Math.pow((x-axis)/s.featureWidth,4))*Math.sqrt(Math.max(0,1-q*q)),candidate=base+(s.midlineZ-atAxis)*kernel;return o.strength===1?candidate:mix(legacy(o.cheekExponent===.25?curve:undefined),candidate,o.strength);}
 function profileY(points,x){for(let i=0;i<points.length-1;i++)if(x<=points[i+1][0]){const t=clamp((x-points[i][0])/(points[i+1][0]-points[i][0])),a=points[Math.max(0,i-1)][1],b=points[i][1],c=points[i+1][1],d=points[Math.min(points.length-1,i+2)][1];return .5*(2*b+(-a+c)*t+(2*a-5*b+4*c-d)*t*t+(-a+3*b-3*c+d)*t*t*t);}return points.at(-1)[1];}
 function lidY(e,u,top,s){const x=mix(e.minX,e.maxX,(u+1)/2),arc=Math.pow(Math.max(0,1-u*u),.60),chord=mix(e.upper[0][1],e.upper.at(-1)[1],(u+1)/2),closed=chord+(.013+.020*s.happy-.006*s.sad)*arc,open=profileY(top?e.upper:e.lower,x)+(top?-.022*s.happy-.018*s.sad:.022*s.happy)*arc;return mix(open,closed,s.blink);}
 function aperture(e,t,s){const u=Math.cos(t);return [mix(e.minX,e.maxX,(u+1)/2),lidY(e,u,Math.sin(t)>=0,s)];}
 const ellipse=(center,rx,top,bottom,t)=>{const sine=Math.sin(t);return [center[0]+rx*Math.cos(t),center[1]+(sine>=0?top:bottom)*sine];};
 function eyeOuter(e,t,expand=0){return ellipse(e.center,e.outerX+expand,e.outerTop+expand,e.outerBottom+expand,t);}
 function mouthOuter(t,expand=0){return ellipse(mc,mh.rx+expand,mh.top+expand,mh.bottom+expand,t);}
 function mouthPoint(t,s){const u=Math.cos(t),arc=Math.sqrt(Math.max(0,1-u*u)),top=Math.sin(t)>=0,width=.073+.009*s.happy+.016*s.talk,smile=(.010+.009*s.happy-.017*s.sad)*(u*u-.45),upper=.009*s.talk*arc,lower=-(.053*s.talk+.012*s.happy)*arc;return [mc[0]+u*width,mc[1]+smile+(top?upper:lower)];}
 function skinColor(x,y){const blush=Math.exp(-(((x+.29)/.17)**2)-(((y+.17)/.105)**2))+1.08*Math.exp(-(((x-.32)/.16)**2)-(((y+.17)/.105)**2)),shadow=Math.max(x,0)*12;return [clamp((205-16*x+10*Math.min(y,0)+4*blush-shadow)/255),clamp((193-15*x+7*Math.min(y,0)-25*blush-shadow)/255),clamp((177-17*x+6*Math.min(y,0)-29*blush-shadow)/255)].map(srgbToLinear);}
 const xyz=(q,offset)=>[q[0],q[1],frontZ(q[0],q[1])+offset];
 function stripPath(role,e,u,s){
  if(role==='lips')return mouthPoint(Math.PI+Math.PI*u,s);
  if(role==='crease'){const f=mix(.22,.88,u),x=mix(e.minX,e.maxX,f);return [x,lidY(e,f*2-1,true,{...s,blink:0})+.060+.002*s.blink+s.sad*.016*(e.index===0?u:1-u)];}
  return [mix(e.minX,e.maxX,u),lidY(e,mix(-1,1,u),role==='upper_lash',s)];
 }
 function stripWidth(role,u,s){if(role==='upper_lash')return mix(.006+.028*Math.pow(Math.sin(Math.PI*u),.55),.0025+.0065*Math.pow(Math.sin(Math.PI*u),.65),s.blink);if(role==='lower_lash')return .0015+.0016*Math.sin(Math.PI*u);if(role==='crease')return .0040*Math.pow(Math.sin(Math.PI*u),.6);const gap=smooth(clamp((Math.abs(u-.5)-.055)/.030)),connected=mix(gap,1,clamp(s.talk*8+s.happy));return (.0027+.0007*Math.sin(Math.PI*u))*connected;}
 function sampleVertex(p,s){
  const e=eyes[p.eye??0],role=p.role;
  if(role==='iris'){
   const rx=e.irisRadius[0]/775,ry=e.irisRadius[1]/775,gx=s.gazeX*.014,gy=s.gazeY*.010,cx=e.irisCenter[0]+gx,cy=e.irisCenter[1]+gy,u=p.columnU,x=cx+u*rx,extent=ry*Math.sqrt(Math.max(0,1-u*u)),ex=clamp((x-e.minX)/(e.maxX-e.minX)*2-1,-1,1),lo=Math.max(cy-extent,lidY(e,ex,false,s)+.0003),hi=Math.min(cy+extent,lidY(e,ex,true,s)-.0003),y=mix(lo,Math.max(lo,hi),p.rowV),xx=x-gx,yy=y-gy;
   return {position:[x,y,frontZ(x,y)+.0048],uv:[(815+775*(C*xx-S*yy))/config.sourceSize[0],1-(583-775*(S*xx+C*yy))/config.sourceSize[1]]};
  }
  if(role==='wing'){
   const sign=e.index===0?-1:1,q=stripPath('upper_lash',e,e.index===0?0:1,s),points=[[q[0]+sign*.035,q[1]+.035*(1-s.blink*.5)],[q[0]-sign*.014,q[1]+.051*(1-s.blink*.65)],[q[0]-sign*.018,q[1]-.027*(1-s.blink)]];
   return {position:xyz(points[p.wingCorner],.0083)};
  }
  if(['upper_lash','lower_lash','crease','lips'].includes(role)){
   const u=p.u,a=stripPath(role,e,clamp(u-.0005),s),b=stripPath(role,e,clamp(u+.0005),s),q=stripPath(role,e,u,s),dx=b[0]-a[0],dy=b[1]-a[1],len=Math.hypot(dx,dy)||1,w=stripWidth(role,u,s),x=q[0]-dy/len*w*p.edgeSign/2,y=q[1]+dx/len*w*p.edgeSign/2;
   return {position:xyz([x,y],{upper_lash:.0080,lower_lash:.0070,crease:.0072,lips:.0075}[role])};
  }
  let a,b,offset,colored=false;const t=p.theta,k=p.radialK;
  if(role==='eye_ring'){a=eyeOuter(e,t,.025);b=aperture(e,t,s);offset=.006;colored=true;}
  else if(role==='sclera'){a=aperture(e,t,s);b=e.center;offset=.0032;}
  else if(role==='mouth_ring'){a=mouthOuter(t,.025);b=mouthPoint(t,s);offset=.006;colored=true;}
  else if(role==='mouth_cavity'){a=mouthPoint(t,s);b=[mc[0],mc[1]-.02*s.talk];offset=.003;}
  else if(role==='tongue'){const q=mouthPoint(t,s);a=[mix(mc[0],q[0],.62),mix(mc[1]-.036*s.talk,q[1],.33)];b=[mc[0],mc[1]-.035*s.talk];offset=.004;}
  else throw Error('Unknown face vertex role '+role);
  const x=mix(a[0],b[0],k),y=mix(a[1],b[1],k),result={position:xyz([x,y],offset)};
  if(colored)result.color=[...skinColor(x,y),smooth(clamp(Math.hypot(x-a[0],y-a[1])/.017))];
  return result;
 }
 function canonical(mesh,index){const d=mesh.semantic;
  if(d.role==='iris')return {...d,columnU:(index%(d.cols+1))/d.cols*2-1,rowV:Math.floor(index/(d.cols+1))/d.rows};
  if(d.role==='wing')return {...d,wingCorner:index};
  if(d.steps!==undefined)return {...d,u:Math.floor(index/2)/d.steps,edgeSign:index%2===0?-1:1};
  return {...d,theta:(index%(d.segments+1))/d.segments*TAU,radialK:Math.floor(index/(d.segments+1))/d.rings};
 }
 function evaluateMesh(mesh,input){const s=normalizeState(input),result={position:new Float32Array(mesh.vertices*3),visible:mesh.semantic.role==='iris'?s.blink<.993:mesh.semantic.role==='sclera'?s.blink<.998:mesh.semantic.role==='tongue'?s.talk>.25:true};if(mesh.semantic.role==='iris')result.uv=new Float32Array(mesh.vertices*2);if(['eye_ring','mouth_ring'].includes(mesh.semantic.role))result.color=new Float32Array(mesh.vertices*4);for(let i=0;i<mesh.vertices;i++){const value=sampleVertex(canonical(mesh,i),s);result.position.set(value.position,i*3);if(result.uv)result.uv.set(value.uv,i*2);if(result.color)result.color.set(value.color,i*4);}return result;}
 return {normalizeState,frontZ,skinColor,lidY,eyeOuter,aperture,mouthOuter,mouthPoint,canonical,sampleVertex,evaluateMesh};
}
