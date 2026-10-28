/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */var Nl=0,fc=1,Ol=2;var pc=1,Bl=2,Un=3,Kt=0,Zt=1,Pt=2,qn=0,_i=1,mc=2,gc=3,_c=4,zl=5,ii=100,kl=101,Hl=102,Vl=103,Gl=104,Wl=200,Xl=201,ql=202,Yl=203,Zr=204,$r=205,Zl=206,$l=207,Jl=208,Kl=209,Ql=210,jl=211,eh=212,th=213,nh=214,bo=0,Eo=1,wo=2,xi=3,To=4,Ao=5,Ro=6,Co=7,xc=0,ih=1,sh=2,wn=0,rh=1,oh=2,ah=3,ch=4,lh=5,hh=6,uh=7,ic="attached",dh="detached",yc=300,Ei=301,wi=302,Io=303,Po=304,or=306,Jr=1e3,ni=1001,Kr=1002,Qt=1003,fh=1004;var ar=1005;var Sn=1006,Do=1007;var ai=1008;var Fn=1009,vc=1010,Mc=1011,cs=1012,Lo=1013,ci=1014,Tn=1015,ls=1016,Uo=1017,Fo=1018,hs=1020,Sc=35902,bc=35899,Ec=1021,wc=1022,cn=1023,Ki=1026,us=1027,Tc=1028,No=1029,Ac=1030,Oo=1031;var Bo=1033,cr=33776,lr=33777,hr=33778,ur=33779,zo=35840,ko=35841,Ho=35842,Vo=35843,Go=36196,Wo=37492,Xo=37496,qo=37808,Yo=37809,Zo=37810,$o=37811,Jo=37812,Ko=37813,Qo=37814,jo=37815,ea=37816,ta=37817,na=37818,ia=37819,sa=37820,ra=37821,oa=36492,aa=36494,ca=36495,la=36283,ha=36284,ua=36285,da=36286;var Fs=2300,Qr=2301,qr=2302,sc=2400,rc=2401,oc=2402;var ph=3200,mh=3201;var Rc=0,gh=1,Yn="",Ut="srgb",yi="srgb-linear",Ns="linear",ht="srgb";var gi=7680;var ac=519,_h=512,xh=513,yh=514,Cc=515,vh=516,Mh=517,Sh=518,bh=519,cc=35044,fn=35048;var Ic="300 es",vn=2e3,Os=2001;var Gn=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,o=s.length;r<o;r++)s[r].call(this,e);e.target=null}}},Ht=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],al=1234567,Ps=Math.PI/180,Qi=180/Math.PI;function li(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Ht[i&255]+Ht[i>>8&255]+Ht[i>>16&255]+Ht[i>>24&255]+"-"+Ht[e&255]+Ht[e>>8&255]+"-"+Ht[e>>16&15|64]+Ht[e>>24&255]+"-"+Ht[t&63|128]+Ht[t>>8&255]+"-"+Ht[t>>16&255]+Ht[t>>24&255]+Ht[n&255]+Ht[n>>8&255]+Ht[n>>16&255]+Ht[n>>24&255]).toLowerCase()}function je(i,e,t){return Math.max(e,Math.min(t,i))}function Pc(i,e){return(i%e+e)%e}function Bu(i,e,t,n,s){return n+(i-e)*(s-n)/(t-e)}function zu(i,e,t){return i!==e?(t-i)/(e-i):0}function Ds(i,e,t){return(1-t)*i+t*e}function ku(i,e,t,n){return Ds(i,e,1-Math.exp(-t*n))}function Hu(i,e=1){return e-Math.abs(Pc(i,e*2)-e)}function Vu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*(3-2*i))}function Gu(i,e,t){return i<=e?0:i>=t?1:(i=(i-e)/(t-e),i*i*i*(i*(i*6-15)+10))}function Wu(i,e){return i+Math.floor(Math.random()*(e-i+1))}function Xu(i,e){return i+Math.random()*(e-i)}function qu(i){return i*(.5-Math.random())}function Yu(i){i!==void 0&&(al=i);let e=al+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Zu(i){return i*Ps}function $u(i){return i*Qi}function Ju(i){return(i&i-1)===0&&i!==0}function Ku(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function Qu(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function ju(i,e,t,n,s){let r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),f=o((e-n)/2),p=r((n-e)/2),g=o((n-e)/2);switch(s){case"XYX":i.set(a*h,l*u,l*f,a*c);break;case"YZY":i.set(l*f,a*h,l*u,a*c);break;case"ZXZ":i.set(l*u,l*f,a*h,a*c);break;case"XZX":i.set(a*h,l*g,l*p,a*c);break;case"YXY":i.set(l*p,a*h,l*g,a*c);break;case"ZYZ":i.set(l*g,l*p,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function $i(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function qt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var mt={DEG2RAD:Ps,RAD2DEG:Qi,generateUUID:li,clamp:je,euclideanModulo:Pc,mapLinear:Bu,inverseLerp:zu,lerp:Ds,damp:ku,pingpong:Hu,smoothstep:Vu,smootherstep:Gu,randInt:Wu,randFloat:Xu,randFloatSpread:qu,seededRandom:Yu,degToRad:Zu,radToDeg:$u,isPowerOfTwo:Ju,ceilPowerOfTwo:Ku,floorPowerOfTwo:Qu,setQuaternionFromProperEuler:ju,normalize:qt,denormalize:$i},Ue=class i{constructor(e=0,t=0){i.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*s+e.x,this.y=r*s+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},et=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,o,a){let l=n[s+0],c=n[s+1],h=n[s+2],u=n[s+3],f=r[o+0],p=r[o+1],g=r[o+2],_=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=f,e[t+1]=p,e[t+2]=g,e[t+3]=_;return}if(u!==_||l!==f||c!==p||h!==g){let m=1-a,d=l*f+c*p+h*g+u*_,M=d>=0?1:-1,v=1-d*d;if(v>Number.EPSILON){let P=Math.sqrt(v),A=Math.atan2(P,d*M);m=Math.sin(m*A)/P,a=Math.sin(a*A)/P}let x=a*M;if(l=l*m+f*x,c=c*m+p*x,h=h*m+g*x,u=u*m+_*x,m===1-a){let P=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=P,c*=P,h*=P,u*=P}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,s,r,o){let a=n[s],l=n[s+1],c=n[s+2],h=n[s+3],u=r[o],f=r[o+1],p=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*p-c*f,e[t+1]=l*g+h*f+c*u-a*p,e[t+2]=c*g+h*p+a*f-l*u,e[t+3]=h*g-a*u-l*f-c*p,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(s/2),u=a(r/2),f=l(n/2),p=l(s/2),g=l(r/2);switch(o){case"XYZ":this._x=f*h*u+c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u-f*p*g;break;case"YXZ":this._x=f*h*u+c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u+f*p*g;break;case"ZXY":this._x=f*h*u-c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u-f*p*g;break;case"ZYX":this._x=f*h*u-c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u+f*p*g;break;case"YZX":this._x=f*h*u+c*p*g,this._y=c*p*u+f*h*g,this._z=c*h*g-f*p*u,this._w=c*h*u-f*p*g;break;case"XZY":this._x=f*h*u-c*p*g,this._y=c*p*u-f*h*g,this._z=c*h*g+f*p*u,this._w=c*h*u+f*p*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],f=n+a+u;if(f>0){let p=.5/Math.sqrt(f+1);this._w=.25/p,this._x=(h-l)*p,this._y=(r-c)*p,this._z=(o-s)*p}else if(n>a&&n>u){let p=2*Math.sqrt(1+n-a-u);this._w=(h-l)/p,this._x=.25*p,this._y=(s+o)/p,this._z=(r+c)/p}else if(a>u){let p=2*Math.sqrt(1+a-n-u);this._w=(r-c)/p,this._x=(s+o)/p,this._y=.25*p,this._z=(l+h)/p}else{let p=2*Math.sqrt(1+u-n-a);this._w=(o-s)/p,this._x=(r+c)/p,this._y=(l+h)/p,this._z=.25*p}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(je(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+s*c-r*l,this._y=s*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-s*a,this._w=o*h-n*a-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);let n=this._x,s=this._y,r=this._z,o=this._w,a=o*e._w+n*e._x+s*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=s,this._z=r,this;let l=1-a*a;if(l<=Number.EPSILON){let p=1-t;return this._w=p*o+t*this._w,this._x=p*n+t*this._x,this._y=p*s+t*this._y,this._z=p*r+t*this._z,this.normalize(),this}let c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,f=Math.sin(t*h)/c;return this._w=o*u+this._w*f,this._x=n*u+this._x*f,this._y=s*u+this._y*f,this._z=r*u+this._z*f,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},I=class i{constructor(e=0,t=0,n=0){i.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(cl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(cl.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*o,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*s-a*n),h=2*(a*t-r*s),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=s+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=s*l-r*a,this.y=r*o-n*l,this.z=n*a-s*o,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Pa.copy(this).projectOnVector(e),this.sub(Pa)}reflect(e){return this.sub(Pa.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(je(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Pa=new I,cl=new et,$e=class i{constructor(e,t,n,s,r,o,a,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c)}set(e,t,n,s,r,o,a,l,c){let h=this.elements;return h[0]=e,h[1]=s,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],f=n[2],p=n[5],g=n[8],_=s[0],m=s[3],d=s[6],M=s[1],v=s[4],x=s[7],P=s[2],A=s[5],C=s[8];return r[0]=o*_+a*M+l*P,r[3]=o*m+a*v+l*A,r[6]=o*d+a*x+l*C,r[1]=c*_+h*M+u*P,r[4]=c*m+h*v+u*A,r[7]=c*d+h*x+u*C,r[2]=f*_+p*M+g*P,r[5]=f*m+p*v+g*A,r[8]=f*d+p*x+g*C,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+s*r*c-s*o*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,f=a*l-h*r,p=c*r-o*l,g=t*u+n*f+s*p;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);let _=1/g;return e[0]=u*_,e[1]=(s*c-h*n)*_,e[2]=(a*n-s*o)*_,e[3]=f*_,e[4]=(h*t-s*l)*_,e[5]=(s*r-a*t)*_,e[6]=p*_,e[7]=(n*l-c*t)*_,e[8]=(o*t-n*r)*_,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,o,a){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-s*c,s*l,-s*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Da.makeScale(e,t)),this}rotate(e){return this.premultiply(Da.makeRotation(-e)),this}translate(e,t){return this.premultiply(Da.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}},Da=new $e;function Dc(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function ji(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Eh(){let i=ji("canvas");return i.style.display="block",i}var ll={};function es(i){i in ll||(ll[i]=!0,console.warn(i))}function wh(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var hl=new $e().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),ul=new $e().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ed(){let i={enabled:!0,workingColorSpace:yi,spaces:{},convert:function(s,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===ht&&(s.r=Vn(s.r),s.g=Vn(s.g),s.b=Vn(s.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===ht&&(s.r=Ji(s.r),s.g=Ji(s.g),s.b=Ji(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Yn?Ns:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,o){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return es("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return es("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[yi]:{primaries:e,whitePoint:n,transfer:Ns,toXYZ:hl,fromXYZ:ul,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Ut},outputColorSpaceConfig:{drawingBufferColorSpace:Ut}},[Ut]:{primaries:e,whitePoint:n,transfer:ht,toXYZ:hl,fromXYZ:ul,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Ut}}}),i}var rt=ed();function Vn(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Ji(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ni,jr=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ni===void 0&&(Ni=ji("canvas")),Ni.width=e.width,Ni.height=e.height;let s=Ni.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Ni}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=ji("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let o=0;o<r.length;o++)r[o]=Vn(r[o]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Vn(t[n]/255)*255):t[n]=Vn(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},td=0,ts=class{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:td++}),this.uuid=li(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let o=0,a=s.length;o<a;o++)s[o].isDataTexture?r.push(La(s[o].image)):r.push(La(s[o]))}else r=La(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function La(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?jr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var nd=0,Ua=new I,Yt=class i extends Gn{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=ni,s=ni,r=Sn,o=ai,a=cn,l=Fn,c=i.DEFAULT_ANISOTROPY,h=Yn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:nd++}),this.uuid=li(),this.name="",this.source=new ts(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Ue(0,0),this.repeat=new Ue(1,1),this.center=new Ue(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new $e,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(Ua).x}get height(){return this.source.getSize(Ua).y}get depth(){return this.source.getSize(Ua).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==yc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Jr:e.x=e.x-Math.floor(e.x);break;case ni:e.x=e.x<0?0:1;break;case Kr:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Jr:e.y=e.y-Math.floor(e.y);break;case ni:e.y=e.y<0?0:1;break;case Kr:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Yt.DEFAULT_IMAGE=null;Yt.DEFAULT_MAPPING=yc;Yt.DEFAULT_ANISOTROPY=1;var yt=class i{constructor(e=0,t=0,n=0,s=1){i.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*s+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*s+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*s+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*s+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],h=l[4],u=l[8],f=l[1],p=l[5],g=l[9],_=l[2],m=l[6],d=l[10];if(Math.abs(h-f)<.01&&Math.abs(u-_)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+f)<.1&&Math.abs(u+_)<.1&&Math.abs(g+m)<.1&&Math.abs(c+p+d-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let v=(c+1)/2,x=(p+1)/2,P=(d+1)/2,A=(h+f)/4,C=(u+_)/4,O=(g+m)/4;return v>x&&v>P?v<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(v),s=A/n,r=C/n):x>P?x<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(x),n=A/s,r=O/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=C/r,s=O/r),this.set(n,s,r,t),this}let M=Math.sqrt((m-g)*(m-g)+(u-_)*(u-_)+(f-h)*(f-h));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(u-_)/M,this.z=(f-h)/M,this.w=Math.acos((c+p+d-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=je(this.x,e.x,t.x),this.y=je(this.y,e.y,t.y),this.z=je(this.z,e.z,t.z),this.w=je(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=je(this.x,e,t),this.y=je(this.y,e,t),this.z=je(this.z,e,t),this.w=je(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(je(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},eo=class extends Gn{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Sn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new yt(0,0,e,t),this.scissorTest=!1,this.viewport=new yt(0,0,e,t);let s={width:e,height:t,depth:n.depth},r=new Yt(s);this.textures=[];let o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){let t={minFilter:Sn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new ts(s)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},In=class extends eo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Bs=class extends Yt{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Qt,this.minFilter=Qt,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var to=class extends Yt{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Qt,this.minFilter=Qt,this.wrapR=ni,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var bn=class{constructor(e=new I(1/0,1/0,1/0),t=new I(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(_n.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(_n.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=_n.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,_n):_n.fromBufferAttribute(r,o),_n.applyMatrix4(e.matrixWorld),this.expandByPoint(_n);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Er.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Er.copy(n.boundingBox)),Er.applyMatrix4(e.matrixWorld),this.union(Er)}let s=e.children;for(let r=0,o=s.length;r<o;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,_n),_n.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Ts),wr.subVectors(this.max,Ts),Oi.subVectors(e.a,Ts),Bi.subVectors(e.b,Ts),zi.subVectors(e.c,Ts),$n.subVectors(Bi,Oi),Jn.subVectors(zi,Bi),di.subVectors(Oi,zi);let t=[0,-$n.z,$n.y,0,-Jn.z,Jn.y,0,-di.z,di.y,$n.z,0,-$n.x,Jn.z,0,-Jn.x,di.z,0,-di.x,-$n.y,$n.x,0,-Jn.y,Jn.x,0,-di.y,di.x,0];return!Fa(t,Oi,Bi,zi,wr)||(t=[1,0,0,0,1,0,0,0,1],!Fa(t,Oi,Bi,zi,wr))?!1:(Tr.crossVectors($n,Jn),t=[Tr.x,Tr.y,Tr.z],Fa(t,Oi,Bi,zi,wr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,_n).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(_n).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(On[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),On[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),On[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),On[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),On[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),On[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),On[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),On[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(On),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},On=[new I,new I,new I,new I,new I,new I,new I,new I],_n=new I,Er=new bn,Oi=new I,Bi=new I,zi=new I,$n=new I,Jn=new I,di=new I,Ts=new I,wr=new I,Tr=new I,fi=new I;function Fa(i,e,t,n,s){for(let r=0,o=i.length-3;r<=o;r+=3){fi.fromArray(i,r);let a=s.x*Math.abs(fi.x)+s.y*Math.abs(fi.y)+s.z*Math.abs(fi.z),l=e.dot(fi),c=t.dot(fi),h=n.dot(fi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}var id=new bn,As=new I,Na=new I,dn=class{constructor(e=new I,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):id.setFromPoints(e).getCenter(n);let s=0;for(let r=0,o=e.length;r<o;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;As.subVectors(e,this.center);let t=As.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(As,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Na.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(As.copy(e.center).add(Na)),this.expandByPoint(As.copy(e.center).sub(Na))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Bn=new I,Oa=new I,Ar=new I,Kn=new I,Ba=new I,Rr=new I,za=new I,zs=class{constructor(e=new I,t=new I(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Bn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Bn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Bn.copy(this.origin).addScaledVector(this.direction,t),Bn.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Oa.copy(e).add(t).multiplyScalar(.5),Ar.copy(t).sub(e).normalize(),Kn.copy(this.origin).sub(Oa);let r=e.distanceTo(t)*.5,o=-this.direction.dot(Ar),a=Kn.dot(this.direction),l=-Kn.dot(Ar),c=Kn.lengthSq(),h=Math.abs(1-o*o),u,f,p,g;if(h>0)if(u=o*l-a,f=o*a-l,g=r*h,u>=0)if(f>=-g)if(f<=g){let _=1/h;u*=_,f*=_,p=u*(u+o*f+2*a)+f*(o*u+f+2*l)+c}else f=r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;else f=-r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;else f<=-g?(u=Math.max(0,-(-o*r+a)),f=u>0?-r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c):f<=g?(u=0,f=Math.min(Math.max(-r,-l),r),p=f*(f+2*l)+c):(u=Math.max(0,-(o*r+a)),f=u>0?r:Math.min(Math.max(-r,-l),r),p=-u*u+f*(f+2*l)+c);else f=o>0?-r:r,u=Math.max(0,-(o*f+a)),p=-u*u+f*(f+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),s&&s.copy(Oa).addScaledVector(Ar,f),p}intersectSphere(e,t){Bn.subVectors(e.center,this.origin);let n=Bn.dot(this.direction),s=Bn.dot(Bn)-n*n,r=e.radius*e.radius;if(s>r)return null;let o=Math.sqrt(r-s),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,o,a,l,c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,f=this.origin;return c>=0?(n=(e.min.x-f.x)*c,s=(e.max.x-f.x)*c):(n=(e.max.x-f.x)*c,s=(e.min.x-f.x)*c),h>=0?(r=(e.min.y-f.y)*h,o=(e.max.y-f.y)*h):(r=(e.max.y-f.y)*h,o=(e.min.y-f.y)*h),n>o||r>s||((r>n||isNaN(n))&&(n=r),(o<s||isNaN(s))&&(s=o),u>=0?(a=(e.min.z-f.z)*u,l=(e.max.z-f.z)*u):(a=(e.max.z-f.z)*u,l=(e.min.z-f.z)*u),n>l||a>s)||((a>n||n!==n)&&(n=a),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Bn)!==null}intersectTriangle(e,t,n,s,r){Ba.subVectors(t,e),Rr.subVectors(n,e),za.crossVectors(Ba,Rr);let o=this.direction.dot(za),a;if(o>0){if(s)return null;a=1}else if(o<0)a=-1,o=-o;else return null;Kn.subVectors(this.origin,e);let l=a*this.direction.dot(Rr.crossVectors(Kn,Rr));if(l<0)return null;let c=a*this.direction.dot(Ba.cross(Kn));if(c<0||l+c>o)return null;let h=-a*Kn.dot(za);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},ot=class i{constructor(e,t,n,s,r,o,a,l,c,h,u,f,p,g,_,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,o,a,l,c,h,u,f,p,g,_,m)}set(e,t,n,s,r,o,a,l,c,h,u,f,p,g,_,m){let d=this.elements;return d[0]=e,d[4]=t,d[8]=n,d[12]=s,d[1]=r,d[5]=o,d[9]=a,d[13]=l,d[2]=c,d[6]=h,d[10]=u,d[14]=f,d[3]=p,d[7]=g,d[11]=_,d[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){let t=this.elements,n=e.elements,s=1/ki.setFromMatrixColumn(e,0).length(),r=1/ki.setFromMatrixColumn(e,1).length(),o=1/ki.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(s),c=Math.sin(s),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){let f=o*h,p=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=p+g*c,t[5]=f-_*c,t[9]=-a*l,t[2]=_-f*c,t[6]=g+p*c,t[10]=o*l}else if(e.order==="YXZ"){let f=l*h,p=l*u,g=c*h,_=c*u;t[0]=f+_*a,t[4]=g*a-p,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=p*a-g,t[6]=_+f*a,t[10]=o*l}else if(e.order==="ZXY"){let f=l*h,p=l*u,g=c*h,_=c*u;t[0]=f-_*a,t[4]=-o*u,t[8]=g+p*a,t[1]=p+g*a,t[5]=o*h,t[9]=_-f*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){let f=o*h,p=o*u,g=a*h,_=a*u;t[0]=l*h,t[4]=g*c-p,t[8]=f*c+_,t[1]=l*u,t[5]=_*c+f,t[9]=p*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){let f=o*l,p=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=_-f*u,t[8]=g*u+p,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=p*u+g,t[10]=f-_*u}else if(e.order==="XZY"){let f=o*l,p=o*c,g=a*l,_=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=f*u+_,t[5]=o*h,t[9]=p*u-g,t[2]=g*u-p,t[6]=a*h,t[10]=_*u+f}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(sd,e,rd)}lookAt(e,t,n){let s=this.elements;return tn.subVectors(e,t),tn.lengthSq()===0&&(tn.z=1),tn.normalize(),Qn.crossVectors(n,tn),Qn.lengthSq()===0&&(Math.abs(n.z)===1?tn.x+=1e-4:tn.z+=1e-4,tn.normalize(),Qn.crossVectors(n,tn)),Qn.normalize(),Cr.crossVectors(tn,Qn),s[0]=Qn.x,s[4]=Cr.x,s[8]=tn.x,s[1]=Qn.y,s[5]=Cr.y,s[9]=tn.y,s[2]=Qn.z,s[6]=Cr.z,s[10]=tn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],f=n[9],p=n[13],g=n[2],_=n[6],m=n[10],d=n[14],M=n[3],v=n[7],x=n[11],P=n[15],A=s[0],C=s[4],O=s[8],w=s[12],S=s[1],U=s[5],W=s[9],J=s[13],H=s[2],z=s[6],q=s[10],ae=s[14],Z=s[3],ee=s[7],re=s[11],ue=s[15];return r[0]=o*A+a*S+l*H+c*Z,r[4]=o*C+a*U+l*z+c*ee,r[8]=o*O+a*W+l*q+c*re,r[12]=o*w+a*J+l*ae+c*ue,r[1]=h*A+u*S+f*H+p*Z,r[5]=h*C+u*U+f*z+p*ee,r[9]=h*O+u*W+f*q+p*re,r[13]=h*w+u*J+f*ae+p*ue,r[2]=g*A+_*S+m*H+d*Z,r[6]=g*C+_*U+m*z+d*ee,r[10]=g*O+_*W+m*q+d*re,r[14]=g*w+_*J+m*ae+d*ue,r[3]=M*A+v*S+x*H+P*Z,r[7]=M*C+v*U+x*z+P*ee,r[11]=M*O+v*W+x*q+P*re,r[15]=M*w+v*J+x*ae+P*ue,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],f=e[10],p=e[14],g=e[3],_=e[7],m=e[11],d=e[15];return g*(+r*l*u-s*c*u-r*a*f+n*c*f+s*a*p-n*l*p)+_*(+t*l*p-t*c*f+r*o*f-s*o*p+s*c*h-r*l*h)+m*(+t*c*u-t*a*p-r*o*u+n*o*p+r*a*h-n*c*h)+d*(-s*a*h-t*l*u+t*a*f+s*o*u-n*o*f+n*l*h)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],f=e[10],p=e[11],g=e[12],_=e[13],m=e[14],d=e[15],M=u*m*c-_*f*c+_*l*p-a*m*p-u*l*d+a*f*d,v=g*f*c-h*m*c-g*l*p+o*m*p+h*l*d-o*f*d,x=h*_*c-g*u*c+g*a*p-o*_*p-h*a*d+o*u*d,P=g*u*l-h*_*l-g*a*f+o*_*f+h*a*m-o*u*m,A=t*M+n*v+s*x+r*P;if(A===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/A;return e[0]=M*C,e[1]=(_*f*r-u*m*r-_*s*p+n*m*p+u*s*d-n*f*d)*C,e[2]=(a*m*r-_*l*r+_*s*c-n*m*c-a*s*d+n*l*d)*C,e[3]=(u*l*r-a*f*r-u*s*c+n*f*c+a*s*p-n*l*p)*C,e[4]=v*C,e[5]=(h*m*r-g*f*r+g*s*p-t*m*p-h*s*d+t*f*d)*C,e[6]=(g*l*r-o*m*r-g*s*c+t*m*c+o*s*d-t*l*d)*C,e[7]=(o*f*r-h*l*r+h*s*c-t*f*c-o*s*p+t*l*p)*C,e[8]=x*C,e[9]=(g*u*r-h*_*r-g*n*p+t*_*p+h*n*d-t*u*d)*C,e[10]=(o*_*r-g*a*r+g*n*c-t*_*c-o*n*d+t*a*d)*C,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*p-t*a*p)*C,e[12]=P*C,e[13]=(h*_*s-g*u*s+g*n*f-t*_*f-h*n*m+t*u*m)*C,e[14]=(g*a*s-o*_*s-g*n*l+t*_*l+o*n*m-t*a*m)*C,e[15]=(o*u*s-h*a*s+h*n*l-t*u*l-o*n*f+t*a*f)*C,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-s*l,c*l+s*a,0,c*a+s*l,h*a+n,h*l-s*o,0,c*l-s*a,h*l+s*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,o){return this.set(1,n,r,0,e,1,o,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,f=r*c,p=r*h,g=r*u,_=o*h,m=o*u,d=a*u,M=l*c,v=l*h,x=l*u,P=n.x,A=n.y,C=n.z;return s[0]=(1-(_+d))*P,s[1]=(p+x)*P,s[2]=(g-v)*P,s[3]=0,s[4]=(p-x)*A,s[5]=(1-(f+d))*A,s[6]=(m+M)*A,s[7]=0,s[8]=(g+v)*C,s[9]=(m-M)*C,s[10]=(1-(f+_))*C,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements,r=ki.set(s[0],s[1],s[2]).length(),o=ki.set(s[4],s[5],s[6]).length(),a=ki.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),e.x=s[12],e.y=s[13],e.z=s[14],xn.copy(this);let c=1/r,h=1/o,u=1/a;return xn.elements[0]*=c,xn.elements[1]*=c,xn.elements[2]*=c,xn.elements[4]*=h,xn.elements[5]*=h,xn.elements[6]*=h,xn.elements[8]*=u,xn.elements[9]*=u,xn.elements[10]*=u,t.setFromRotationMatrix(xn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,s,r,o,a=vn,l=!1){let c=this.elements,h=2*r/(t-e),u=2*r/(n-s),f=(t+e)/(t-e),p=(n+s)/(n-s),g,_;if(l)g=r/(o-r),_=o*r/(o-r);else if(a===vn)g=-(o+r)/(o-r),_=-2*o*r/(o-r);else if(a===Os)g=-o/(o-r),_=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=f,c[12]=0,c[1]=0,c[5]=u,c[9]=p,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,o,a=vn,l=!1){let c=this.elements,h=2/(t-e),u=2/(n-s),f=-(t+e)/(t-e),p=-(n+s)/(n-s),g,_;if(l)g=1/(o-r),_=o/(o-r);else if(a===vn)g=-2/(o-r),_=-(o+r)/(o-r);else if(a===Os)g=-1/(o-r),_=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=f,c[1]=0,c[5]=u,c[9]=0,c[13]=p,c[2]=0,c[6]=0,c[10]=g,c[14]=_,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}},ki=new I,xn=new ot,sd=new I(0,0,0),rd=new I(1,1,1),Qn=new I,Cr=new I,tn=new I,dl=new ot,fl=new et,zt=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],o=s[4],a=s[8],l=s[1],c=s[5],h=s[9],u=s[2],f=s[6],p=s[10];switch(t){case"XYZ":this._y=Math.asin(je(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,p),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(f,c),this._z=0);break;case"YXZ":this._x=Math.asin(-je(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,p),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(je(f,-1,1)),Math.abs(f)<.9999999?(this._y=Math.atan2(-u,p),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-je(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(f,p),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(je(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,p));break;case"XZY":this._z=Math.asin(-je(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(f,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,p),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return dl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(dl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return fl.setFromEuler(this),this.setFromQuaternion(fl,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};zt.DEFAULT_ORDER="XYZ";var ks=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},od=0,pl=new I,Hi=new et,zn=new ot,Ir=new I,Rs=new I,ad=new I,cd=new et,ml=new I(1,0,0),gl=new I(0,1,0),_l=new I(0,0,1),xl={type:"added"},ld={type:"removed"},Vi={type:"childadded",child:null},ka={type:"childremoved",child:null},rn=class i extends Gn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:od++}),this.uuid=li(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new I,t=new zt,n=new et,s=new I(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ot},normalMatrix:{value:new $e}}),this.matrix=new ot,this.matrixWorld=new ot,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ks,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Hi.setFromAxisAngle(e,t),this.quaternion.multiply(Hi),this}rotateOnWorldAxis(e,t){return Hi.setFromAxisAngle(e,t),this.quaternion.premultiply(Hi),this}rotateX(e){return this.rotateOnAxis(ml,e)}rotateY(e){return this.rotateOnAxis(gl,e)}rotateZ(e){return this.rotateOnAxis(_l,e)}translateOnAxis(e,t){return pl.copy(e).applyQuaternion(this.quaternion),this.position.add(pl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(ml,e)}translateY(e){return this.translateOnAxis(gl,e)}translateZ(e){return this.translateOnAxis(_l,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(zn.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Ir.copy(e):Ir.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Rs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?zn.lookAt(Rs,Ir,this.up):zn.lookAt(Ir,Rs,this.up),this.quaternion.setFromRotationMatrix(zn),s&&(zn.extractRotation(s.matrixWorld),Hi.setFromRotationMatrix(zn),this.quaternion.premultiply(Hi.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(xl),Vi.child=e,this.dispatchEvent(Vi),Vi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(ld),ka.child=e,this.dispatchEvent(ka),ka.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),zn.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),zn.multiply(e.parent.matrixWorld)),e.applyMatrix4(zn),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(xl),Vi.child=e,this.dispatchEvent(Vi),Vi.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rs,e,ad),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rs,cd,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){let n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){let s=this.children;for(let r=0,o=s.length;r<o;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(a=>({...a})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){let l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){let u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));s.material=a}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let a=0;a<this.children.length;a++)s.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let a=0;a<this.animations.length;a++){let l=this.animations[a];s.animations.push(r(e.animations,l))}}if(t){let a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),f=o(e.skeletons),p=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),f.length>0&&(n.skeletons=f),p.length>0&&(n.animations=p),g.length>0&&(n.nodes=g)}return n.object=s,n;function o(a){let l=[];for(let c in a){let h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}};rn.DEFAULT_UP=new I(0,1,0);rn.DEFAULT_MATRIX_AUTO_UPDATE=!0;rn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var yn=new I,kn=new I,Ha=new I,Hn=new I,Gi=new I,Wi=new I,yl=new I,Va=new I,Ga=new I,Wa=new I,Xa=new yt,qa=new yt,Ya=new yt,ti=class i{constructor(e=new I,t=new I,n=new I){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),yn.subVectors(e,t),s.cross(yn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){yn.subVectors(s,t),kn.subVectors(n,t),Ha.subVectors(e,t);let o=yn.dot(yn),a=yn.dot(kn),l=yn.dot(Ha),c=kn.dot(kn),h=kn.dot(Ha),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;let f=1/u,p=(c*l-a*h)*f,g=(o*h-a*l)*f;return r.set(1-p-g,g,p)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Hn)===null?!1:Hn.x>=0&&Hn.y>=0&&Hn.x+Hn.y<=1}static getInterpolation(e,t,n,s,r,o,a,l){return this.getBarycoord(e,t,n,s,Hn)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Hn.x),l.addScaledVector(o,Hn.y),l.addScaledVector(a,Hn.z),l)}static getInterpolatedAttribute(e,t,n,s,r,o){return Xa.setScalar(0),qa.setScalar(0),Ya.setScalar(0),Xa.fromBufferAttribute(e,t),qa.fromBufferAttribute(e,n),Ya.fromBufferAttribute(e,s),o.setScalar(0),o.addScaledVector(Xa,r.x),o.addScaledVector(qa,r.y),o.addScaledVector(Ya,r.z),o}static isFrontFacing(e,t,n,s){return yn.subVectors(n,t),kn.subVectors(e,t),yn.cross(kn).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return yn.subVectors(this.c,this.b),kn.subVectors(this.a,this.b),yn.cross(kn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,o,a;Gi.subVectors(s,n),Wi.subVectors(r,n),Va.subVectors(e,n);let l=Gi.dot(Va),c=Wi.dot(Va);if(l<=0&&c<=0)return t.copy(n);Ga.subVectors(e,s);let h=Gi.dot(Ga),u=Wi.dot(Ga);if(h>=0&&u<=h)return t.copy(s);let f=l*u-h*c;if(f<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(Gi,o);Wa.subVectors(e,r);let p=Gi.dot(Wa),g=Wi.dot(Wa);if(g>=0&&p<=g)return t.copy(r);let _=p*c-l*g;if(_<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(Wi,a);let m=h*g-p*u;if(m<=0&&u-h>=0&&p-g>=0)return yl.subVectors(r,s),a=(u-h)/(u-h+(p-g)),t.copy(s).addScaledVector(yl,a);let d=1/(m+_+f);return o=_*d,a=f*d,t.copy(n).addScaledVector(Gi,o).addScaledVector(Wi,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},Th={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},jn={h:0,s:0,l:0},Pr={h:0,s:0,l:0};function Za(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var qe=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Ut){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,rt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=rt.workingColorSpace){return this.r=e,this.g=t,this.b=n,rt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=rt.workingColorSpace){if(e=Pc(e,1),t=je(t,0,1),n=je(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=Za(o,r,e+1/3),this.g=Za(o,r,e),this.b=Za(o,r,e-1/3)}return rt.colorSpaceToWorking(this,s),this}setStyle(e,t=Ut){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,o=s[1],a=s[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Ut){let n=Th[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Vn(e.r),this.g=Vn(e.g),this.b=Vn(e.b),this}copyLinearToSRGB(e){return this.r=Ji(e.r),this.g=Ji(e.g),this.b=Ji(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Ut){return rt.workingToColorSpace(Vt.copy(this),e),Math.round(je(Vt.r*255,0,255))*65536+Math.round(je(Vt.g*255,0,255))*256+Math.round(je(Vt.b*255,0,255))}getHexString(e=Ut){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=rt.workingColorSpace){rt.workingToColorSpace(Vt.copy(this),t);let n=Vt.r,s=Vt.g,r=Vt.b,o=Math.max(n,s,r),a=Math.min(n,s,r),l,c,h=(a+o)/2;if(a===o)l=0,c=0;else{let u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(s-r)/u+(s<r?6:0);break;case s:l=(r-n)/u+2;break;case r:l=(n-s)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=rt.workingColorSpace){return rt.workingToColorSpace(Vt.copy(this),t),e.r=Vt.r,e.g=Vt.g,e.b=Vt.b,e}getStyle(e=Ut){rt.workingToColorSpace(Vt.copy(this),e);let t=Vt.r,n=Vt.g,s=Vt.b;return e!==Ut?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(jn),this.setHSL(jn.h+e,jn.s+t,jn.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(jn),e.getHSL(Pr);let n=Ds(jn.h,Pr.h,t),s=Ds(jn.s,Pr.s,t),r=Ds(jn.l,Pr.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Vt=new qe;qe.NAMES=Th;var hd=0,si=class extends Gn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:hd++}),this.uuid=li(),this.name="",this.type="Material",this.blending=_i,this.side=Kt,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Zr,this.blendDst=$r,this.blendEquation=ii,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new qe(0,0,0),this.blendAlpha=0,this.depthFunc=xi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=ac,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=gi,this.stencilZFail=gi,this.stencilZPass=gi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==_i&&(n.blending=this.blending),this.side!==Kt&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Zr&&(n.blendSrc=this.blendSrc),this.blendDst!==$r&&(n.blendDst=this.blendDst),this.blendEquation!==ii&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==xi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==ac&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==gi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==gi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==gi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let o=[];for(let a in r){let l=r[a];delete l.metadata,o.push(l)}return o}if(t){let r=s(e.textures),o=s(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Gt=class extends si{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new qe(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new zt,this.combine=xc,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var Ct=new I,Dr=new Ue,ud=0,sn=class{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ud++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=cc,this.updateRanges=[],this.gpuType=Tn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Dr.fromBufferAttribute(this,t),Dr.applyMatrix3(e),this.setXY(t,Dr.x,Dr.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix3(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyMatrix4(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.applyNormalMatrix(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Ct.fromBufferAttribute(this,t),Ct.transformDirection(e),this.setXYZ(t,Ct.x,Ct.y,Ct.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=$i(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=qt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=$i(t,this.array)),t}setX(e,t){return this.normalized&&(t=qt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=$i(t,this.array)),t}setY(e,t){return this.normalized&&(t=qt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=$i(t,this.array)),t}setZ(e,t){return this.normalized&&(t=qt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=$i(t,this.array)),t}setW(e,t){return this.normalized&&(t=qt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=qt(t,this.array),n=qt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=qt(t,this.array),n=qt(n,this.array),s=qt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=qt(t,this.array),n=qt(n,this.array),s=qt(s,this.array),r=qt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==cc&&(e.usage=this.usage),e}};var Wn=class extends sn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Hs=class extends sn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var Je=class extends sn{constructor(e,t,n){super(new Float32Array(e),t,n)}},dd=0,un=new ot,$a=new rn,Xi=new I,nn=new bn,Cs=new bn,Ot=new I,It=class i extends Gn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:dd++}),this.uuid=li(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Dc(e)?Hs:Wn)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new $e().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return un.makeRotationFromQuaternion(e),this.applyMatrix4(un),this}rotateX(e){return un.makeRotationX(e),this.applyMatrix4(un),this}rotateY(e){return un.makeRotationY(e),this.applyMatrix4(un),this}rotateZ(e){return un.makeRotationZ(e),this.applyMatrix4(un),this}translate(e,t,n){return un.makeTranslation(e,t,n),this.applyMatrix4(un),this}scale(e,t,n){return un.makeScale(e,t,n),this.applyMatrix4(un),this}lookAt(e){return $a.lookAt(e),$a.updateMatrix(),this.applyMatrix4($a.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Xi).negate(),this.translate(Xi.x,Xi.y,Xi.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let o=e[s];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new Je(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new bn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new I(-1/0,-1/0,-1/0),new I(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];nn.setFromBufferAttribute(r),this.morphTargetsRelative?(Ot.addVectors(this.boundingBox.min,nn.min),this.boundingBox.expandByPoint(Ot),Ot.addVectors(this.boundingBox.max,nn.max),this.boundingBox.expandByPoint(Ot)):(this.boundingBox.expandByPoint(nn.min),this.boundingBox.expandByPoint(nn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new dn);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new I,1/0);return}if(e){let n=this.boundingSphere.center;if(nn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){let a=t[r];Cs.setFromBufferAttribute(a),this.morphTargetsRelative?(Ot.addVectors(nn.min,Cs.min),nn.expandByPoint(Ot),Ot.addVectors(nn.max,Cs.max),nn.expandByPoint(Ot)):(nn.expandByPoint(Cs.min),nn.expandByPoint(Cs.max))}nn.getCenter(n);let s=0;for(let r=0,o=e.count;r<o;r++)Ot.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(Ot));if(t)for(let r=0,o=t.length;r<o;r++){let a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)Ot.fromBufferAttribute(a,c),l&&(Xi.fromBufferAttribute(e,c),Ot.add(Xi)),s=Math.max(s,n.distanceToSquared(Ot))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new sn(new Float32Array(4*n.count),4));let o=this.getAttribute("tangent"),a=[],l=[];for(let O=0;O<n.count;O++)a[O]=new I,l[O]=new I;let c=new I,h=new I,u=new I,f=new Ue,p=new Ue,g=new Ue,_=new I,m=new I;function d(O,w,S){c.fromBufferAttribute(n,O),h.fromBufferAttribute(n,w),u.fromBufferAttribute(n,S),f.fromBufferAttribute(r,O),p.fromBufferAttribute(r,w),g.fromBufferAttribute(r,S),h.sub(c),u.sub(c),p.sub(f),g.sub(f);let U=1/(p.x*g.y-g.x*p.y);isFinite(U)&&(_.copy(h).multiplyScalar(g.y).addScaledVector(u,-p.y).multiplyScalar(U),m.copy(u).multiplyScalar(p.x).addScaledVector(h,-g.x).multiplyScalar(U),a[O].add(_),a[w].add(_),a[S].add(_),l[O].add(m),l[w].add(m),l[S].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let O=0,w=M.length;O<w;++O){let S=M[O],U=S.start,W=S.count;for(let J=U,H=U+W;J<H;J+=3)d(e.getX(J+0),e.getX(J+1),e.getX(J+2))}let v=new I,x=new I,P=new I,A=new I;function C(O){P.fromBufferAttribute(s,O),A.copy(P);let w=a[O];v.copy(w),v.sub(P.multiplyScalar(P.dot(w))).normalize(),x.crossVectors(A,w);let U=x.dot(l[O])<0?-1:1;o.setXYZW(O,v.x,v.y,v.z,U)}for(let O=0,w=M.length;O<w;++O){let S=M[O],U=S.start,W=S.count;for(let J=U,H=U+W;J<H;J+=3)C(e.getX(J+0)),C(e.getX(J+1)),C(e.getX(J+2))}}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new sn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let f=0,p=n.count;f<p;f++)n.setXYZ(f,0,0,0);let s=new I,r=new I,o=new I,a=new I,l=new I,c=new I,h=new I,u=new I;if(e)for(let f=0,p=e.count;f<p;f+=3){let g=e.getX(f+0),_=e.getX(f+1),m=e.getX(f+2);s.fromBufferAttribute(t,g),r.fromBufferAttribute(t,_),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,_),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(_,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let f=0,p=t.count;f<p;f+=3)s.fromBufferAttribute(t,f+0),r.fromBufferAttribute(t,f+1),o.fromBufferAttribute(t,f+2),h.subVectors(o,r),u.subVectors(s,r),h.cross(u),n.setXYZ(f+0,h.x,h.y,h.z),n.setXYZ(f+1,h.x,h.y,h.z),n.setXYZ(f+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)Ot.fromBufferAttribute(e,t),Ot.normalize(),e.setXYZ(t,Ot.x,Ot.y,Ot.z)}toNonIndexed(){function e(a,l){let c=a.array,h=a.itemSize,u=a.normalized,f=new c.constructor(l.length*h),p=0,g=0;for(let _=0,m=l.length;_<m;_++){a.isInterleavedBufferAttribute?p=l[_]*a.data.stride+a.offset:p=l[_]*h;for(let d=0;d<h;d++)f[g++]=c[p++]}return new sn(f,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let a in s){let l=s[a],c=e(l,n);t.setAttribute(a,c)}let r=this.morphAttributes;for(let a in r){let l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){let f=c[h],p=e(f,n);l.push(p)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;let o=this.groups;for(let a=0,l=o.length;a<l;a++){let c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],h=[];for(let u=0,f=c.length;u<f;u++){let p=c[u];h.push(p.toJSON(e.data))}h.length>0&&(s[l]=h,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));let a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let h=s[c];this.setAttribute(c,h.clone(t))}let r=e.morphAttributes;for(let c in r){let h=[],u=r[c];for(let f=0,p=u.length;f<p;f++)h.push(u[f].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;let o=e.groups;for(let c=0,h=o.length;c<h;c++){let u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}let a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},vl=new ot,pi=new zs,Lr=new dn,Ml=new I,Ur=new I,Fr=new I,Nr=new I,Ja=new I,Or=new I,Sl=new I,Br=new I,Et=class extends rn{constructor(e=new It,t=new Gt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=s.length;r<o;r++){let a=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let a=this.morphTargetInfluences;if(r&&a){Or.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let h=a[l],u=r[l];h!==0&&(Ja.fromBufferAttribute(u,e),o?Or.addScaledVector(Ja,h):Or.addScaledVector(Ja.sub(t),h))}t.add(Or)}return t}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Lr.copy(n.boundingSphere),Lr.applyMatrix4(r),pi.copy(e.ray).recast(e.near),!(Lr.containsPoint(pi.origin)===!1&&(pi.intersectSphere(Lr,Ml)===null||pi.origin.distanceToSquared(Ml)>(e.far-e.near)**2))&&(vl.copy(r).invert(),pi.copy(e.ray).applyMatrix4(vl),!(n.boundingBox!==null&&pi.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,pi)))}_computeIntersections(e,t,n){let s,r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,f=r.groups,p=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,_=f.length;g<_;g++){let m=f[g],d=o[m.materialIndex],M=Math.max(m.start,p.start),v=Math.min(a.count,Math.min(m.start+m.count,p.start+p.count));for(let x=M,P=v;x<P;x+=3){let A=a.getX(x),C=a.getX(x+1),O=a.getX(x+2);s=zr(this,d,e,n,c,h,u,A,C,O),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(a.count,p.start+p.count);for(let m=g,d=_;m<d;m+=3){let M=a.getX(m),v=a.getX(m+1),x=a.getX(m+2);s=zr(this,o,e,n,c,h,u,M,v,x),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,_=f.length;g<_;g++){let m=f[g],d=o[m.materialIndex],M=Math.max(m.start,p.start),v=Math.min(l.count,Math.min(m.start+m.count,p.start+p.count));for(let x=M,P=v;x<P;x+=3){let A=x,C=x+1,O=x+2;s=zr(this,d,e,n,c,h,u,A,C,O),s&&(s.faceIndex=Math.floor(x/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let g=Math.max(0,p.start),_=Math.min(l.count,p.start+p.count);for(let m=g,d=_;m<d;m+=3){let M=m,v=m+1,x=m+2;s=zr(this,o,e,n,c,h,u,M,v,x),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function fd(i,e,t,n,s,r,o,a){let l;if(e.side===Zt?l=n.intersectTriangle(o,r,s,!0,a):l=n.intersectTriangle(s,r,o,e.side===Kt,a),l===null)return null;Br.copy(a),Br.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(Br);return c<t.near||c>t.far?null:{distance:c,point:Br.clone(),object:i}}function zr(i,e,t,n,s,r,o,a,l,c){i.getVertexPosition(a,Ur),i.getVertexPosition(l,Fr),i.getVertexPosition(c,Nr);let h=fd(i,e,t,n,Ur,Fr,Nr,Sl);if(h){let u=new I;ti.getBarycoord(Sl,Ur,Fr,Nr,u),s&&(h.uv=ti.getInterpolatedAttribute(s,a,l,c,u,new Ue)),r&&(h.uv1=ti.getInterpolatedAttribute(r,a,l,c,u,new Ue)),o&&(h.normal=ti.getInterpolatedAttribute(o,a,l,c,u,new I),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));let f={a,b:l,c,normal:new I,materialIndex:0};ti.getNormal(Ur,Fr,Nr,f.normal),h.face=f,h.barycoord=u}return h}var ns=class i extends It{constructor(e=1,t=1,n=1,s=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:o};let a=this;s=Math.floor(s),r=Math.floor(r),o=Math.floor(o);let l=[],c=[],h=[],u=[],f=0,p=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,s,o,2),g("x","z","y",1,-1,e,n,-t,s,o,3),g("x","y","z",1,-1,e,t,n,s,r,4),g("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Je(c,3)),this.setAttribute("normal",new Je(h,3)),this.setAttribute("uv",new Je(u,2));function g(_,m,d,M,v,x,P,A,C,O,w){let S=x/C,U=P/O,W=x/2,J=P/2,H=A/2,z=C+1,q=O+1,ae=0,Z=0,ee=new I;for(let re=0;re<q;re++){let ue=re*U-J;for(let ge=0;ge<z;ge++){let ie=ge*S-W;ee[_]=ie*M,ee[m]=ue*v,ee[d]=H,c.push(ee.x,ee.y,ee.z),ee[_]=0,ee[m]=0,ee[d]=A>0?1:-1,h.push(ee.x,ee.y,ee.z),u.push(ge/C),u.push(1-re/O),ae+=1}}for(let re=0;re<O;re++)for(let ue=0;ue<C;ue++){let ge=f+ue+z*re,ie=f+ue+z*(re+1),Se=f+(ue+1)+z*(re+1),me=f+(ue+1)+z*re;l.push(ge,ie,me),l.push(ie,Se,me),Z+=6}a.addGroup(p,Z,w),p+=Z,f+=ae}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};function Ti(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone():Array.isArray(s)?e[t][n]=s.slice():e[t][n]=s}}return e}function Wt(i){let e={};for(let t=0;t<i.length;t++){let n=Ti(i[t]);for(let s in n)e[s]=n[s]}return e}function pd(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Lc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:rt.workingColorSpace}var Ah={clone:Ti,merge:Wt},md=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,gd=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,En=class extends si{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=md,this.fragmentShader=gd,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Ti(e.uniforms),this.uniformsGroups=pd(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let o=this.uniforms[s].value;o&&o.isTexture?t.uniforms[s]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[s]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[s]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[s]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[s]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[s]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[s]={type:"m4",value:o.toArray()}:t.uniforms[s]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}},Vs=class extends rn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ot,this.projectionMatrix=new ot,this.projectionMatrixInverse=new ot,this.coordinateSystem=vn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},ei=new I,bl=new Ue,El=new Ue,Jt=class extends Vs{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Qi*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ps*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Qi*2*Math.atan(Math.tan(Ps*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){ei.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(ei.x,ei.y).multiplyScalar(-e/ei.z),ei.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ei.x,ei.y).multiplyScalar(-e/ei.z)}getViewSize(e,t){return this.getViewBounds(e,bl,El),t.subVectors(El,bl)}setViewOffset(e,t,n,s,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ps*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,o=this.view;if(this.view!==null&&this.view.enabled){let l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*s/l,t-=o.offsetY*n/c,s*=o.width/l,n*=o.height/c}let a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}},qi=-90,Yi=1,no=class extends rn{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Jt(qi,Yi,e,t);s.layers=this.layers,this.add(s);let r=new Jt(qi,Yi,e,t);r.layers=this.layers,this.add(r);let o=new Jt(qi,Yi,e,t);o.layers=this.layers,this.add(o);let a=new Jt(qi,Yi,e,t);a.layers=this.layers,this.add(a);let l=new Jt(qi,Yi,e,t);l.layers=this.layers,this.add(l);let c=new Jt(qi,Yi,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,o,a,l]=t;for(let c of t)this.remove(c);if(e===vn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===Os)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),f=e.getActiveCubeFace(),p=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;let _=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,s),e.render(t,r),e.setRenderTarget(n,1,s),e.render(t,o),e.setRenderTarget(n,2,s),e.render(t,a),e.setRenderTarget(n,3,s),e.render(t,l),e.setRenderTarget(n,4,s),e.render(t,c),n.texture.generateMipmaps=_,e.setRenderTarget(n,5,s),e.render(t,h),e.setRenderTarget(u,f,p),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}},Gs=class extends Yt{constructor(e=[],t=Ei,n,s,r,o,a,l,c,h){super(e,t,n,s,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},io=class extends In{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Gs(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new ns(5,5,5),r=new En({name:"CubemapFromEquirect",uniforms:Ti(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Zt,blending:qn});r.uniforms.tEquirect.value=t;let o=new Et(s,r),a=t.minFilter;return t.minFilter===ai&&(t.minFilter=Sn),new no(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,s);e.setRenderTarget(r)}},Bt=class extends rn{constructor(){super(),this.isGroup=!0,this.type="Group"}},_d={type:"move"},is=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Bt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Bt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new I,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new I),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Bt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new I,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new I),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,o=null,a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(let _ of e.hand.values()){let m=t.getJointPose(_,n),d=this._getHandJoint(c,_);m!==null&&(d.matrix.fromArray(m.transform.matrix),d.matrix.decompose(d.position,d.rotation,d.scale),d.matrixWorldNeedsUpdate=!0,d.jointRadius=m.radius),d.visible=m!==null}let h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],f=h.position.distanceTo(u.position),p=.02,g=.005;c.inputState.pinching&&f>p+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&f<=p-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(a.matrix.fromArray(s.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,s.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(s.linearVelocity)):a.hasLinearVelocity=!1,s.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(s.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(_d)))}return a!==null&&(a.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Bt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}};var Ws=class extends rn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new zt,this.environmentIntensity=1,this.environmentRotation=new zt,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}};var wl=new I,Tl=new yt,Al=new yt,xd=new I,Rl=new ot,kr=new I,Ka=new dn,Cl=new ot,Qa=new zs,Xs=class extends Et{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ic,this.bindMatrix=new ot,this.bindMatrixInverse=new ot,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){let e=this.geometry;this.boundingBox===null&&(this.boundingBox=new bn),this.boundingBox.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,kr),this.boundingBox.expandByPoint(kr)}computeBoundingSphere(){let e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new dn),this.boundingSphere.makeEmpty();let t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,kr),this.boundingSphere.expandByPoint(kr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){let n=this.material,s=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ka.copy(this.boundingSphere),Ka.applyMatrix4(s),e.ray.intersectsSphere(Ka)!==!1&&(Cl.copy(s).invert(),Qa.copy(e.ray).applyMatrix4(Cl),!(this.boundingBox!==null&&Qa.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Qa)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){let e=new yt,t=this.geometry.attributes.skinWeight;for(let n=0,s=t.count;n<s;n++){e.fromBufferAttribute(t,n);let r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ic?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===dh?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){let n=this.skeleton,s=this.geometry;Tl.fromBufferAttribute(s.attributes.skinIndex,e),Al.fromBufferAttribute(s.attributes.skinWeight,e),wl.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){let o=Al.getComponent(r);if(o!==0){let a=Tl.getComponent(r);Rl.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(xd.copy(wl).applyMatrix4(Rl),o)}}return t.applyMatrix4(this.bindMatrixInverse)}},Pn=class extends rn{constructor(){super(),this.isBone=!0,this.type="Bone"}},so=class extends Yt{constructor(e=null,t=1,n=1,s,r,o,a,l,c=Qt,h=Qt,u,f){super(null,o,a,l,c,h,s,r,u,f),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}},Il=new ot,yd=new ot,vi=class i{constructor(e=[],t=[]){this.uuid=li(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){let e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,s=this.bones.length;n<s;n++)this.boneInverses.push(new ot)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){let n=new ot;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){let n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){let e=this.bones,t=this.boneInverses,n=this.boneMatrices,s=this.boneTexture;for(let r=0,o=e.length;r<o;r++){let a=e[r]?e[r].matrixWorld:yd;Il.multiplyMatrices(a,t[r]),Il.toArray(n,r*16)}s!==null&&(s.needsUpdate=!0)}clone(){return new i(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);let t=new Float32Array(e*e*4);t.set(this.boneMatrices);let n=new so(t,e,e,cn,Tn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){let s=this.bones[t];if(s.name===e)return s}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,s=e.bones.length;n<s;n++){let r=e.bones[n],o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new Pn),this.bones.push(o),this.boneInverses.push(new ot().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){let e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;let t=this.bones,n=this.boneInverses;for(let s=0,r=t.length;s<r;s++){let o=t[s];e.bones.push(o.uuid);let a=n[s];e.boneInverses.push(a.toArray())}return e}};var ja=new I,vd=new I,Md=new $e,Cn=class{constructor(e=new I(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=ja.subVectors(n,t).cross(vd.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){let n=e.delta(ja),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let r=-(e.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Md.getNormalMatrix(e),s=this.coplanarPoint(ja).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}},mi=new dn,Sd=new Ue(.5,.5),Hr=new I,qs=class{constructor(e=new Cn,t=new Cn,n=new Cn,s=new Cn,r=new Cn,o=new Cn){this.planes=[e,t,n,s,r,o]}set(e,t,n,s,r,o){let a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(s),a[4].copy(r),a[5].copy(o),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=vn,n=!1){let s=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],f=r[6],p=r[7],g=r[8],_=r[9],m=r[10],d=r[11],M=r[12],v=r[13],x=r[14],P=r[15];if(s[0].setComponents(c-o,p-h,d-g,P-M).normalize(),s[1].setComponents(c+o,p+h,d+g,P+M).normalize(),s[2].setComponents(c+a,p+u,d+_,P+v).normalize(),s[3].setComponents(c-a,p-u,d-_,P-v).normalize(),n)s[4].setComponents(l,f,m,x).normalize(),s[5].setComponents(c-l,p-f,d-m,P-x).normalize();else if(s[4].setComponents(c-l,p-f,d-m,P-x).normalize(),t===vn)s[5].setComponents(c+l,p+f,d+m,P+x).normalize();else if(t===Os)s[5].setComponents(l,f,m,x).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),mi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),mi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(mi)}intersectsSprite(e){mi.center.set(0,0,0);let t=Sd.distanceTo(e.center);return mi.radius=.7071067811865476+t,mi.applyMatrix4(e.matrixWorld),this.intersectsSphere(mi)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Hr.x=s.normal.x>0?e.max.x:e.min.x,Hr.y=s.normal.y>0?e.max.y:e.min.y,Hr.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Hr)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var Ys=class extends Yt{constructor(e,t,n=ci,s,r,o,a=Qt,l=Qt,c,h=Ki,u=1){if(h!==Ki&&h!==us)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let f={width:e,height:t,depth:u};super(f,s,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ts(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}},Zs=class extends Yt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}};var on=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(s=Math.floor(a+(l-a)/2),c=n[s]-o,c<0)a=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===o)return s/(r-1);let h=n[s],f=n[s+1]-h,p=(o-h)/f;return(s+p)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let o=this.getPoint(s),a=this.getPoint(r),l=t||(o.isVector2?new Ue:new I);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new I,s=[],r=[],o=[],a=new I,l=new ot;for(let p=0;p<=e;p++){let g=p/e;s[p]=this.getTangentAt(g,new I)}r[0]=new I,o[0]=new I;let c=Number.MAX_VALUE,h=Math.abs(s[0].x),u=Math.abs(s[0].y),f=Math.abs(s[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),f<=c&&n.set(0,0,1),a.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],a),o[0].crossVectors(s[0],r[0]);for(let p=1;p<=e;p++){if(r[p]=r[p-1].clone(),o[p]=o[p-1].clone(),a.crossVectors(s[p-1],s[p]),a.length()>Number.EPSILON){a.normalize();let g=Math.acos(je(s[p-1].dot(s[p]),-1,1));r[p].applyMatrix4(l.makeRotationAxis(a,g))}o[p].crossVectors(s[p],r[p])}if(t===!0){let p=Math.acos(je(r[0].dot(r[e]),-1,1));p/=e,s[0].dot(a.crossVectors(r[0],r[e]))>0&&(p=-p);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(s[g],p*g)),o[g].crossVectors(s[g],r[g])}return{tangents:s,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},ss=class extends on{constructor(e=0,t=0,n=1,s=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new Ue){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(o?r=0:r=s),this.aClockwise===!0&&!o&&(r===s?r=-s:r=r-s);let a=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){let h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),f=l-this.aX,p=c-this.aY;l=f*h-p*u+this.aX,c=f*u+p*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},ro=class extends ss{constructor(e,t,n,s,r,o){super(e,t,n,n,s,r,o),this.isArcCurve=!0,this.type="ArcCurve"}};function Uc(){let i=0,e=0,t=0,n=0;function s(r,o,a,l){i=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){s(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let f=(o-r)/c-(a-r)/(c+h)+(a-o)/h,p=(a-o)/h-(l-o)/(h+u)+(l-a)/u;f*=h,p*=h,s(o,a,f,p)},calc:function(r){let o=r*r,a=o*r;return i+e*r+t*o+n*a}}}var Vr=new I,ec=new Uc,tc=new Uc,nc=new Uc,Dn=class extends on{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new I){let n=t,s=this.points,r=s.length,o=(r-(this.closed?0:1))*e,a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=s[(a-1)%r]:(Vr.subVectors(s[0],s[1]).add(s[0]),c=Vr);let u=s[a%r],f=s[(a+1)%r];if(this.closed||a+2<r?h=s[(a+2)%r]:(Vr.subVectors(s[r-1],s[r-2]).add(s[r-1]),h=Vr),this.curveType==="centripetal"||this.curveType==="chordal"){let p=this.curveType==="chordal"?.5:.25,g=Math.pow(c.distanceToSquared(u),p),_=Math.pow(u.distanceToSquared(f),p),m=Math.pow(f.distanceToSquared(h),p);_<1e-4&&(_=1),g<1e-4&&(g=_),m<1e-4&&(m=_),ec.initNonuniformCatmullRom(c.x,u.x,f.x,h.x,g,_,m),tc.initNonuniformCatmullRom(c.y,u.y,f.y,h.y,g,_,m),nc.initNonuniformCatmullRom(c.z,u.z,f.z,h.z,g,_,m)}else this.curveType==="catmullrom"&&(ec.initCatmullRom(c.x,u.x,f.x,h.x,this.tension),tc.initCatmullRom(c.y,u.y,f.y,h.y,this.tension),nc.initCatmullRom(c.z,u.z,f.z,h.z,this.tension));return n.set(ec.calc(l),tc.calc(l),nc.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new I().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Pl(i,e,t,n,s){let r=(n-e)*.5,o=(s-t)*.5,a=i*i,l=i*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*i+t}function bd(i,e){let t=1-i;return t*t*e}function Ed(i,e){return 2*(1-i)*i*e}function wd(i,e){return i*i*e}function Ls(i,e,t,n){return bd(i,e)+Ed(i,t)+wd(i,n)}function Td(i,e){let t=1-i;return t*t*t*e}function Ad(i,e){let t=1-i;return 3*t*t*i*e}function Rd(i,e){return 3*(1-i)*i*i*e}function Cd(i,e){return i*i*i*e}function Us(i,e,t,n,s){return Td(i,e)+Ad(i,t)+Rd(i,n)+Cd(i,s)}var $s=class extends on{constructor(e=new Ue,t=new Ue,n=new Ue,s=new Ue){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Ue){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Us(e,s.x,r.x,o.x,a.x),Us(e,s.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},oo=class extends on{constructor(e=new I,t=new I,n=new I,s=new I){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new I){let n=t,s=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(Us(e,s.x,r.x,o.x,a.x),Us(e,s.y,r.y,o.y,a.y),Us(e,s.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Js=class extends on{constructor(e=new Ue,t=new Ue){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Ue){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Ue){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ao=class extends on{constructor(e=new I,t=new I){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new I){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new I){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ks=class extends on{constructor(e=new Ue,t=new Ue,n=new Ue){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Ue){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Ls(e,s.x,r.x,o.x),Ls(e,s.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},co=class extends on{constructor(e=new I,t=new I,n=new I){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new I){let n=t,s=this.v0,r=this.v1,o=this.v2;return n.set(Ls(e,s.x,r.x,o.x),Ls(e,s.y,r.y,o.y),Ls(e,s.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Qs=class extends on{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Ue){let n=t,s=this.points,r=(s.length-1)*e,o=Math.floor(r),a=r-o,l=s[o===0?o:o-1],c=s[o],h=s[o>s.length-2?s.length-1:o+1],u=s[o>s.length-3?s.length-1:o+2];return n.set(Pl(a,l.x,c.x,h.x,u.x),Pl(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new Ue().fromArray(s))}return this}},Dl=Object.freeze({__proto__:null,ArcCurve:ro,CatmullRomCurve3:Dn,CubicBezierCurve:$s,CubicBezierCurve3:oo,EllipseCurve:ss,LineCurve:Js,LineCurve3:ao,QuadraticBezierCurve:Ks,QuadraticBezierCurve3:co,SplineCurve:Qs}),lo=class extends on{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Dl[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let o=s[r]-n,a=this.curves[r],l=a.getLength(),c=l===0?0:1-o/l;return a.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let o=r[s],a=o.isEllipseCurve?e*2:o.isLineCurve||o.isLineCurve3?1:o.isSplineCurve?e*o.points.length:e,l=o.getPoints(a);for(let c=0;c<l.length;c++){let h=l[c];n&&n.equals(h)||(t.push(h),n=h)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Dl[s.type]().fromJSON(s))}return this}},Ln=class extends lo{constructor(e){super(),this.type="Path",this.currentPoint=new Ue,e&&this.setFromPoints(e)}setFromPoints(e){this.moveTo(e[0].x,e[0].y);for(let t=1,n=e.length;t<n;t++)this.lineTo(e[t].x,e[t].y);return this}moveTo(e,t){return this.currentPoint.set(e,t),this}lineTo(e,t){let n=new Js(this.currentPoint.clone(),new Ue(e,t));return this.curves.push(n),this.currentPoint.set(e,t),this}quadraticCurveTo(e,t,n,s){let r=new Ks(this.currentPoint.clone(),new Ue(e,t),new Ue(n,s));return this.curves.push(r),this.currentPoint.set(n,s),this}bezierCurveTo(e,t,n,s,r,o){let a=new $s(this.currentPoint.clone(),new Ue(e,t),new Ue(n,s),new Ue(r,o));return this.curves.push(a),this.currentPoint.set(r,o),this}splineThru(e){let t=[this.currentPoint.clone()].concat(e),n=new Qs(t);return this.curves.push(n),this.currentPoint.copy(e[e.length-1]),this}arc(e,t,n,s,r,o){let a=this.currentPoint.x,l=this.currentPoint.y;return this.absarc(e+a,t+l,n,s,r,o),this}absarc(e,t,n,s,r,o){return this.absellipse(e,t,n,n,s,r,o),this}ellipse(e,t,n,s,r,o,a,l){let c=this.currentPoint.x,h=this.currentPoint.y;return this.absellipse(e+c,t+h,n,s,r,o,a,l),this}absellipse(e,t,n,s,r,o,a,l){let c=new ss(e,t,n,s,r,o,a,l);if(this.curves.length>0){let u=c.getPoint(0);u.equals(this.currentPoint)||this.lineTo(u.x,u.y)}this.curves.push(c);let h=c.getPoint(1);return this.currentPoint.copy(h),this}copy(e){return super.copy(e),this.currentPoint.copy(e.currentPoint),this}toJSON(){let e=super.toJSON();return e.currentPoint=this.currentPoint.toArray(),e}fromJSON(e){return super.fromJSON(e),this.currentPoint.fromArray(e.currentPoint),this}},Xn=class extends Ln{constructor(e){super(e),this.uuid=li(),this.type="Shape",this.holes=[]}getPointsHoles(e){let t=[];for(let n=0,s=this.holes.length;n<s;n++)t[n]=this.holes[n].getPoints(e);return t}extractPoints(e){return{shape:this.getPoints(e),holes:this.getPointsHoles(e)}}copy(e){super.copy(e),this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.uuid=this.uuid,e.holes=[];for(let t=0,n=this.holes.length;t<n;t++){let s=this.holes[t];e.holes.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.uuid=e.uuid,this.holes=[];for(let t=0,n=e.holes.length;t<n;t++){let s=e.holes[t];this.holes.push(new Ln().fromJSON(s))}return this}};function Id(i,e,t=2){let n=e&&e.length,s=n?e[0]*t:i.length,r=Rh(i,0,s,t,!0),o=[];if(!r||r.next===r.prev)return o;let a,l,c;if(n&&(r=Fd(i,e,r,t)),i.length>80*t){a=1/0,l=1/0;let h=-1/0,u=-1/0;for(let f=t;f<s;f+=t){let p=i[f],g=i[f+1];p<a&&(a=p),g<l&&(l=g),p>h&&(h=p),g>u&&(u=g)}c=Math.max(h-a,u-l),c=c!==0?32767/c:0}return js(r,o,t,a,l,c,0),o}function Rh(i,e,t,n,s){let r;if(s===qd(i,e,t,n)>0)for(let o=e;o<t;o+=n)r=Ll(o/n|0,i[o],i[o+1],r);else for(let o=t-n;o>=e;o-=n)r=Ll(o/n|0,i[o],i[o+1],r);return r&&rs(r,r.next)&&(tr(r),r=r.next),r}function Mi(i,e){if(!i)return i;e||(e=i);let t=i,n;do if(n=!1,!t.steiner&&(rs(t,t.next)||bt(t.prev,t,t.next)===0)){if(tr(t),t=e=t.prev,t===t.next)break;n=!0}else t=t.next;while(n||t!==e);return e}function js(i,e,t,n,s,r,o){if(!i)return;!o&&r&&kd(i,n,s,r);let a=i;for(;i.prev!==i.next;){let l=i.prev,c=i.next;if(r?Dd(i,n,s,r):Pd(i)){e.push(l.i,i.i,c.i),tr(i),i=c.next,a=c.next;continue}if(i=c,i===a){o?o===1?(i=Ld(Mi(i),e),js(i,e,t,n,s,r,2)):o===2&&Ud(i,e,t,n,s,r):js(Mi(i),e,t,n,s,r,1);break}}}function Pd(i){let e=i.prev,t=i,n=i.next;if(bt(e,t,n)>=0)return!1;let s=e.x,r=t.x,o=n.x,a=e.y,l=t.y,c=n.y,h=Math.min(s,r,o),u=Math.min(a,l,c),f=Math.max(s,r,o),p=Math.max(a,l,c),g=n.next;for(;g!==e;){if(g.x>=h&&g.x<=f&&g.y>=u&&g.y<=p&&Is(s,a,r,l,o,c,g.x,g.y)&&bt(g.prev,g,g.next)>=0)return!1;g=g.next}return!0}function Dd(i,e,t,n){let s=i.prev,r=i,o=i.next;if(bt(s,r,o)>=0)return!1;let a=s.x,l=r.x,c=o.x,h=s.y,u=r.y,f=o.y,p=Math.min(a,l,c),g=Math.min(h,u,f),_=Math.max(a,l,c),m=Math.max(h,u,f),d=lc(p,g,e,t,n),M=lc(_,m,e,t,n),v=i.prevZ,x=i.nextZ;for(;v&&v.z>=d&&x&&x.z<=M;){if(v.x>=p&&v.x<=_&&v.y>=g&&v.y<=m&&v!==s&&v!==o&&Is(a,h,l,u,c,f,v.x,v.y)&&bt(v.prev,v,v.next)>=0||(v=v.prevZ,x.x>=p&&x.x<=_&&x.y>=g&&x.y<=m&&x!==s&&x!==o&&Is(a,h,l,u,c,f,x.x,x.y)&&bt(x.prev,x,x.next)>=0))return!1;x=x.nextZ}for(;v&&v.z>=d;){if(v.x>=p&&v.x<=_&&v.y>=g&&v.y<=m&&v!==s&&v!==o&&Is(a,h,l,u,c,f,v.x,v.y)&&bt(v.prev,v,v.next)>=0)return!1;v=v.prevZ}for(;x&&x.z<=M;){if(x.x>=p&&x.x<=_&&x.y>=g&&x.y<=m&&x!==s&&x!==o&&Is(a,h,l,u,c,f,x.x,x.y)&&bt(x.prev,x,x.next)>=0)return!1;x=x.nextZ}return!0}function Ld(i,e){let t=i;do{let n=t.prev,s=t.next.next;!rs(n,s)&&Ih(n,t,t.next,s)&&er(n,s)&&er(s,n)&&(e.push(n.i,t.i,s.i),tr(t),tr(t.next),t=i=s),t=t.next}while(t!==i);return Mi(t)}function Ud(i,e,t,n,s,r){let o=i;do{let a=o.next.next;for(;a!==o.prev;){if(o.i!==a.i&&Gd(o,a)){let l=Ph(o,a);o=Mi(o,o.next),l=Mi(l,l.next),js(o,e,t,n,s,r,0),js(l,e,t,n,s,r,0);return}a=a.next}o=o.next}while(o!==i)}function Fd(i,e,t,n){let s=[];for(let r=0,o=e.length;r<o;r++){let a=e[r]*n,l=r<o-1?e[r+1]*n:i.length,c=Rh(i,a,l,n,!1);c===c.next&&(c.steiner=!0),s.push(Vd(c))}s.sort(Nd);for(let r=0;r<s.length;r++)t=Od(s[r],t);return t}function Nd(i,e){let t=i.x-e.x;if(t===0&&(t=i.y-e.y,t===0)){let n=(i.next.y-i.y)/(i.next.x-i.x),s=(e.next.y-e.y)/(e.next.x-e.x);t=n-s}return t}function Od(i,e){let t=Bd(i,e);if(!t)return e;let n=Ph(t,i);return Mi(n,n.next),Mi(t,t.next)}function Bd(i,e){let t=e,n=i.x,s=i.y,r=-1/0,o;if(rs(i,t))return t;do{if(rs(i,t.next))return t.next;if(s<=t.y&&s>=t.next.y&&t.next.y!==t.y){let u=t.x+(s-t.y)*(t.next.x-t.x)/(t.next.y-t.y);if(u<=n&&u>r&&(r=u,o=t.x<t.next.x?t:t.next,u===n))return o}t=t.next}while(t!==e);if(!o)return null;let a=o,l=o.x,c=o.y,h=1/0;t=o;do{if(n>=t.x&&t.x>=l&&n!==t.x&&Ch(s<c?n:r,s,l,c,s<c?r:n,s,t.x,t.y)){let u=Math.abs(s-t.y)/(n-t.x);er(t,i)&&(u<h||u===h&&(t.x>o.x||t.x===o.x&&zd(o,t)))&&(o=t,h=u)}t=t.next}while(t!==a);return o}function zd(i,e){return bt(i.prev,i,e.prev)<0&&bt(e.next,i,i.next)<0}function kd(i,e,t,n){let s=i;do s.z===0&&(s.z=lc(s.x,s.y,e,t,n)),s.prevZ=s.prev,s.nextZ=s.next,s=s.next;while(s!==i);s.prevZ.nextZ=null,s.prevZ=null,Hd(s)}function Hd(i){let e,t=1;do{let n=i,s;i=null;let r=null;for(e=0;n;){e++;let o=n,a=0;for(let c=0;c<t&&(a++,o=o.nextZ,!!o);c++);let l=t;for(;a>0||l>0&&o;)a!==0&&(l===0||!o||n.z<=o.z)?(s=n,n=n.nextZ,a--):(s=o,o=o.nextZ,l--),r?r.nextZ=s:i=s,s.prevZ=r,r=s;n=o}r.nextZ=null,t*=2}while(e>1);return i}function lc(i,e,t,n,s){return i=(i-t)*s|0,e=(e-n)*s|0,i=(i|i<<8)&16711935,i=(i|i<<4)&252645135,i=(i|i<<2)&858993459,i=(i|i<<1)&1431655765,e=(e|e<<8)&16711935,e=(e|e<<4)&252645135,e=(e|e<<2)&858993459,e=(e|e<<1)&1431655765,i|e<<1}function Vd(i){let e=i,t=i;do(e.x<t.x||e.x===t.x&&e.y<t.y)&&(t=e),e=e.next;while(e!==i);return t}function Ch(i,e,t,n,s,r,o,a){return(s-o)*(e-a)>=(i-o)*(r-a)&&(i-o)*(n-a)>=(t-o)*(e-a)&&(t-o)*(r-a)>=(s-o)*(n-a)}function Is(i,e,t,n,s,r,o,a){return!(i===o&&e===a)&&Ch(i,e,t,n,s,r,o,a)}function Gd(i,e){return i.next.i!==e.i&&i.prev.i!==e.i&&!Wd(i,e)&&(er(i,e)&&er(e,i)&&Xd(i,e)&&(bt(i.prev,i,e.prev)||bt(i,e.prev,e))||rs(i,e)&&bt(i.prev,i,i.next)>0&&bt(e.prev,e,e.next)>0)}function bt(i,e,t){return(e.y-i.y)*(t.x-e.x)-(e.x-i.x)*(t.y-e.y)}function rs(i,e){return i.x===e.x&&i.y===e.y}function Ih(i,e,t,n){let s=Wr(bt(i,e,t)),r=Wr(bt(i,e,n)),o=Wr(bt(t,n,i)),a=Wr(bt(t,n,e));return!!(s!==r&&o!==a||s===0&&Gr(i,t,e)||r===0&&Gr(i,n,e)||o===0&&Gr(t,i,n)||a===0&&Gr(t,e,n))}function Gr(i,e,t){return e.x<=Math.max(i.x,t.x)&&e.x>=Math.min(i.x,t.x)&&e.y<=Math.max(i.y,t.y)&&e.y>=Math.min(i.y,t.y)}function Wr(i){return i>0?1:i<0?-1:0}function Wd(i,e){let t=i;do{if(t.i!==i.i&&t.next.i!==i.i&&t.i!==e.i&&t.next.i!==e.i&&Ih(t,t.next,i,e))return!0;t=t.next}while(t!==i);return!1}function er(i,e){return bt(i.prev,i,i.next)<0?bt(i,e,i.next)>=0&&bt(i,i.prev,e)>=0:bt(i,e,i.prev)<0||bt(i,i.next,e)<0}function Xd(i,e){let t=i,n=!1,s=(i.x+e.x)/2,r=(i.y+e.y)/2;do t.y>r!=t.next.y>r&&t.next.y!==t.y&&s<(t.next.x-t.x)*(r-t.y)/(t.next.y-t.y)+t.x&&(n=!n),t=t.next;while(t!==i);return n}function Ph(i,e){let t=hc(i.i,i.x,i.y),n=hc(e.i,e.x,e.y),s=i.next,r=e.prev;return i.next=e,e.prev=i,t.next=s,s.prev=t,n.next=t,t.prev=n,r.next=n,n.prev=r,n}function Ll(i,e,t,n){let s=hc(i,e,t);return n?(s.next=n.next,s.prev=n,n.next.prev=s,n.next=s):(s.prev=s,s.next=s),s}function tr(i){i.next.prev=i.prev,i.prev.next=i.next,i.prevZ&&(i.prevZ.nextZ=i.nextZ),i.nextZ&&(i.nextZ.prevZ=i.prevZ)}function hc(i,e,t){return{i,x:e,y:t,prev:null,next:null,z:0,prevZ:null,nextZ:null,steiner:!1}}function qd(i,e,t,n){let s=0;for(let r=e,o=t-n;r<t;r+=n)s+=(i[o]-i[r])*(i[r+1]+i[o+1]),o=r;return s}var uc=class{static triangulate(e,t,n=2){return Id(e,t,n)}},Mn=class i{static area(e){let t=e.length,n=0;for(let s=t-1,r=0;r<t;s=r++)n+=e[s].x*e[r].y-e[r].x*e[s].y;return n*.5}static isClockWise(e){return i.area(e)<0}static triangulateShape(e,t){let n=[],s=[],r=[];Ul(e),Fl(n,e);let o=e.length;t.forEach(Ul);for(let l=0;l<t.length;l++)s.push(o),o+=t[l].length,Fl(n,t[l]);let a=uc.triangulate(n,s);for(let l=0;l<a.length;l+=3)r.push(a.slice(l,l+3));return r}};function Ul(i){let e=i.length;e>2&&i[e-1].equals(i[0])&&i.pop()}function Fl(i,e){for(let t=0;t<e.length;t++)i.push(e[t].x),i.push(e[t].y)}var nr=class i extends It{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(s),c=a+1,h=l+1,u=e/a,f=t/l,p=[],g=[],_=[],m=[];for(let d=0;d<h;d++){let M=d*f-o;for(let v=0;v<c;v++){let x=v*u-r;g.push(x,-M,0),_.push(0,0,1),m.push(v/a),m.push(1-d/l)}}for(let d=0;d<l;d++)for(let M=0;M<a;M++){let v=M+c*d,x=M+c*(d+1),P=M+1+c*(d+1),A=M+1+c*d;p.push(v,x,A),p.push(x,P,A)}this.setIndex(p),this.setAttribute("position",new Je(g,3)),this.setAttribute("normal",new Je(_,3)),this.setAttribute("uv",new Je(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}};var ir=class i extends It{constructor(e=new Xn([new Ue(0,.5),new Ue(-.5,-.5),new Ue(.5,-.5)]),t=12){super(),this.type="ShapeGeometry",this.parameters={shapes:e,curveSegments:t};let n=[],s=[],r=[],o=[],a=0,l=0;if(Array.isArray(e)===!1)c(e);else for(let h=0;h<e.length;h++)c(e[h]),this.addGroup(a,l,h),a+=l,l=0;this.setIndex(n),this.setAttribute("position",new Je(s,3)),this.setAttribute("normal",new Je(r,3)),this.setAttribute("uv",new Je(o,2));function c(h){let u=s.length/3,f=h.extractPoints(t),p=f.shape,g=f.holes;Mn.isClockWise(p)===!1&&(p=p.reverse());for(let m=0,d=g.length;m<d;m++){let M=g[m];Mn.isClockWise(M)===!0&&(g[m]=M.reverse())}let _=Mn.triangulateShape(p,g);for(let m=0,d=g.length;m<d;m++){let M=g[m];p=p.concat(M)}for(let m=0,d=p.length;m<d;m++){let M=p[m];s.push(M.x,M.y,0),r.push(0,0,1),o.push(M.x,M.y)}for(let m=0,d=_.length;m<d;m++){let M=_[m],v=M[0]+u,x=M[1]+u,P=M[2]+u;n.push(v,x,P),l+=3}}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON(),t=this.parameters.shapes;return Yd(t,e)}static fromJSON(e,t){let n=[];for(let s=0,r=e.shapes.length;s<r;s++){let o=t[e.shapes[s]];n.push(o)}return new i(n,e.curveSegments)}};function Yd(i,e){if(e.shapes=[],Array.isArray(i))for(let t=0,n=i.length;t<n;t++){let s=i[t];e.shapes.push(s.uuid)}else e.shapes.push(i.uuid);return e}var Si=class extends si{constructor(e){super(),this.isMeshToonMaterial=!0,this.defines={TOON:""},this.type="MeshToonMaterial",this.color=new qe(16777215),this.map=null,this.gradientMap=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new qe(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Rc,this.normalScale=new Ue(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.alphaMap=null,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.gradientMap=e.gradientMap,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.alphaMap=e.alphaMap,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}};var ho=class extends si{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=ph,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},uo=class extends si{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Xr(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Zd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var bi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let o;t:{i:if(!(e<s)){for(let a=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=s,s=t[++n],e<s)break e}o=t.length;break t}if(!(e>=r)){let a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}o=n,n=0;break t}break n}for(;n<o;){let a=n+o>>>1;e<t[a]?o=a:n=a+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let o=0;o!==s;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},fo=class extends bi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:sc,endingEnd:sc}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,o=e+1,a=s[r],l=s[o];if(a===void 0)switch(this.getSettings_().endingStart){case rc:r=e,a=2*t-n;break;case oc:r=s.length-2,a=t+s[r]-s[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case rc:o=e,l=2*n-t;break;case oc:o=1,l=n+s[1]-s[0];break;default:o=e-1,l=t}let c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,f=this._weightPrev,p=this._weightNext,g=(n-t)/(s-t),_=g*g,m=_*g,d=-f*m+2*f*_-f*g,M=(1+f)*m+(-1.5-2*f)*_+(-.5+f)*g+1,v=(-1-p)*m+(1.5+p)*_+.5*g,x=p*m-p*_;for(let P=0;P!==a;++P)r[P]=d*o[h+P]+M*o[c+P]+v*o[l+P]+x*o[u+P];return r}},po=class extends bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(s-t),u=1-h;for(let f=0;f!==a;++f)r[f]=o[c+f]*u+o[l+f]*h;return r}},mo=class extends bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},an=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Xr(t,this.TimeBufferType),this.values=Xr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Xr(e.times,Array),values:Xr(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new mo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new po(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new fo(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case Fs:t=this.InterpolantFactoryMethodDiscrete;break;case Qr:t=this.InterpolantFactoryMethodLinear;break;case qr:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Fs;case this.InterpolantFactoryMethodLinear:return Qr;case this.InterpolantFactoryMethodSmooth:return qr}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e}return this}trim(e,t){let n=this.times,s=n.length,r=0,o=s-1;for(;r!==s&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==s){r>=o&&(o=Math.max(o,1),r=o-1);let a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){let l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(s!==void 0&&Zd(s))for(let a=0,l=s.length;a!==l;++a){let c=s[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===qr,r=e.length-1,o=1;for(let a=1;a<r;++a){let l=!1,c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(s)l=!0;else{let u=a*n,f=u-n,p=u+n;for(let g=0;g!==n;++g){let _=t[u+g];if(_!==t[f+g]||_!==t[p+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];let u=a*n,f=o*n;for(let p=0;p!==n;++p)t[f+p]=t[u+p]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,s}};an.prototype.ValueTypeName="";an.prototype.TimeBufferType=Float32Array;an.prototype.ValueBufferType=Float32Array;an.prototype.DefaultInterpolation=Qr;var ri=class extends an{constructor(e,t,n){super(e,t,n)}};ri.prototype.ValueTypeName="bool";ri.prototype.ValueBufferType=Array;ri.prototype.DefaultInterpolation=Fs;ri.prototype.InterpolantFactoryMethodLinear=void 0;ri.prototype.InterpolantFactoryMethodSmooth=void 0;var go=class extends an{constructor(e,t,n,s){super(e,t,n,s)}};go.prototype.ValueTypeName="color";var _o=class extends an{constructor(e,t,n,s){super(e,t,n,s)}};_o.prototype.ValueTypeName="number";var xo=class extends bi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(s-t),c=e*a;for(let h=c+a;c!==h;c+=4)et.slerpFlat(r,0,o,c-a,o,c,l);return r}},sr=class extends an{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new xo(this.times,this.values,this.getValueSize(),e)}};sr.prototype.ValueTypeName="quaternion";sr.prototype.InterpolantFactoryMethodSmooth=void 0;var oi=class extends an{constructor(e,t,n){super(e,t,n)}};oi.prototype.ValueTypeName="string";oi.prototype.ValueBufferType=Array;oi.prototype.DefaultInterpolation=Fs;oi.prototype.InterpolantFactoryMethodLinear=void 0;oi.prototype.InterpolantFactoryMethodSmooth=void 0;var yo=class extends an{constructor(e,t,n,s){super(e,t,n,s)}};yo.prototype.ValueTypeName="vector";var Yr={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(this.files[i]=e)},get:function(i){if(this.enabled!==!1)return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}},vo=class{constructor(e,t,n){let s=this,r=!1,o=0,a=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){a++,r===!1&&s.onStart!==void 0&&s.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,s.onProgress!==void 0&&s.onProgress(h,o,a),o===a&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(h){s.onError!==void 0&&s.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){let u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,f=c.length;u<f;u+=2){let p=c[u],g=c[u+1];if(p.global&&(p.lastIndex=0),p.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Dh=new vo,os=class{constructor(e){this.manager=e!==void 0?e:Dh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};os.DEFAULT_MATERIAL_NAME="__DEFAULT";var Zi=new WeakMap,Mo=class extends os{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,o=Yr.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=Zi.get(o);u===void 0&&(u=[],Zi.set(o,u)),u.push({onLoad:t,onError:s})}return o}let a=ji("img");function l(){h(),t&&t(this);let u=Zi.get(this)||[];for(let f=0;f<u.length;f++){let p=u[f];p.onLoad&&p.onLoad(this)}Zi.delete(this),r.manager.itemEnd(e)}function c(u){h(),s&&s(u),Yr.remove(`image:${e}`);let f=Zi.get(this)||[];for(let p=0;p<f.length;p++){let g=f[p];g.onError&&g.onError(u)}Zi.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),Yr.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}};var rr=class extends os{constructor(e){super(e)}load(e,t,n,s){let r=new Yt,o=new Mo(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}};var as=class extends Vs{constructor(e=-1,t=1,n=1,s=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,o=n+e,a=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}};var So=class extends Jt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Fc="\\[\\]\\.:\\/",$d=new RegExp("["+Fc+"]","g"),Nc="[^"+Fc+"]",Jd="[^"+Fc.replace("\\.","")+"]",Kd=/((?:WC+[\/:])*)/.source.replace("WC",Nc),Qd=/(WCOD+)?/.source.replace("WCOD",Jd),jd=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Nc),ef=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Nc),tf=new RegExp("^"+Kd+Qd+jd+ef+"$"),nf=["material","materials","bones","map"],dc=class{constructor(e,t,n){let s=n||xt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},xt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace($d,"")}static parseTrackName(e){let t=tf.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);nf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let o=0;o<r.length;o++){let a=r[o];if(a.name===t||a.uuid===t)return a;let l=n(a.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let o=e[s];if(o===void 0){let c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};xt.Composite=dc;xt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};xt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};xt.prototype.GetterByBindingType=[xt.prototype._getValue_direct,xt.prototype._getValue_array,xt.prototype._getValue_arrayElement,xt.prototype._getValue_toArray];xt.prototype.SetterByBindingTypeAndVersioning=[[xt.prototype._setValue_direct,xt.prototype._setValue_direct_setNeedsUpdate,xt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_array,xt.prototype._setValue_array_setNeedsUpdate,xt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_arrayElement,xt.prototype._setValue_arrayElement_setNeedsUpdate,xt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[xt.prototype._setValue_fromArray,xt.prototype._setValue_fromArray_setNeedsUpdate,xt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var g_=new Float32Array(1);function Oc(i,e,t,n){let s=sf(n);switch(t){case Ec:return i*e;case Tc:return i*e/s.components*s.byteLength;case No:return i*e/s.components*s.byteLength;case Ac:return i*e*2/s.components*s.byteLength;case Oo:return i*e*2/s.components*s.byteLength;case wc:return i*e*3/s.components*s.byteLength;case cn:return i*e*4/s.components*s.byteLength;case Bo:return i*e*4/s.components*s.byteLength;case cr:case lr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case hr:case ur:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case ko:case Vo:return Math.max(i,16)*Math.max(e,8)/4;case zo:case Ho:return Math.max(i,8)*Math.max(e,8)/2;case Go:case Wo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Xo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case qo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Yo:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Zo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case $o:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Jo:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Ko:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Qo:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case jo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case ea:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case ta:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case na:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case ia:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case sa:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case ra:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case oa:case aa:case ca:return Math.ceil(i/4)*Math.ceil(e/4)*16;case la:case ha:return Math.ceil(i/4)*Math.ceil(e/4)*8;case ua:case da:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function sf(i){switch(i){case Fn:case vc:return{byteLength:1,components:1};case cs:case Mc:case ls:return{byteLength:2,components:1};case Uo:case Fo:return{byteLength:2,components:4};case ci:case Lo:case Tn:return{byteLength:4,components:1};case Sc:case bc:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function nu(){let i=null,e=!1,t=null,n=null;function s(r,o){t(r,o),n=i.requestAnimationFrame(s)}return{start:function(){e!==!0&&t!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function of(i){let e=new WeakMap;function t(a,l){let c=a.array,h=a.usage,u=c.byteLength,f=i.createBuffer();i.bindBuffer(l,f),i.bufferData(l,c,h),a.onUploadCallback();let p;if(c instanceof Float32Array)p=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)p=i.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?p=i.HALF_FLOAT:p=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)p=i.SHORT;else if(c instanceof Uint32Array)p=i.UNSIGNED_INT;else if(c instanceof Int32Array)p=i.INT;else if(c instanceof Int8Array)p=i.BYTE;else if(c instanceof Uint8Array)p=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)p=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:f,type:p,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){let h=l.array,u=l.updateRanges;if(i.bindBuffer(c,a),u.length===0)i.bufferSubData(c,0,h);else{u.sort((p,g)=>p.start-g.start);let f=0;for(let p=1;p<u.length;p++){let g=u[f],_=u[p];_.start<=g.start+g.count+1?g.count=Math.max(g.count,_.start+_.count-g.start):(++f,u[f]=_)}u.length=f+1;for(let p=0,g=u.length;p<g;p++){let _=u[p];i.bufferSubData(c,_.start*h.BYTES_PER_ELEMENT,h,_.start,_.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);let l=e.get(a);l&&(i.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){let h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}let c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:s,remove:r,update:o}}var af=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,cf=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,lf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,hf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,uf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,df=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,ff=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,pf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,mf=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,gf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,_f=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,xf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,yf=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,vf=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Mf=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,Sf=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,bf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Ef=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,wf=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Tf=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,Af=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,Rf=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,Cf=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,If=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Pf=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,Df=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Lf=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Uf=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ff=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Nf=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Of="gl_FragColor = linearToOutputTexel( gl_FragColor );",Bf=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,zf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,kf=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Hf=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Vf=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Gf=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Wf=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Xf=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,qf=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Yf=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Zf=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,$f=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Jf=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Kf=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Qf=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,jf=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,ep=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,tp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,np=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,ip=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,sp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,rp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,op=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,ap=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,cp=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,lp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,hp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,up=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,dp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,fp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,pp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,mp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,gp=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,_p=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,xp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,yp=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,vp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Mp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Sp=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,bp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ep=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,wp=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,Tp=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Ap=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Rp=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Cp=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Ip=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,Pp=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Dp=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Lp=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Up=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Fp=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Np=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Op=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,Bp=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,zp=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,kp=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Hp=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Vp=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Gp=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Wp=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Xp=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,qp=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Yp=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Zp=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,$p=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Jp=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Kp=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Qp=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,jp=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,em=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,tm=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,nm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,im=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,sm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,rm=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,om=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,am=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,lm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,hm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,um=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,fm=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,pm=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,mm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,gm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,_m=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ym=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,vm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Mm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,bm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Em=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,wm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Tm=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,Am=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,Rm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Cm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Im=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,Pm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Dm=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Lm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Um=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Fm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Nm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Om=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Bm=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,zm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Ke={alphahash_fragment:af,alphahash_pars_fragment:cf,alphamap_fragment:lf,alphamap_pars_fragment:hf,alphatest_fragment:uf,alphatest_pars_fragment:df,aomap_fragment:ff,aomap_pars_fragment:pf,batching_pars_vertex:mf,batching_vertex:gf,begin_vertex:_f,beginnormal_vertex:xf,bsdfs:yf,iridescence_fragment:vf,bumpmap_pars_fragment:Mf,clipping_planes_fragment:Sf,clipping_planes_pars_fragment:bf,clipping_planes_pars_vertex:Ef,clipping_planes_vertex:wf,color_fragment:Tf,color_pars_fragment:Af,color_pars_vertex:Rf,color_vertex:Cf,common:If,cube_uv_reflection_fragment:Pf,defaultnormal_vertex:Df,displacementmap_pars_vertex:Lf,displacementmap_vertex:Uf,emissivemap_fragment:Ff,emissivemap_pars_fragment:Nf,colorspace_fragment:Of,colorspace_pars_fragment:Bf,envmap_fragment:zf,envmap_common_pars_fragment:kf,envmap_pars_fragment:Hf,envmap_pars_vertex:Vf,envmap_physical_pars_fragment:jf,envmap_vertex:Gf,fog_vertex:Wf,fog_pars_vertex:Xf,fog_fragment:qf,fog_pars_fragment:Yf,gradientmap_pars_fragment:Zf,lightmap_pars_fragment:$f,lights_lambert_fragment:Jf,lights_lambert_pars_fragment:Kf,lights_pars_begin:Qf,lights_toon_fragment:ep,lights_toon_pars_fragment:tp,lights_phong_fragment:np,lights_phong_pars_fragment:ip,lights_physical_fragment:sp,lights_physical_pars_fragment:rp,lights_fragment_begin:op,lights_fragment_maps:ap,lights_fragment_end:cp,logdepthbuf_fragment:lp,logdepthbuf_pars_fragment:hp,logdepthbuf_pars_vertex:up,logdepthbuf_vertex:dp,map_fragment:fp,map_pars_fragment:pp,map_particle_fragment:mp,map_particle_pars_fragment:gp,metalnessmap_fragment:_p,metalnessmap_pars_fragment:xp,morphinstance_vertex:yp,morphcolor_vertex:vp,morphnormal_vertex:Mp,morphtarget_pars_vertex:Sp,morphtarget_vertex:bp,normal_fragment_begin:Ep,normal_fragment_maps:wp,normal_pars_fragment:Tp,normal_pars_vertex:Ap,normal_vertex:Rp,normalmap_pars_fragment:Cp,clearcoat_normal_fragment_begin:Ip,clearcoat_normal_fragment_maps:Pp,clearcoat_pars_fragment:Dp,iridescence_pars_fragment:Lp,opaque_fragment:Up,packing:Fp,premultiplied_alpha_fragment:Np,project_vertex:Op,dithering_fragment:Bp,dithering_pars_fragment:zp,roughnessmap_fragment:kp,roughnessmap_pars_fragment:Hp,shadowmap_pars_fragment:Vp,shadowmap_pars_vertex:Gp,shadowmap_vertex:Wp,shadowmask_pars_fragment:Xp,skinbase_vertex:qp,skinning_pars_vertex:Yp,skinning_vertex:Zp,skinnormal_vertex:$p,specularmap_fragment:Jp,specularmap_pars_fragment:Kp,tonemapping_fragment:Qp,tonemapping_pars_fragment:jp,transmission_fragment:em,transmission_pars_fragment:tm,uv_pars_fragment:nm,uv_pars_vertex:im,uv_vertex:sm,worldpos_vertex:rm,background_vert:om,background_frag:am,backgroundCube_vert:cm,backgroundCube_frag:lm,cube_vert:hm,cube_frag:um,depth_vert:dm,depth_frag:fm,distanceRGBA_vert:pm,distanceRGBA_frag:mm,equirect_vert:gm,equirect_frag:_m,linedashed_vert:xm,linedashed_frag:ym,meshbasic_vert:vm,meshbasic_frag:Mm,meshlambert_vert:Sm,meshlambert_frag:bm,meshmatcap_vert:Em,meshmatcap_frag:wm,meshnormal_vert:Tm,meshnormal_frag:Am,meshphong_vert:Rm,meshphong_frag:Cm,meshphysical_vert:Im,meshphysical_frag:Pm,meshtoon_vert:Dm,meshtoon_frag:Lm,points_vert:Um,points_frag:Fm,shadow_vert:Nm,shadow_frag:Om,sprite_vert:Bm,sprite_frag:zm},Me={common:{diffuse:{value:new qe(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new $e}},envmap:{envMap:{value:null},envMapRotation:{value:new $e},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new $e}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new $e}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new $e},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new $e},normalScale:{value:new Ue(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new $e},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new $e}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new $e}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new $e}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new qe(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new qe(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0},uvTransform:{value:new $e}},sprite:{diffuse:{value:new qe(16777215)},opacity:{value:1},center:{value:new Ue(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}}},Nn={basic:{uniforms:Wt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.fog]),vertexShader:Ke.meshbasic_vert,fragmentShader:Ke.meshbasic_frag},lambert:{uniforms:Wt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new qe(0)}}]),vertexShader:Ke.meshlambert_vert,fragmentShader:Ke.meshlambert_frag},phong:{uniforms:Wt([Me.common,Me.specularmap,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,Me.lights,{emissive:{value:new qe(0)},specular:{value:new qe(1118481)},shininess:{value:30}}]),vertexShader:Ke.meshphong_vert,fragmentShader:Ke.meshphong_frag},standard:{uniforms:Wt([Me.common,Me.envmap,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.roughnessmap,Me.metalnessmap,Me.fog,Me.lights,{emissive:{value:new qe(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Ke.meshphysical_vert,fragmentShader:Ke.meshphysical_frag},toon:{uniforms:Wt([Me.common,Me.aomap,Me.lightmap,Me.emissivemap,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.gradientmap,Me.fog,Me.lights,{emissive:{value:new qe(0)}}]),vertexShader:Ke.meshtoon_vert,fragmentShader:Ke.meshtoon_frag},matcap:{uniforms:Wt([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,Me.fog,{matcap:{value:null}}]),vertexShader:Ke.meshmatcap_vert,fragmentShader:Ke.meshmatcap_frag},points:{uniforms:Wt([Me.points,Me.fog]),vertexShader:Ke.points_vert,fragmentShader:Ke.points_frag},dashed:{uniforms:Wt([Me.common,Me.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Ke.linedashed_vert,fragmentShader:Ke.linedashed_frag},depth:{uniforms:Wt([Me.common,Me.displacementmap]),vertexShader:Ke.depth_vert,fragmentShader:Ke.depth_frag},normal:{uniforms:Wt([Me.common,Me.bumpmap,Me.normalmap,Me.displacementmap,{opacity:{value:1}}]),vertexShader:Ke.meshnormal_vert,fragmentShader:Ke.meshnormal_frag},sprite:{uniforms:Wt([Me.sprite,Me.fog]),vertexShader:Ke.sprite_vert,fragmentShader:Ke.sprite_frag},background:{uniforms:{uvTransform:{value:new $e},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Ke.background_vert,fragmentShader:Ke.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new $e}},vertexShader:Ke.backgroundCube_vert,fragmentShader:Ke.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Ke.cube_vert,fragmentShader:Ke.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Ke.equirect_vert,fragmentShader:Ke.equirect_frag},distanceRGBA:{uniforms:Wt([Me.common,Me.displacementmap,{referencePosition:{value:new I},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Ke.distanceRGBA_vert,fragmentShader:Ke.distanceRGBA_frag},shadow:{uniforms:Wt([Me.lights,Me.fog,{color:{value:new qe(0)},opacity:{value:1}}]),vertexShader:Ke.shadow_vert,fragmentShader:Ke.shadow_frag}};Nn.physical={uniforms:Wt([Nn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new $e},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new $e},clearcoatNormalScale:{value:new Ue(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new $e},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new $e},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new $e},sheen:{value:0},sheenColor:{value:new qe(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new $e},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new $e},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new $e},transmissionSamplerSize:{value:new Ue},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new $e},attenuationDistance:{value:0},attenuationColor:{value:new qe(0)},specularColor:{value:new qe(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new $e},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new $e},anisotropyVector:{value:new Ue},anisotropyMap:{value:null},anisotropyMapTransform:{value:new $e}}]),vertexShader:Ke.meshphysical_vert,fragmentShader:Ke.meshphysical_frag};var fa={r:0,b:0,g:0},Ai=new zt,km=new ot;function Hm(i,e,t,n,s,r,o){let a=new qe(0),l=r===!0?0:1,c,h,u=null,f=0,p=null;function g(v){let x=v.isScene===!0?v.background:null;return x&&x.isTexture&&(x=(v.backgroundBlurriness>0?t:e).get(x)),x}function _(v){let x=!1,P=g(v);P===null?d(a,l):P&&P.isColor&&(d(P,1),x=!0);let A=i.xr.getEnvironmentBlendMode();A==="additive"?n.buffers.color.setClear(0,0,0,1,o):A==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(i.autoClear||x)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(v,x){let P=g(x);P&&(P.isCubeTexture||P.mapping===or)?(h===void 0&&(h=new Et(new ns(1,1,1),new En({name:"BackgroundCubeMaterial",uniforms:Ti(Nn.backgroundCube.uniforms),vertexShader:Nn.backgroundCube.vertexShader,fragmentShader:Nn.backgroundCube.fragmentShader,side:Zt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(A,C,O){this.matrixWorld.copyPosition(O.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(h)),Ai.copy(x.backgroundRotation),Ai.x*=-1,Ai.y*=-1,Ai.z*=-1,P.isCubeTexture&&P.isRenderTargetTexture===!1&&(Ai.y*=-1,Ai.z*=-1),h.material.uniforms.envMap.value=P,h.material.uniforms.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=x.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(km.makeRotationFromEuler(Ai)),h.material.toneMapped=rt.getTransfer(P.colorSpace)!==ht,(u!==P||f!==P.version||p!==i.toneMapping)&&(h.material.needsUpdate=!0,u=P,f=P.version,p=i.toneMapping),h.layers.enableAll(),v.unshift(h,h.geometry,h.material,0,0,null)):P&&P.isTexture&&(c===void 0&&(c=new Et(new nr(2,2),new En({name:"BackgroundMaterial",uniforms:Ti(Nn.background.uniforms),vertexShader:Nn.background.vertexShader,fragmentShader:Nn.background.fragmentShader,side:Kt,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=P,c.material.uniforms.backgroundIntensity.value=x.backgroundIntensity,c.material.toneMapped=rt.getTransfer(P.colorSpace)!==ht,P.matrixAutoUpdate===!0&&P.updateMatrix(),c.material.uniforms.uvTransform.value.copy(P.matrix),(u!==P||f!==P.version||p!==i.toneMapping)&&(c.material.needsUpdate=!0,u=P,f=P.version,p=i.toneMapping),c.layers.enableAll(),v.unshift(c,c.geometry,c.material,0,0,null))}function d(v,x){v.getRGB(fa,Lc(i)),n.buffers.color.setClear(fa.r,fa.g,fa.b,x,o)}function M(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(v,x=1){a.set(v),l=x,d(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(v){l=v,d(a,l)},render:_,addToRenderList:m,dispose:M}}function Vm(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=f(null),r=s,o=!1;function a(S,U,W,J,H){let z=!1,q=u(J,W,U);r!==q&&(r=q,c(r.object)),z=p(S,J,W,H),z&&g(S,J,W,H),H!==null&&e.update(H,i.ELEMENT_ARRAY_BUFFER),(z||o)&&(o=!1,x(S,U,W,J),H!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(H).buffer))}function l(){return i.createVertexArray()}function c(S){return i.bindVertexArray(S)}function h(S){return i.deleteVertexArray(S)}function u(S,U,W){let J=W.wireframe===!0,H=n[S.id];H===void 0&&(H={},n[S.id]=H);let z=H[U.id];z===void 0&&(z={},H[U.id]=z);let q=z[J];return q===void 0&&(q=f(l()),z[J]=q),q}function f(S){let U=[],W=[],J=[];for(let H=0;H<t;H++)U[H]=0,W[H]=0,J[H]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:W,attributeDivisors:J,object:S,attributes:{},index:null}}function p(S,U,W,J){let H=r.attributes,z=U.attributes,q=0,ae=W.getAttributes();for(let Z in ae)if(ae[Z].location>=0){let re=H[Z],ue=z[Z];if(ue===void 0&&(Z==="instanceMatrix"&&S.instanceMatrix&&(ue=S.instanceMatrix),Z==="instanceColor"&&S.instanceColor&&(ue=S.instanceColor)),re===void 0||re.attribute!==ue||ue&&re.data!==ue.data)return!0;q++}return r.attributesNum!==q||r.index!==J}function g(S,U,W,J){let H={},z=U.attributes,q=0,ae=W.getAttributes();for(let Z in ae)if(ae[Z].location>=0){let re=z[Z];re===void 0&&(Z==="instanceMatrix"&&S.instanceMatrix&&(re=S.instanceMatrix),Z==="instanceColor"&&S.instanceColor&&(re=S.instanceColor));let ue={};ue.attribute=re,re&&re.data&&(ue.data=re.data),H[Z]=ue,q++}r.attributes=H,r.attributesNum=q,r.index=J}function _(){let S=r.newAttributes;for(let U=0,W=S.length;U<W;U++)S[U]=0}function m(S){d(S,0)}function d(S,U){let W=r.newAttributes,J=r.enabledAttributes,H=r.attributeDivisors;W[S]=1,J[S]===0&&(i.enableVertexAttribArray(S),J[S]=1),H[S]!==U&&(i.vertexAttribDivisor(S,U),H[S]=U)}function M(){let S=r.newAttributes,U=r.enabledAttributes;for(let W=0,J=U.length;W<J;W++)U[W]!==S[W]&&(i.disableVertexAttribArray(W),U[W]=0)}function v(S,U,W,J,H,z,q){q===!0?i.vertexAttribIPointer(S,U,W,H,z):i.vertexAttribPointer(S,U,W,J,H,z)}function x(S,U,W,J){_();let H=J.attributes,z=W.getAttributes(),q=U.defaultAttributeValues;for(let ae in z){let Z=z[ae];if(Z.location>=0){let ee=H[ae];if(ee===void 0&&(ae==="instanceMatrix"&&S.instanceMatrix&&(ee=S.instanceMatrix),ae==="instanceColor"&&S.instanceColor&&(ee=S.instanceColor)),ee!==void 0){let re=ee.normalized,ue=ee.itemSize,ge=e.get(ee);if(ge===void 0)continue;let ie=ge.buffer,Se=ge.type,me=ge.bytesPerElement,k=Se===i.INT||Se===i.UNSIGNED_INT||ee.gpuType===Lo;if(ee.isInterleavedBufferAttribute){let oe=ee.data,xe=oe.stride,Fe=ee.offset;if(oe.isInstancedInterleavedBuffer){for(let be=0;be<Z.locationSize;be++)d(Z.location+be,oe.meshPerAttribute);S.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=oe.meshPerAttribute*oe.count)}else for(let be=0;be<Z.locationSize;be++)m(Z.location+be);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let be=0;be<Z.locationSize;be++)v(Z.location+be,ue/Z.locationSize,Se,re,xe*me,(Fe+ue/Z.locationSize*be)*me,k)}else{if(ee.isInstancedBufferAttribute){for(let oe=0;oe<Z.locationSize;oe++)d(Z.location+oe,ee.meshPerAttribute);S.isInstancedMesh!==!0&&J._maxInstanceCount===void 0&&(J._maxInstanceCount=ee.meshPerAttribute*ee.count)}else for(let oe=0;oe<Z.locationSize;oe++)m(Z.location+oe);i.bindBuffer(i.ARRAY_BUFFER,ie);for(let oe=0;oe<Z.locationSize;oe++)v(Z.location+oe,ue/Z.locationSize,Se,re,ue*me,ue/Z.locationSize*oe*me,k)}}else if(q!==void 0){let re=q[ae];if(re!==void 0)switch(re.length){case 2:i.vertexAttrib2fv(Z.location,re);break;case 3:i.vertexAttrib3fv(Z.location,re);break;case 4:i.vertexAttrib4fv(Z.location,re);break;default:i.vertexAttrib1fv(Z.location,re)}}}}M()}function P(){O();for(let S in n){let U=n[S];for(let W in U){let J=U[W];for(let H in J)h(J[H].object),delete J[H];delete U[W]}delete n[S]}}function A(S){if(n[S.id]===void 0)return;let U=n[S.id];for(let W in U){let J=U[W];for(let H in J)h(J[H].object),delete J[H];delete U[W]}delete n[S.id]}function C(S){for(let U in n){let W=n[U];if(W[S.id]===void 0)continue;let J=W[S.id];for(let H in J)h(J[H].object),delete J[H];delete W[S.id]}}function O(){w(),o=!0,r!==s&&(r=s,c(r.object))}function w(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:a,reset:O,resetDefaultState:w,dispose:P,releaseStatesOfGeometry:A,releaseStatesOfProgram:C,initAttributes:_,enableAttribute:m,disableUnusedAttributes:M}}function Gm(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(i.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let p=0;for(let g=0;g<u;g++)p+=h[g];t.update(p,n,1)}function l(c,h,u,f){if(u===0)return;let p=e.get("WEBGL_multi_draw");if(p===null)for(let g=0;g<c.length;g++)o(c[g],h[g],f[g]);else{p.multiDrawArraysInstancedWEBGL(n,c,0,h,0,f,0,u);let g=0;for(let _=0;_<u;_++)g+=h[_]*f[_];t.update(g,n,1)}}this.setMode=s,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function Wm(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let C=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function o(C){return!(C!==cn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(C){let O=C===ls&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(C!==Fn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==Tn&&!O)}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);let u=t.logarithmicDepthBuffer===!0,f=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),p=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),g=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),d=i.getParameter(i.MAX_VERTEX_ATTRIBS),M=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),v=i.getParameter(i.MAX_VARYING_VECTORS),x=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),P=g>0,A=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:f,maxTextures:p,maxVertexTextures:g,maxTextureSize:_,maxCubemapSize:m,maxAttributes:d,maxVertexUniforms:M,maxVaryings:v,maxFragmentUniforms:x,vertexTextures:P,maxSamples:A}}function Xm(i){let e=this,t=null,n=0,s=!1,r=!1,o=new Cn,a=new $e,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,f){let p=u.length!==0||f||n!==0||s;return s=f,n=u.length,p},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,f){t=h(u,f,0)},this.setState=function(u,f,p){let g=u.clippingPlanes,_=u.clipIntersection,m=u.clipShadows,d=i.get(u);if(!s||g===null||g.length===0||r&&!m)r?h(null):c();else{let M=r?0:n,v=M*4,x=d.clippingState||null;l.value=x,x=h(g,f,v,p);for(let P=0;P!==v;++P)x[P]=t[P];d.clippingState=x,this.numIntersection=_?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,f,p,g){let _=u!==null?u.length:0,m=null;if(_!==0){if(m=l.value,g!==!0||m===null){let d=p+_*4,M=f.matrixWorldInverse;a.getNormalMatrix(M),(m===null||m.length<d)&&(m=new Float32Array(d));for(let v=0,x=p;v!==_;++v,x+=4)o.copy(u[v]).applyMatrix4(M,a),o.normal.toArray(m,x),m[x+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=_,e.numIntersection=0,m}}function qm(i){let e=new WeakMap;function t(o,a){return a===Io?o.mapping=Ei:a===Po&&(o.mapping=wi),o}function n(o){if(o&&o.isTexture){let a=o.mapping;if(a===Io||a===Po)if(e.has(o)){let l=e.get(o).texture;return t(l,o.mapping)}else{let l=o.image;if(l&&l.height>0){let c=new io(l.height);return c.fromEquirectangularTexture(i,o),e.set(o,c),o.addEventListener("dispose",s),t(c.texture,o.mapping)}else return null}}return o}function s(o){let a=o.target;a.removeEventListener("dispose",s);let l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}var fs=4,Lh=[.125,.215,.35,.446,.526,.582],Ii=20,Bc=new as,Uh=new qe,zc=null,kc=0,Hc=0,Vc=!1,Ci=(1+Math.sqrt(5))/2,ds=1/Ci,Fh=[new I(-Ci,ds,0),new I(Ci,ds,0),new I(-ds,0,Ci),new I(ds,0,Ci),new I(0,Ci,-ds),new I(0,Ci,ds),new I(-1,1,-1),new I(1,1,-1),new I(-1,1,1),new I(1,1,1)],Ym=new I,ga=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,s=100,r={}){let{size:o=256,position:a=Ym}=r;zc=this._renderer.getRenderTarget(),kc=this._renderer.getActiveCubeFace(),Hc=this._renderer.getActiveMipmapLevel(),Vc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bh(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Oh(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(zc,kc,Hc),this._renderer.xr.enabled=Vc,e.scissorTest=!1,pa(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ei||e.mapping===wi?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),zc=this._renderer.getRenderTarget(),kc=this._renderer.getActiveCubeFace(),Hc=this._renderer.getActiveMipmapLevel(),Vc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:Sn,minFilter:Sn,generateMipmaps:!1,type:ls,format:cn,colorSpace:yi,depthBuffer:!1},s=Nh(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Nh(e,t,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Zm(r)),this._blurMaterial=$m(r,e,t)}return s}_compileMaterial(e){let t=new Et(this._lodPlanes[0],e);this._renderer.compile(t,Bc)}_sceneToCubeUV(e,t,n,s,r){let l=new Jt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,f=u.autoClear,p=u.toneMapping;u.getClearColor(Uh),u.toneMapping=wn,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(s),u.clearDepth(),u.setRenderTarget(null));let _=new Gt({name:"PMREM.Background",side:Zt,depthWrite:!1,depthTest:!1}),m=new Et(new ns,_),d=!1,M=e.background;M?M.isColor&&(_.color.copy(M),e.background=null,d=!0):(_.color.copy(Uh),d=!0);for(let v=0;v<6;v++){let x=v%3;x===0?(l.up.set(0,c[v],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[v],r.y,r.z)):x===1?(l.up.set(0,0,c[v]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[v],r.z)):(l.up.set(0,c[v],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[v]));let P=this._cubeSize;pa(s,x*P,v>2?P:0,P,P),u.setRenderTarget(s),d&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=p,u.autoClear=f,e.background=M}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Ei||e.mapping===wi;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bh()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Oh());let r=s?this._cubemapMaterial:this._equirectMaterial,o=new Et(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;let l=this._cubeSize;pa(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,Bc)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Fh[(s-r-1)%Fh.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,s,r){let o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,s,"latitudinal",r),this._halfBlur(o,e,n,n,s,"longitudinal",r)}_halfBlur(e,t,n,s,r,o,a){let l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let h=3,u=new Et(this._lodPlanes[s],c),f=c.uniforms,p=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*p):2*Math.PI/(2*Ii-1),_=r/g,m=isFinite(r)?1+Math.floor(h*_):Ii;m>Ii&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Ii}`);let d=[],M=0;for(let C=0;C<Ii;++C){let O=C/_,w=Math.exp(-O*O/2);d.push(w),C===0?M+=w:C<m&&(M+=2*w)}for(let C=0;C<d.length;C++)d[C]=d[C]/M;f.envMap.value=e.texture,f.samples.value=m,f.weights.value=d,f.latitudinal.value=o==="latitudinal",a&&(f.poleAxis.value=a);let{_lodMax:v}=this;f.dTheta.value=g,f.mipInt.value=v-n;let x=this._sizeLods[s],P=3*x*(s>v-fs?s-v+fs:0),A=4*(this._cubeSize-x);pa(t,P,A,3*x,2*x),l.setRenderTarget(t),l.render(u,Bc)}};function Zm(i){let e=[],t=[],n=[],s=i,r=i-fs+1+Lh.length;for(let o=0;o<r;o++){let a=Math.pow(2,s);t.push(a);let l=1/a;o>i-fs?l=Lh[o-i+fs-1]:o===0&&(l=0),n.push(l);let c=1/(a-2),h=-c,u=1+c,f=[h,h,u,h,u,u,h,h,u,u,h,u],p=6,g=6,_=3,m=2,d=1,M=new Float32Array(_*g*p),v=new Float32Array(m*g*p),x=new Float32Array(d*g*p);for(let A=0;A<p;A++){let C=A%3*2/3-1,O=A>2?0:-1,w=[C,O,0,C+2/3,O,0,C+2/3,O+1,0,C,O,0,C+2/3,O+1,0,C,O+1,0];M.set(w,_*g*A),v.set(f,m*g*A);let S=[A,A,A,A,A,A];x.set(S,d*g*A)}let P=new It;P.setAttribute("position",new sn(M,_)),P.setAttribute("uv",new sn(v,m)),P.setAttribute("faceIndex",new sn(x,d)),e.push(P),s>fs&&s--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Nh(i,e,t){let n=new In(i,e,t);return n.texture.mapping=or,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function pa(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function $m(i,e,t){let n=new Float32Array(Ii),s=new I(0,1,0);return new En({name:"SphericalGaussianBlur",defines:{n:Ii,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Qc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:qn,depthTest:!1,depthWrite:!1})}function Oh(){return new En({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Qc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:qn,depthTest:!1,depthWrite:!1})}function Bh(){return new En({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Qc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:qn,depthTest:!1,depthWrite:!1})}function Qc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Jm(i){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){let l=a.mapping,c=l===Io||l===Po,h=l===Ei||l===wi;if(c||h){let u=e.get(a),f=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==f)return t===null&&(t=new ga(i)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{let p=a.image;return c&&p&&p.height>0||h&&p&&s(p)?(t===null&&(t=new ga(i)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function s(a){let l=0,c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){let l=a.target;l.removeEventListener("dispose",r);let c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Km(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&es("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Qm(i,e,t,n){let s={},r=new WeakMap;function o(u){let f=u.target;f.index!==null&&e.remove(f.index);for(let g in f.attributes)e.remove(f.attributes[g]);f.removeEventListener("dispose",o),delete s[f.id];let p=r.get(f);p&&(e.remove(p),r.delete(f)),n.releaseStatesOfGeometry(f),f.isInstancedBufferGeometry===!0&&delete f._maxInstanceCount,t.memory.geometries--}function a(u,f){return s[f.id]===!0||(f.addEventListener("dispose",o),s[f.id]=!0,t.memory.geometries++),f}function l(u){let f=u.attributes;for(let p in f)e.update(f[p],i.ARRAY_BUFFER)}function c(u){let f=[],p=u.index,g=u.attributes.position,_=0;if(p!==null){let M=p.array;_=p.version;for(let v=0,x=M.length;v<x;v+=3){let P=M[v+0],A=M[v+1],C=M[v+2];f.push(P,A,A,C,C,P)}}else if(g!==void 0){let M=g.array;_=g.version;for(let v=0,x=M.length/3-1;v<x;v+=3){let P=v+0,A=v+1,C=v+2;f.push(P,A,A,C,C,P)}}else return;let m=new(Dc(f)?Hs:Wn)(f,1);m.version=_;let d=r.get(u);d&&e.remove(d),r.set(u,m)}function h(u){let f=r.get(u);if(f){let p=u.index;p!==null&&f.version<p.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function jm(i,e,t){let n;function s(f){n=f}let r,o;function a(f){r=f.type,o=f.bytesPerElement}function l(f,p){i.drawElements(n,p,r,f*o),t.update(p,n,1)}function c(f,p,g){g!==0&&(i.drawElementsInstanced(n,p,r,f*o,g),t.update(p,n,g))}function h(f,p,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,p,0,r,f,0,g);let m=0;for(let d=0;d<g;d++)m+=p[d];t.update(m,n,1)}function u(f,p,g,_){if(g===0)return;let m=e.get("WEBGL_multi_draw");if(m===null)for(let d=0;d<f.length;d++)c(f[d]/o,p[d],_[d]);else{m.multiDrawElementsInstancedWEBGL(n,p,0,r,f,0,_,0,g);let d=0;for(let M=0;M<g;M++)d+=p[M]*_[M];t.update(d,n,1)}}this.setMode=s,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function eg(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case i.TRIANGLES:t.triangles+=a*(r/3);break;case i.LINES:t.lines+=a*(r/2);break;case i.LINE_STRIP:t.lines+=a*(r-1);break;case i.LINE_LOOP:t.lines+=a*r;break;case i.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function tg(i,e,t){let n=new WeakMap,s=new yt;function r(o,a,l){let c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0,f=n.get(a);if(f===void 0||f.count!==u){let w=function(){C.dispose(),n.delete(a),a.removeEventListener("dispose",w)};f!==void 0&&f.texture.dispose();let p=a.morphAttributes.position!==void 0,g=a.morphAttributes.normal!==void 0,_=a.morphAttributes.color!==void 0,m=a.morphAttributes.position||[],d=a.morphAttributes.normal||[],M=a.morphAttributes.color||[],v=0;p===!0&&(v=1),g===!0&&(v=2),_===!0&&(v=3);let x=a.attributes.position.count*v,P=1;x>e.maxTextureSize&&(P=Math.ceil(x/e.maxTextureSize),x=e.maxTextureSize);let A=new Float32Array(x*P*4*u),C=new Bs(A,x,P,u);C.type=Tn,C.needsUpdate=!0;let O=v*4;for(let S=0;S<u;S++){let U=m[S],W=d[S],J=M[S],H=x*P*4*S;for(let z=0;z<U.count;z++){let q=z*O;p===!0&&(s.fromBufferAttribute(U,z),A[H+q+0]=s.x,A[H+q+1]=s.y,A[H+q+2]=s.z,A[H+q+3]=0),g===!0&&(s.fromBufferAttribute(W,z),A[H+q+4]=s.x,A[H+q+5]=s.y,A[H+q+6]=s.z,A[H+q+7]=0),_===!0&&(s.fromBufferAttribute(J,z),A[H+q+8]=s.x,A[H+q+9]=s.y,A[H+q+10]=s.z,A[H+q+11]=J.itemSize===4?s.w:1)}}f={count:u,texture:C,size:new Ue(x,P)},n.set(a,f),a.addEventListener("dispose",w)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",o.morphTexture,t);else{let p=0;for(let _=0;_<c.length;_++)p+=c[_];let g=a.morphTargetsRelative?1:1-p;l.getUniforms().setValue(i,"morphTargetBaseInfluence",g),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",f.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",f.size)}return{update:r}}function ng(i,e,t,n){let s=new WeakMap;function r(l){let c=n.render.frame,h=l.geometry,u=e.get(l,h);if(s.get(u)!==c&&(e.update(u),s.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),s.get(l)!==c&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let f=l.skeleton;s.get(f)!==c&&(f.update(),s.set(f,c))}return u}function o(){s=new WeakMap}function a(l){let c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}var iu=new Yt,zh=new Ys(1,1),su=new Bs,ru=new to,ou=new Gs,kh=[],Hh=[],Vh=new Float32Array(16),Gh=new Float32Array(9),Wh=new Float32Array(4);function ms(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=kh[s];if(r===void 0&&(r=new Float32Array(s),kh[s]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,i[o].toArray(r,a)}return r}function Ft(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function Nt(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function xa(i,e){let t=Hh[e];t===void 0&&(t=new Int32Array(e),Hh[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function ig(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function sg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;i.uniform2fv(this.addr,e),Nt(t,e)}}function rg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ft(t,e))return;i.uniform3fv(this.addr,e),Nt(t,e)}}function og(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;i.uniform4fv(this.addr,e),Nt(t,e)}}function ag(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),Nt(t,e)}else{if(Ft(t,n))return;Wh.set(n),i.uniformMatrix2fv(this.addr,!1,Wh),Nt(t,n)}}function cg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),Nt(t,e)}else{if(Ft(t,n))return;Gh.set(n),i.uniformMatrix3fv(this.addr,!1,Gh),Nt(t,n)}}function lg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),Nt(t,e)}else{if(Ft(t,n))return;Vh.set(n),i.uniformMatrix4fv(this.addr,!1,Vh),Nt(t,n)}}function hg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function ug(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;i.uniform2iv(this.addr,e),Nt(t,e)}}function dg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ft(t,e))return;i.uniform3iv(this.addr,e),Nt(t,e)}}function fg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;i.uniform4iv(this.addr,e),Nt(t,e)}}function pg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function mg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;i.uniform2uiv(this.addr,e),Nt(t,e)}}function gg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ft(t,e))return;i.uniform3uiv(this.addr,e),Nt(t,e)}}function _g(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;i.uniform4uiv(this.addr,e),Nt(t,e)}}function xg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(zh.compareFunction=Cc,r=zh):r=iu,t.setTexture2D(e||r,s)}function yg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||ru,s)}function vg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||ou,s)}function Mg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||su,s)}function Sg(i){switch(i){case 5126:return ig;case 35664:return sg;case 35665:return rg;case 35666:return og;case 35674:return ag;case 35675:return cg;case 35676:return lg;case 5124:case 35670:return hg;case 35667:case 35671:return ug;case 35668:case 35672:return dg;case 35669:case 35673:return fg;case 5125:return pg;case 36294:return mg;case 36295:return gg;case 36296:return _g;case 35678:case 36198:case 36298:case 36306:case 35682:return xg;case 35679:case 36299:case 36307:return yg;case 35680:case 36300:case 36308:case 36293:return vg;case 36289:case 36303:case 36311:case 36292:return Mg}}function bg(i,e){i.uniform1fv(this.addr,e)}function Eg(i,e){let t=ms(e,this.size,2);i.uniform2fv(this.addr,t)}function wg(i,e){let t=ms(e,this.size,3);i.uniform3fv(this.addr,t)}function Tg(i,e){let t=ms(e,this.size,4);i.uniform4fv(this.addr,t)}function Ag(i,e){let t=ms(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function Rg(i,e){let t=ms(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function Cg(i,e){let t=ms(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function Ig(i,e){i.uniform1iv(this.addr,e)}function Pg(i,e){i.uniform2iv(this.addr,e)}function Dg(i,e){i.uniform3iv(this.addr,e)}function Lg(i,e){i.uniform4iv(this.addr,e)}function Ug(i,e){i.uniform1uiv(this.addr,e)}function Fg(i,e){i.uniform2uiv(this.addr,e)}function Ng(i,e){i.uniform3uiv(this.addr,e)}function Og(i,e){i.uniform4uiv(this.addr,e)}function Bg(i,e,t){let n=this.cache,s=e.length,r=xa(t,s);Ft(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let o=0;o!==s;++o)t.setTexture2D(e[o]||iu,r[o])}function zg(i,e,t){let n=this.cache,s=e.length,r=xa(t,s);Ft(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let o=0;o!==s;++o)t.setTexture3D(e[o]||ru,r[o])}function kg(i,e,t){let n=this.cache,s=e.length,r=xa(t,s);Ft(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let o=0;o!==s;++o)t.setTextureCube(e[o]||ou,r[o])}function Hg(i,e,t){let n=this.cache,s=e.length,r=xa(t,s);Ft(n,r)||(i.uniform1iv(this.addr,r),Nt(n,r));for(let o=0;o!==s;++o)t.setTexture2DArray(e[o]||su,r[o])}function Vg(i){switch(i){case 5126:return bg;case 35664:return Eg;case 35665:return wg;case 35666:return Tg;case 35674:return Ag;case 35675:return Rg;case 35676:return Cg;case 5124:case 35670:return Ig;case 35667:case 35671:return Pg;case 35668:case 35672:return Dg;case 35669:case 35673:return Lg;case 5125:return Ug;case 36294:return Fg;case 36295:return Ng;case 36296:return Og;case 35678:case 36198:case 36298:case 36306:case 35682:return Bg;case 35679:case 36299:case 36307:return zg;case 35680:case 36300:case 36308:case 36293:return kg;case 36289:case 36303:case 36311:case 36292:return Hg}}var Wc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=Sg(t.type)}},Xc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Vg(t.type)}},qc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,o=s.length;r!==o;++r){let a=s[r];a.setValue(e,t[a.id],n)}}},Gc=/(\w+)(\])?(\[|\.)?/g;function Xh(i,e){i.seq.push(e),i.map[e.id]=e}function Gg(i,e,t){let n=i.name,s=n.length;for(Gc.lastIndex=0;;){let r=Gc.exec(n),o=Gc.lastIndex,a=r[1],l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===s){Xh(t,c===void 0?new Wc(a,i,e):new Xc(a,i,e));break}else{let u=t.map[a];u===void 0&&(u=new qc(a),Xh(t,u)),t=u}}}var ps=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=e.getActiveUniform(t,s),o=e.getUniformLocation(t,r.name);Gg(r,o,this)}}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,o=t.length;r!==o;++r){let a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let o=e[s];o.id in t&&n.push(o)}return n}};function qh(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var Wg=37297,Xg=0;function qg(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=s;o<r;o++){let a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}var Yh=new $e;function Yg(i){rt._getMatrix(Yh,rt.workingColorSpace,i);let e=`mat3( ${Yh.elements.map(t=>t.toFixed(4))} )`;switch(rt.getTransfer(i)){case Ns:return[e,"LinearTransferOETF"];case ht:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Zh(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let o=/ERROR: 0:(\d+)/.exec(r);if(o){let a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+qg(i.getShaderSource(e),a)}else return r}function Zg(i,e){let t=Yg(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function $g(i,e){let t;switch(e){case rh:t="Linear";break;case oh:t="Reinhard";break;case ah:t="Cineon";break;case ch:t="ACESFilmic";break;case hh:t="AgX";break;case uh:t="Neutral";break;case lh:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ma=new I;function Jg(){rt.getLuminanceCoefficients(ma);let i=ma.x.toFixed(4),e=ma.y.toFixed(4),t=ma.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Kg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(dr).join(`
`)}function Qg(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function jg(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),o=r.name,a=1;r.type===i.FLOAT_MAT2&&(a=2),r.type===i.FLOAT_MAT3&&(a=3),r.type===i.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:i.getAttribLocation(e,o),locationSize:a}}return t}function dr(i){return i!==""}function $h(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function Jh(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var e0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Yc(i){return i.replace(e0,n0)}var t0=new Map;function n0(i,e){let t=Ke[e];if(t===void 0){let n=t0.get(e);if(n!==void 0)t=Ke[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return Yc(t)}var i0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Kh(i){return i.replace(i0,s0)}function s0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Qh(i){let e=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function r0(i){let e="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===pc?e="SHADOWMAP_TYPE_PCF":i.shadowMapType===Bl?e="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Un&&(e="SHADOWMAP_TYPE_VSM"),e}function o0(i){let e="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ei:case wi:e="ENVMAP_TYPE_CUBE";break;case or:e="ENVMAP_TYPE_CUBE_UV";break}return e}function a0(i){let e="ENVMAP_MODE_REFLECTION";return i.envMap&&i.envMapMode===wi&&(e="ENVMAP_MODE_REFRACTION"),e}function c0(i){let e="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case xc:e="ENVMAP_BLENDING_MULTIPLY";break;case ih:e="ENVMAP_BLENDING_MIX";break;case sh:e="ENVMAP_BLENDING_ADD";break}return e}function l0(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function h0(i,e,t,n){let s=i.getContext(),r=t.defines,o=t.vertexShader,a=t.fragmentShader,l=r0(t),c=o0(t),h=a0(t),u=c0(t),f=l0(t),p=Kg(t),g=Qg(r),_=s.createProgram(),m,d,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(dr).join(`
`),m.length>0&&(m+=`
`),d=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(dr).join(`
`),d.length>0&&(d+=`
`)):(m=[Qh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(dr).join(`
`),d=[Qh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",f?"#define CUBEUV_TEXEL_WIDTH "+f.texelWidth:"",f?"#define CUBEUV_TEXEL_HEIGHT "+f.texelHeight:"",f?"#define CUBEUV_MAX_MIP "+f.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==wn?"#define TONE_MAPPING":"",t.toneMapping!==wn?Ke.tonemapping_pars_fragment:"",t.toneMapping!==wn?$g("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Ke.colorspace_pars_fragment,Zg("linearToOutputTexel",t.outputColorSpace),Jg(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(dr).join(`
`)),o=Yc(o),o=$h(o,t),o=Jh(o,t),a=Yc(a),a=$h(a,t),a=Jh(a,t),o=Kh(o),a=Kh(a),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[p,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,d=["#define varying in",t.glslVersion===Ic?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Ic?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+d);let v=M+m+o,x=M+d+a,P=qh(s,s.VERTEX_SHADER,v),A=qh(s,s.FRAGMENT_SHADER,x);s.attachShader(_,P),s.attachShader(_,A),t.index0AttributeName!==void 0?s.bindAttribLocation(_,0,t.index0AttributeName):t.morphTargets===!0&&s.bindAttribLocation(_,0,"position"),s.linkProgram(_);function C(U){if(i.debug.checkShaderErrors){let W=s.getProgramInfoLog(_)||"",J=s.getShaderInfoLog(P)||"",H=s.getShaderInfoLog(A)||"",z=W.trim(),q=J.trim(),ae=H.trim(),Z=!0,ee=!0;if(s.getProgramParameter(_,s.LINK_STATUS)===!1)if(Z=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,_,P,A);else{let re=Zh(s,P,"vertex"),ue=Zh(s,A,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(_,s.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+z+`
`+re+`
`+ue)}else z!==""?console.warn("THREE.WebGLProgram: Program Info Log:",z):(q===""||ae==="")&&(ee=!1);ee&&(U.diagnostics={runnable:Z,programLog:z,vertexShader:{log:q,prefix:m},fragmentShader:{log:ae,prefix:d}})}s.deleteShader(P),s.deleteShader(A),O=new ps(s,_),w=jg(s,_)}let O;this.getUniforms=function(){return O===void 0&&C(this),O};let w;this.getAttributes=function(){return w===void 0&&C(this),w};let S=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return S===!1&&(S=s.getProgramParameter(_,Wg)),S},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(_),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=Xg++,this.cacheKey=e,this.usedTimes=1,this.program=_,this.vertexShader=P,this.fragmentShader=A,this}var u0=0,Zc=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){let t=e.vertexShader,n=e.fragmentShader,s=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(s)===!1&&(o.add(s),s.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new $c(e),t.set(e,n)),n}},$c=class{constructor(e){this.id=u0++,this.code=e,this.usedTimes=0}};function d0(i,e,t,n,s,r,o){let a=new ks,l=new Zc,c=new Set,h=[],u=s.logarithmicDepthBuffer,f=s.vertexTextures,p=s.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function _(w){return c.add(w),w===0?"uv":`uv${w}`}function m(w,S,U,W,J){let H=W.fog,z=J.geometry,q=w.isMeshStandardMaterial?W.environment:null,ae=(w.isMeshStandardMaterial?t:e).get(w.envMap||q),Z=ae&&ae.mapping===or?ae.image.height:null,ee=g[w.type];w.precision!==null&&(p=s.getMaxPrecision(w.precision),p!==w.precision&&console.warn("THREE.WebGLProgram.getParameters:",w.precision,"not supported, using",p,"instead."));let re=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,ue=re!==void 0?re.length:0,ge=0;z.morphAttributes.position!==void 0&&(ge=1),z.morphAttributes.normal!==void 0&&(ge=2),z.morphAttributes.color!==void 0&&(ge=3);let ie,Se,me,k;if(ee){let Ce=Nn[ee];ie=Ce.vertexShader,Se=Ce.fragmentShader}else ie=w.vertexShader,Se=w.fragmentShader,l.update(w),me=l.getVertexShaderID(w),k=l.getFragmentShaderID(w);let oe=i.getRenderTarget(),xe=i.state.buffers.depth.getReversed(),Fe=J.isInstancedMesh===!0,be=J.isBatchedMesh===!0,Be=!!w.map,Ye=!!w.matcap,D=!!ae,it=!!w.aoMap,ye=!!w.lightMap,Te=!!w.bumpMap,Ae=!!w.normalMap,tt=!!w.displacementMap,we=!!w.emissiveMap,Ze=!!w.metalnessMap,gt=!!w.roughnessMap,dt=w.anisotropy>0,R=w.clearcoat>0,y=w.dispersion>0,$=w.iridescence>0,te=w.sheen>0,ce=w.transmission>0,ne=dt&&!!w.anisotropyMap,Ne=R&&!!w.clearcoatMap,fe=R&&!!w.clearcoatNormalMap,De=R&&!!w.clearcoatRoughnessMap,Le=$&&!!w.iridescenceMap,le=$&&!!w.iridescenceThicknessMap,ve=te&&!!w.sheenColorMap,ke=te&&!!w.sheenRoughnessMap,N=!!w.specularMap,T=!!w.specularColorMap,L=!!w.specularIntensityMap,b=ce&&!!w.transmissionMap,F=ce&&!!w.thicknessMap,B=!!w.gradientMap,K=!!w.alphaMap,X=w.alphaTest>0,Y=!!w.alphaHash,se=!!w.extensions,he=wn;w.toneMapped&&(oe===null||oe.isXRRenderTarget===!0)&&(he=i.toneMapping);let _e={shaderID:ee,shaderType:w.type,shaderName:w.name,vertexShader:ie,fragmentShader:Se,defines:w.defines,customVertexShaderID:me,customFragmentShaderID:k,isRawShaderMaterial:w.isRawShaderMaterial===!0,glslVersion:w.glslVersion,precision:p,batching:be,batchingColor:be&&J._colorsTexture!==null,instancing:Fe,instancingColor:Fe&&J.instanceColor!==null,instancingMorph:Fe&&J.morphTexture!==null,supportsVertexTextures:f,outputColorSpace:oe===null?i.outputColorSpace:oe.isXRRenderTarget===!0?oe.texture.colorSpace:yi,alphaToCoverage:!!w.alphaToCoverage,map:Be,matcap:Ye,envMap:D,envMapMode:D&&ae.mapping,envMapCubeUVHeight:Z,aoMap:it,lightMap:ye,bumpMap:Te,normalMap:Ae,displacementMap:f&&tt,emissiveMap:we,normalMapObjectSpace:Ae&&w.normalMapType===gh,normalMapTangentSpace:Ae&&w.normalMapType===Rc,metalnessMap:Ze,roughnessMap:gt,anisotropy:dt,anisotropyMap:ne,clearcoat:R,clearcoatMap:Ne,clearcoatNormalMap:fe,clearcoatRoughnessMap:De,dispersion:y,iridescence:$,iridescenceMap:Le,iridescenceThicknessMap:le,sheen:te,sheenColorMap:ve,sheenRoughnessMap:ke,specularMap:N,specularColorMap:T,specularIntensityMap:L,transmission:ce,transmissionMap:b,thicknessMap:F,gradientMap:B,opaque:w.transparent===!1&&w.blending===_i&&w.alphaToCoverage===!1,alphaMap:K,alphaTest:X,alphaHash:Y,combine:w.combine,mapUv:Be&&_(w.map.channel),aoMapUv:it&&_(w.aoMap.channel),lightMapUv:ye&&_(w.lightMap.channel),bumpMapUv:Te&&_(w.bumpMap.channel),normalMapUv:Ae&&_(w.normalMap.channel),displacementMapUv:tt&&_(w.displacementMap.channel),emissiveMapUv:we&&_(w.emissiveMap.channel),metalnessMapUv:Ze&&_(w.metalnessMap.channel),roughnessMapUv:gt&&_(w.roughnessMap.channel),anisotropyMapUv:ne&&_(w.anisotropyMap.channel),clearcoatMapUv:Ne&&_(w.clearcoatMap.channel),clearcoatNormalMapUv:fe&&_(w.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:De&&_(w.clearcoatRoughnessMap.channel),iridescenceMapUv:Le&&_(w.iridescenceMap.channel),iridescenceThicknessMapUv:le&&_(w.iridescenceThicknessMap.channel),sheenColorMapUv:ve&&_(w.sheenColorMap.channel),sheenRoughnessMapUv:ke&&_(w.sheenRoughnessMap.channel),specularMapUv:N&&_(w.specularMap.channel),specularColorMapUv:T&&_(w.specularColorMap.channel),specularIntensityMapUv:L&&_(w.specularIntensityMap.channel),transmissionMapUv:b&&_(w.transmissionMap.channel),thicknessMapUv:F&&_(w.thicknessMap.channel),alphaMapUv:K&&_(w.alphaMap.channel),vertexTangents:!!z.attributes.tangent&&(Ae||dt),vertexColors:w.vertexColors,vertexAlphas:w.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,pointsUvs:J.isPoints===!0&&!!z.attributes.uv&&(Be||K),fog:!!H,useFog:w.fog===!0,fogExp2:!!H&&H.isFogExp2,flatShading:w.flatShading===!0&&w.wireframe===!1,sizeAttenuation:w.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:xe,skinning:J.isSkinnedMesh===!0,morphTargets:z.morphAttributes.position!==void 0,morphNormals:z.morphAttributes.normal!==void 0,morphColors:z.morphAttributes.color!==void 0,morphTargetsCount:ue,morphTextureStride:ge,numDirLights:S.directional.length,numPointLights:S.point.length,numSpotLights:S.spot.length,numSpotLightMaps:S.spotLightMap.length,numRectAreaLights:S.rectArea.length,numHemiLights:S.hemi.length,numDirLightShadows:S.directionalShadowMap.length,numPointLightShadows:S.pointShadowMap.length,numSpotLightShadows:S.spotShadowMap.length,numSpotLightShadowsWithMaps:S.numSpotLightShadowsWithMaps,numLightProbes:S.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:w.dithering,shadowMapEnabled:i.shadowMap.enabled&&U.length>0,shadowMapType:i.shadowMap.type,toneMapping:he,decodeVideoTexture:Be&&w.map.isVideoTexture===!0&&rt.getTransfer(w.map.colorSpace)===ht,decodeVideoTextureEmissive:we&&w.emissiveMap.isVideoTexture===!0&&rt.getTransfer(w.emissiveMap.colorSpace)===ht,premultipliedAlpha:w.premultipliedAlpha,doubleSided:w.side===Pt,flipSided:w.side===Zt,useDepthPacking:w.depthPacking>=0,depthPacking:w.depthPacking||0,index0AttributeName:w.index0AttributeName,extensionClipCullDistance:se&&w.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(se&&w.extensions.multiDraw===!0||be)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:w.customProgramCacheKey()};return _e.vertexUv1s=c.has(1),_e.vertexUv2s=c.has(2),_e.vertexUv3s=c.has(3),c.clear(),_e}function d(w){let S=[];if(w.shaderID?S.push(w.shaderID):(S.push(w.customVertexShaderID),S.push(w.customFragmentShaderID)),w.defines!==void 0)for(let U in w.defines)S.push(U),S.push(w.defines[U]);return w.isRawShaderMaterial===!1&&(M(S,w),v(S,w),S.push(i.outputColorSpace)),S.push(w.customProgramCacheKey),S.join()}function M(w,S){w.push(S.precision),w.push(S.outputColorSpace),w.push(S.envMapMode),w.push(S.envMapCubeUVHeight),w.push(S.mapUv),w.push(S.alphaMapUv),w.push(S.lightMapUv),w.push(S.aoMapUv),w.push(S.bumpMapUv),w.push(S.normalMapUv),w.push(S.displacementMapUv),w.push(S.emissiveMapUv),w.push(S.metalnessMapUv),w.push(S.roughnessMapUv),w.push(S.anisotropyMapUv),w.push(S.clearcoatMapUv),w.push(S.clearcoatNormalMapUv),w.push(S.clearcoatRoughnessMapUv),w.push(S.iridescenceMapUv),w.push(S.iridescenceThicknessMapUv),w.push(S.sheenColorMapUv),w.push(S.sheenRoughnessMapUv),w.push(S.specularMapUv),w.push(S.specularColorMapUv),w.push(S.specularIntensityMapUv),w.push(S.transmissionMapUv),w.push(S.thicknessMapUv),w.push(S.combine),w.push(S.fogExp2),w.push(S.sizeAttenuation),w.push(S.morphTargetsCount),w.push(S.morphAttributeCount),w.push(S.numDirLights),w.push(S.numPointLights),w.push(S.numSpotLights),w.push(S.numSpotLightMaps),w.push(S.numHemiLights),w.push(S.numRectAreaLights),w.push(S.numDirLightShadows),w.push(S.numPointLightShadows),w.push(S.numSpotLightShadows),w.push(S.numSpotLightShadowsWithMaps),w.push(S.numLightProbes),w.push(S.shadowMapType),w.push(S.toneMapping),w.push(S.numClippingPlanes),w.push(S.numClipIntersection),w.push(S.depthPacking)}function v(w,S){a.disableAll(),S.supportsVertexTextures&&a.enable(0),S.instancing&&a.enable(1),S.instancingColor&&a.enable(2),S.instancingMorph&&a.enable(3),S.matcap&&a.enable(4),S.envMap&&a.enable(5),S.normalMapObjectSpace&&a.enable(6),S.normalMapTangentSpace&&a.enable(7),S.clearcoat&&a.enable(8),S.iridescence&&a.enable(9),S.alphaTest&&a.enable(10),S.vertexColors&&a.enable(11),S.vertexAlphas&&a.enable(12),S.vertexUv1s&&a.enable(13),S.vertexUv2s&&a.enable(14),S.vertexUv3s&&a.enable(15),S.vertexTangents&&a.enable(16),S.anisotropy&&a.enable(17),S.alphaHash&&a.enable(18),S.batching&&a.enable(19),S.dispersion&&a.enable(20),S.batchingColor&&a.enable(21),S.gradientMap&&a.enable(22),w.push(a.mask),a.disableAll(),S.fog&&a.enable(0),S.useFog&&a.enable(1),S.flatShading&&a.enable(2),S.logarithmicDepthBuffer&&a.enable(3),S.reversedDepthBuffer&&a.enable(4),S.skinning&&a.enable(5),S.morphTargets&&a.enable(6),S.morphNormals&&a.enable(7),S.morphColors&&a.enable(8),S.premultipliedAlpha&&a.enable(9),S.shadowMapEnabled&&a.enable(10),S.doubleSided&&a.enable(11),S.flipSided&&a.enable(12),S.useDepthPacking&&a.enable(13),S.dithering&&a.enable(14),S.transmission&&a.enable(15),S.sheen&&a.enable(16),S.opaque&&a.enable(17),S.pointsUvs&&a.enable(18),S.decodeVideoTexture&&a.enable(19),S.decodeVideoTextureEmissive&&a.enable(20),S.alphaToCoverage&&a.enable(21),w.push(a.mask)}function x(w){let S=g[w.type],U;if(S){let W=Nn[S];U=Ah.clone(W.uniforms)}else U=w.uniforms;return U}function P(w,S){let U;for(let W=0,J=h.length;W<J;W++){let H=h[W];if(H.cacheKey===S){U=H,++U.usedTimes;break}}return U===void 0&&(U=new h0(i,S,w,r),h.push(U)),U}function A(w){if(--w.usedTimes===0){let S=h.indexOf(w);h[S]=h[h.length-1],h.pop(),w.destroy()}}function C(w){l.remove(w)}function O(){l.dispose()}return{getParameters:m,getProgramCacheKey:d,getUniforms:x,acquireProgram:P,releaseProgram:A,releaseShaderCache:C,programs:h,dispose:O}}function f0(){let i=new WeakMap;function e(o){return i.has(o)}function t(o){let a=i.get(o);return a===void 0&&(a={},i.set(o,a)),a}function n(o){i.delete(o)}function s(o,a,l){i.get(o)[a]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function p0(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.z!==e.z?i.z-e.z:i.id-e.id}function jh(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function eu(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function o(u,f,p,g,_,m){let d=i[e];return d===void 0?(d={id:u.id,object:u,geometry:f,material:p,groupOrder:g,renderOrder:u.renderOrder,z:_,group:m},i[e]=d):(d.id=u.id,d.object=u,d.geometry=f,d.material=p,d.groupOrder=g,d.renderOrder=u.renderOrder,d.z=_,d.group=m),e++,d}function a(u,f,p,g,_,m){let d=o(u,f,p,g,_,m);p.transmission>0?n.push(d):p.transparent===!0?s.push(d):t.push(d)}function l(u,f,p,g,_,m){let d=o(u,f,p,g,_,m);p.transmission>0?n.unshift(d):p.transparent===!0?s.unshift(d):t.unshift(d)}function c(u,f){t.length>1&&t.sort(u||p0),n.length>1&&n.sort(f||jh),s.length>1&&s.sort(f||jh)}function h(){for(let u=e,f=i.length;u<f;u++){let p=i[u];if(p.id===null)break;p.id=null,p.object=null,p.geometry=null,p.material=null,p.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:a,unshift:l,finish:h,sort:c}}function m0(){let i=new WeakMap;function e(n,s){let r=i.get(n),o;return r===void 0?(o=new eu,i.set(n,[o])):s>=r.length?(o=new eu,r.push(o)):o=r[s],o}function t(){i=new WeakMap}return{get:e,dispose:t}}function g0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new I,color:new qe};break;case"SpotLight":t={position:new I,direction:new I,color:new qe,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new I,color:new qe,distance:0,decay:0};break;case"HemisphereLight":t={direction:new I,skyColor:new qe,groundColor:new qe};break;case"RectAreaLight":t={color:new qe,position:new I,halfWidth:new I,halfHeight:new I};break}return i[e.id]=t,t}}}function _0(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ue,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var x0=0;function y0(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function v0(i){let e=new g0,t=_0(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new I);let s=new I,r=new ot,o=new ot;function a(c){let h=0,u=0,f=0;for(let w=0;w<9;w++)n.probe[w].set(0,0,0);let p=0,g=0,_=0,m=0,d=0,M=0,v=0,x=0,P=0,A=0,C=0;c.sort(y0);for(let w=0,S=c.length;w<S;w++){let U=c[w],W=U.color,J=U.intensity,H=U.distance,z=U.shadow&&U.shadow.map?U.shadow.map.texture:null;if(U.isAmbientLight)h+=W.r*J,u+=W.g*J,f+=W.b*J;else if(U.isLightProbe){for(let q=0;q<9;q++)n.probe[q].addScaledVector(U.sh.coefficients[q],J);C++}else if(U.isDirectionalLight){let q=e.get(U);if(q.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){let ae=U.shadow,Z=t.get(U);Z.shadowIntensity=ae.intensity,Z.shadowBias=ae.bias,Z.shadowNormalBias=ae.normalBias,Z.shadowRadius=ae.radius,Z.shadowMapSize=ae.mapSize,n.directionalShadow[p]=Z,n.directionalShadowMap[p]=z,n.directionalShadowMatrix[p]=U.shadow.matrix,M++}n.directional[p]=q,p++}else if(U.isSpotLight){let q=e.get(U);q.position.setFromMatrixPosition(U.matrixWorld),q.color.copy(W).multiplyScalar(J),q.distance=H,q.coneCos=Math.cos(U.angle),q.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),q.decay=U.decay,n.spot[_]=q;let ae=U.shadow;if(U.map&&(n.spotLightMap[P]=U.map,P++,ae.updateMatrices(U),U.castShadow&&A++),n.spotLightMatrix[_]=ae.matrix,U.castShadow){let Z=t.get(U);Z.shadowIntensity=ae.intensity,Z.shadowBias=ae.bias,Z.shadowNormalBias=ae.normalBias,Z.shadowRadius=ae.radius,Z.shadowMapSize=ae.mapSize,n.spotShadow[_]=Z,n.spotShadowMap[_]=z,x++}_++}else if(U.isRectAreaLight){let q=e.get(U);q.color.copy(W).multiplyScalar(J),q.halfWidth.set(U.width*.5,0,0),q.halfHeight.set(0,U.height*.5,0),n.rectArea[m]=q,m++}else if(U.isPointLight){let q=e.get(U);if(q.color.copy(U.color).multiplyScalar(U.intensity),q.distance=U.distance,q.decay=U.decay,U.castShadow){let ae=U.shadow,Z=t.get(U);Z.shadowIntensity=ae.intensity,Z.shadowBias=ae.bias,Z.shadowNormalBias=ae.normalBias,Z.shadowRadius=ae.radius,Z.shadowMapSize=ae.mapSize,Z.shadowCameraNear=ae.camera.near,Z.shadowCameraFar=ae.camera.far,n.pointShadow[g]=Z,n.pointShadowMap[g]=z,n.pointShadowMatrix[g]=U.shadow.matrix,v++}n.point[g]=q,g++}else if(U.isHemisphereLight){let q=e.get(U);q.skyColor.copy(U.color).multiplyScalar(J),q.groundColor.copy(U.groundColor).multiplyScalar(J),n.hemi[d]=q,d++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Me.LTC_FLOAT_1,n.rectAreaLTC2=Me.LTC_FLOAT_2):(n.rectAreaLTC1=Me.LTC_HALF_1,n.rectAreaLTC2=Me.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=f;let O=n.hash;(O.directionalLength!==p||O.pointLength!==g||O.spotLength!==_||O.rectAreaLength!==m||O.hemiLength!==d||O.numDirectionalShadows!==M||O.numPointShadows!==v||O.numSpotShadows!==x||O.numSpotMaps!==P||O.numLightProbes!==C)&&(n.directional.length=p,n.spot.length=_,n.rectArea.length=m,n.point.length=g,n.hemi.length=d,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=v,n.pointShadowMap.length=v,n.spotShadow.length=x,n.spotShadowMap.length=x,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=v,n.spotLightMatrix.length=x+P-A,n.spotLightMap.length=P,n.numSpotLightShadowsWithMaps=A,n.numLightProbes=C,O.directionalLength=p,O.pointLength=g,O.spotLength=_,O.rectAreaLength=m,O.hemiLength=d,O.numDirectionalShadows=M,O.numPointShadows=v,O.numSpotShadows=x,O.numSpotMaps=P,O.numLightProbes=C,n.version=x0++)}function l(c,h){let u=0,f=0,p=0,g=0,_=0,m=h.matrixWorldInverse;for(let d=0,M=c.length;d<M;d++){let v=c[d];if(v.isDirectionalLight){let x=n.directional[u];x.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(m),u++}else if(v.isSpotLight){let x=n.spot[p];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(m),x.direction.setFromMatrixPosition(v.matrixWorld),s.setFromMatrixPosition(v.target.matrixWorld),x.direction.sub(s),x.direction.transformDirection(m),p++}else if(v.isRectAreaLight){let x=n.rectArea[g];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(m),o.identity(),r.copy(v.matrixWorld),r.premultiply(m),o.extractRotation(r),x.halfWidth.set(v.width*.5,0,0),x.halfHeight.set(0,v.height*.5,0),x.halfWidth.applyMatrix4(o),x.halfHeight.applyMatrix4(o),g++}else if(v.isPointLight){let x=n.point[f];x.position.setFromMatrixPosition(v.matrixWorld),x.position.applyMatrix4(m),f++}else if(v.isHemisphereLight){let x=n.hemi[_];x.direction.setFromMatrixPosition(v.matrixWorld),x.direction.transformDirection(m),_++}}}return{setup:a,setupView:l,state:n}}function tu(i){let e=new v0(i),t=[],n=[];function s(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}let c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function M0(i){let e=new WeakMap;function t(s,r=0){let o=e.get(s),a;return o===void 0?(a=new tu(i),e.set(s,[a])):r>=o.length?(a=new tu(i),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}var S0=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,b0=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function E0(i,e,t){let n=new qs,s=new Ue,r=new Ue,o=new yt,a=new ho({depthPacking:mh}),l=new uo,c={},h=t.maxTextureSize,u={[Kt]:Zt,[Zt]:Kt,[Pt]:Pt},f=new En({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ue},radius:{value:4}},vertexShader:S0,fragmentShader:b0}),p=f.clone();p.defines.HORIZONTAL_PASS=1;let g=new It;g.setAttribute("position",new sn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let _=new Et(g,f),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=pc;let d=this.type;this.render=function(A,C,O){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||A.length===0)return;let w=i.getRenderTarget(),S=i.getActiveCubeFace(),U=i.getActiveMipmapLevel(),W=i.state;W.setBlending(qn),W.buffers.depth.getReversed()===!0?W.buffers.color.setClear(0,0,0,0):W.buffers.color.setClear(1,1,1,1),W.buffers.depth.setTest(!0),W.setScissorTest(!1);let J=d!==Un&&this.type===Un,H=d===Un&&this.type!==Un;for(let z=0,q=A.length;z<q;z++){let ae=A[z],Z=ae.shadow;if(Z===void 0){console.warn("THREE.WebGLShadowMap:",ae,"has no shadow.");continue}if(Z.autoUpdate===!1&&Z.needsUpdate===!1)continue;s.copy(Z.mapSize);let ee=Z.getFrameExtents();if(s.multiply(ee),r.copy(Z.mapSize),(s.x>h||s.y>h)&&(s.x>h&&(r.x=Math.floor(h/ee.x),s.x=r.x*ee.x,Z.mapSize.x=r.x),s.y>h&&(r.y=Math.floor(h/ee.y),s.y=r.y*ee.y,Z.mapSize.y=r.y)),Z.map===null||J===!0||H===!0){let ue=this.type!==Un?{minFilter:Qt,magFilter:Qt}:{};Z.map!==null&&Z.map.dispose(),Z.map=new In(s.x,s.y,ue),Z.map.texture.name=ae.name+".shadowMap",Z.camera.updateProjectionMatrix()}i.setRenderTarget(Z.map),i.clear();let re=Z.getViewportCount();for(let ue=0;ue<re;ue++){let ge=Z.getViewport(ue);o.set(r.x*ge.x,r.y*ge.y,r.x*ge.z,r.y*ge.w),W.viewport(o),Z.updateMatrices(ae,ue),n=Z.getFrustum(),x(C,O,Z.camera,ae,this.type)}Z.isPointLightShadow!==!0&&this.type===Un&&M(Z,O),Z.needsUpdate=!1}d=this.type,m.needsUpdate=!1,i.setRenderTarget(w,S,U)};function M(A,C){let O=e.update(_);f.defines.VSM_SAMPLES!==A.blurSamples&&(f.defines.VSM_SAMPLES=A.blurSamples,p.defines.VSM_SAMPLES=A.blurSamples,f.needsUpdate=!0,p.needsUpdate=!0),A.mapPass===null&&(A.mapPass=new In(s.x,s.y)),f.uniforms.shadow_pass.value=A.map.texture,f.uniforms.resolution.value=A.mapSize,f.uniforms.radius.value=A.radius,i.setRenderTarget(A.mapPass),i.clear(),i.renderBufferDirect(C,null,O,f,_,null),p.uniforms.shadow_pass.value=A.mapPass.texture,p.uniforms.resolution.value=A.mapSize,p.uniforms.radius.value=A.radius,i.setRenderTarget(A.map),i.clear(),i.renderBufferDirect(C,null,O,p,_,null)}function v(A,C,O,w){let S=null,U=O.isPointLight===!0?A.customDistanceMaterial:A.customDepthMaterial;if(U!==void 0)S=U;else if(S=O.isPointLight===!0?l:a,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let W=S.uuid,J=C.uuid,H=c[W];H===void 0&&(H={},c[W]=H);let z=H[J];z===void 0&&(z=S.clone(),H[J]=z,C.addEventListener("dispose",P)),S=z}if(S.visible=C.visible,S.wireframe=C.wireframe,w===Un?S.side=C.shadowSide!==null?C.shadowSide:C.side:S.side=C.shadowSide!==null?C.shadowSide:u[C.side],S.alphaMap=C.alphaMap,S.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,S.map=C.map,S.clipShadows=C.clipShadows,S.clippingPlanes=C.clippingPlanes,S.clipIntersection=C.clipIntersection,S.displacementMap=C.displacementMap,S.displacementScale=C.displacementScale,S.displacementBias=C.displacementBias,S.wireframeLinewidth=C.wireframeLinewidth,S.linewidth=C.linewidth,O.isPointLight===!0&&S.isMeshDistanceMaterial===!0){let W=i.properties.get(S);W.light=O}return S}function x(A,C,O,w,S){if(A.visible===!1)return;if(A.layers.test(C.layers)&&(A.isMesh||A.isLine||A.isPoints)&&(A.castShadow||A.receiveShadow&&S===Un)&&(!A.frustumCulled||n.intersectsObject(A))){A.modelViewMatrix.multiplyMatrices(O.matrixWorldInverse,A.matrixWorld);let J=e.update(A),H=A.material;if(Array.isArray(H)){let z=J.groups;for(let q=0,ae=z.length;q<ae;q++){let Z=z[q],ee=H[Z.materialIndex];if(ee&&ee.visible){let re=v(A,ee,w,S);A.onBeforeShadow(i,A,C,O,J,re,Z),i.renderBufferDirect(O,null,J,re,A,Z),A.onAfterShadow(i,A,C,O,J,re,Z)}}}else if(H.visible){let z=v(A,H,w,S);A.onBeforeShadow(i,A,C,O,J,z,null),i.renderBufferDirect(O,null,J,z,A,null),A.onAfterShadow(i,A,C,O,J,z,null)}}let W=A.children;for(let J=0,H=W.length;J<H;J++)x(W[J],C,O,w,S)}function P(A){A.target.removeEventListener("dispose",P);for(let O in c){let w=c[O],S=A.target.uuid;S in w&&(w[S].dispose(),delete w[S])}}}var w0={[bo]:Eo,[wo]:Ro,[To]:Co,[xi]:Ao,[Eo]:bo,[Ro]:wo,[Co]:To,[Ao]:xi};function T0(i,e){function t(){let b=!1,F=new yt,B=null,K=new yt(0,0,0,0);return{setMask:function(X){B!==X&&!b&&(i.colorMask(X,X,X,X),B=X)},setLocked:function(X){b=X},setClear:function(X,Y,se,he,_e){_e===!0&&(X*=he,Y*=he,se*=he),F.set(X,Y,se,he),K.equals(F)===!1&&(i.clearColor(X,Y,se,he),K.copy(F))},reset:function(){b=!1,B=null,K.set(-1,0,0,0)}}}function n(){let b=!1,F=!1,B=null,K=null,X=null;return{setReversed:function(Y){if(F!==Y){let se=e.get("EXT_clip_control");Y?se.clipControlEXT(se.LOWER_LEFT_EXT,se.ZERO_TO_ONE_EXT):se.clipControlEXT(se.LOWER_LEFT_EXT,se.NEGATIVE_ONE_TO_ONE_EXT),F=Y;let he=X;X=null,this.setClear(he)}},getReversed:function(){return F},setTest:function(Y){Y?oe(i.DEPTH_TEST):xe(i.DEPTH_TEST)},setMask:function(Y){B!==Y&&!b&&(i.depthMask(Y),B=Y)},setFunc:function(Y){if(F&&(Y=w0[Y]),K!==Y){switch(Y){case bo:i.depthFunc(i.NEVER);break;case Eo:i.depthFunc(i.ALWAYS);break;case wo:i.depthFunc(i.LESS);break;case xi:i.depthFunc(i.LEQUAL);break;case To:i.depthFunc(i.EQUAL);break;case Ao:i.depthFunc(i.GEQUAL);break;case Ro:i.depthFunc(i.GREATER);break;case Co:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}K=Y}},setLocked:function(Y){b=Y},setClear:function(Y){X!==Y&&(F&&(Y=1-Y),i.clearDepth(Y),X=Y)},reset:function(){b=!1,B=null,K=null,X=null,F=!1}}}function s(){let b=!1,F=null,B=null,K=null,X=null,Y=null,se=null,he=null,_e=null;return{setTest:function(Ce){b||(Ce?oe(i.STENCIL_TEST):xe(i.STENCIL_TEST))},setMask:function(Ce){F!==Ce&&!b&&(i.stencilMask(Ce),F=Ce)},setFunc:function(Ce,Ie,pe){(B!==Ce||K!==Ie||X!==pe)&&(i.stencilFunc(Ce,Ie,pe),B=Ce,K=Ie,X=pe)},setOp:function(Ce,Ie,pe){(Y!==Ce||se!==Ie||he!==pe)&&(i.stencilOp(Ce,Ie,pe),Y=Ce,se=Ie,he=pe)},setLocked:function(Ce){b=Ce},setClear:function(Ce){_e!==Ce&&(i.clearStencil(Ce),_e=Ce)},reset:function(){b=!1,F=null,B=null,K=null,X=null,Y=null,se=null,he=null,_e=null}}}let r=new t,o=new n,a=new s,l=new WeakMap,c=new WeakMap,h={},u={},f=new WeakMap,p=[],g=null,_=!1,m=null,d=null,M=null,v=null,x=null,P=null,A=null,C=new qe(0,0,0),O=0,w=!1,S=null,U=null,W=null,J=null,H=null,z=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),q=!1,ae=0,Z=i.getParameter(i.VERSION);Z.indexOf("WebGL")!==-1?(ae=parseFloat(/^WebGL (\d)/.exec(Z)[1]),q=ae>=1):Z.indexOf("OpenGL ES")!==-1&&(ae=parseFloat(/^OpenGL ES (\d)/.exec(Z)[1]),q=ae>=2);let ee=null,re={},ue=i.getParameter(i.SCISSOR_BOX),ge=i.getParameter(i.VIEWPORT),ie=new yt().fromArray(ue),Se=new yt().fromArray(ge);function me(b,F,B,K){let X=new Uint8Array(4),Y=i.createTexture();i.bindTexture(b,Y),i.texParameteri(b,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(b,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let se=0;se<B;se++)b===i.TEXTURE_3D||b===i.TEXTURE_2D_ARRAY?i.texImage3D(F,0,i.RGBA,1,1,K,0,i.RGBA,i.UNSIGNED_BYTE,X):i.texImage2D(F+se,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,X);return Y}let k={};k[i.TEXTURE_2D]=me(i.TEXTURE_2D,i.TEXTURE_2D,1),k[i.TEXTURE_CUBE_MAP]=me(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),k[i.TEXTURE_2D_ARRAY]=me(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),k[i.TEXTURE_3D]=me(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),oe(i.DEPTH_TEST),o.setFunc(xi),Te(!1),Ae(fc),oe(i.CULL_FACE),it(qn);function oe(b){h[b]!==!0&&(i.enable(b),h[b]=!0)}function xe(b){h[b]!==!1&&(i.disable(b),h[b]=!1)}function Fe(b,F){return u[b]!==F?(i.bindFramebuffer(b,F),u[b]=F,b===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=F),b===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=F),!0):!1}function be(b,F){let B=p,K=!1;if(b){B=f.get(F),B===void 0&&(B=[],f.set(F,B));let X=b.textures;if(B.length!==X.length||B[0]!==i.COLOR_ATTACHMENT0){for(let Y=0,se=X.length;Y<se;Y++)B[Y]=i.COLOR_ATTACHMENT0+Y;B.length=X.length,K=!0}}else B[0]!==i.BACK&&(B[0]=i.BACK,K=!0);K&&i.drawBuffers(B)}function Be(b){return g!==b?(i.useProgram(b),g=b,!0):!1}let Ye={[ii]:i.FUNC_ADD,[kl]:i.FUNC_SUBTRACT,[Hl]:i.FUNC_REVERSE_SUBTRACT};Ye[Vl]=i.MIN,Ye[Gl]=i.MAX;let D={[Wl]:i.ZERO,[Xl]:i.ONE,[ql]:i.SRC_COLOR,[Zr]:i.SRC_ALPHA,[Ql]:i.SRC_ALPHA_SATURATE,[Jl]:i.DST_COLOR,[Zl]:i.DST_ALPHA,[Yl]:i.ONE_MINUS_SRC_COLOR,[$r]:i.ONE_MINUS_SRC_ALPHA,[Kl]:i.ONE_MINUS_DST_COLOR,[$l]:i.ONE_MINUS_DST_ALPHA,[jl]:i.CONSTANT_COLOR,[eh]:i.ONE_MINUS_CONSTANT_COLOR,[th]:i.CONSTANT_ALPHA,[nh]:i.ONE_MINUS_CONSTANT_ALPHA};function it(b,F,B,K,X,Y,se,he,_e,Ce){if(b===qn){_===!0&&(xe(i.BLEND),_=!1);return}if(_===!1&&(oe(i.BLEND),_=!0),b!==zl){if(b!==m||Ce!==w){if((d!==ii||x!==ii)&&(i.blendEquation(i.FUNC_ADD),d=ii,x=ii),Ce)switch(b){case _i:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case mc:i.blendFunc(i.ONE,i.ONE);break;case gc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case _c:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",b);break}else switch(b){case _i:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case mc:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case gc:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case _c:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",b);break}M=null,v=null,P=null,A=null,C.set(0,0,0),O=0,m=b,w=Ce}return}X=X||F,Y=Y||B,se=se||K,(F!==d||X!==x)&&(i.blendEquationSeparate(Ye[F],Ye[X]),d=F,x=X),(B!==M||K!==v||Y!==P||se!==A)&&(i.blendFuncSeparate(D[B],D[K],D[Y],D[se]),M=B,v=K,P=Y,A=se),(he.equals(C)===!1||_e!==O)&&(i.blendColor(he.r,he.g,he.b,_e),C.copy(he),O=_e),m=b,w=!1}function ye(b,F){b.side===Pt?xe(i.CULL_FACE):oe(i.CULL_FACE);let B=b.side===Zt;F&&(B=!B),Te(B),b.blending===_i&&b.transparent===!1?it(qn):it(b.blending,b.blendEquation,b.blendSrc,b.blendDst,b.blendEquationAlpha,b.blendSrcAlpha,b.blendDstAlpha,b.blendColor,b.blendAlpha,b.premultipliedAlpha),o.setFunc(b.depthFunc),o.setTest(b.depthTest),o.setMask(b.depthWrite),r.setMask(b.colorWrite);let K=b.stencilWrite;a.setTest(K),K&&(a.setMask(b.stencilWriteMask),a.setFunc(b.stencilFunc,b.stencilRef,b.stencilFuncMask),a.setOp(b.stencilFail,b.stencilZFail,b.stencilZPass)),we(b.polygonOffset,b.polygonOffsetFactor,b.polygonOffsetUnits),b.alphaToCoverage===!0?oe(i.SAMPLE_ALPHA_TO_COVERAGE):xe(i.SAMPLE_ALPHA_TO_COVERAGE)}function Te(b){S!==b&&(b?i.frontFace(i.CW):i.frontFace(i.CCW),S=b)}function Ae(b){b!==Nl?(oe(i.CULL_FACE),b!==U&&(b===fc?i.cullFace(i.BACK):b===Ol?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):xe(i.CULL_FACE),U=b}function tt(b){b!==W&&(q&&i.lineWidth(b),W=b)}function we(b,F,B){b?(oe(i.POLYGON_OFFSET_FILL),(J!==F||H!==B)&&(i.polygonOffset(F,B),J=F,H=B)):xe(i.POLYGON_OFFSET_FILL)}function Ze(b){b?oe(i.SCISSOR_TEST):xe(i.SCISSOR_TEST)}function gt(b){b===void 0&&(b=i.TEXTURE0+z-1),ee!==b&&(i.activeTexture(b),ee=b)}function dt(b,F,B){B===void 0&&(ee===null?B=i.TEXTURE0+z-1:B=ee);let K=re[B];K===void 0&&(K={type:void 0,texture:void 0},re[B]=K),(K.type!==b||K.texture!==F)&&(ee!==B&&(i.activeTexture(B),ee=B),i.bindTexture(b,F||k[b]),K.type=b,K.texture=F)}function R(){let b=re[ee];b!==void 0&&b.type!==void 0&&(i.bindTexture(b.type,null),b.type=void 0,b.texture=void 0)}function y(){try{i.compressedTexImage2D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function $(){try{i.compressedTexImage3D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function te(){try{i.texSubImage2D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ce(){try{i.texSubImage3D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ne(){try{i.compressedTexSubImage2D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Ne(){try{i.compressedTexSubImage3D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function fe(){try{i.texStorage2D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function De(){try{i.texStorage3D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function Le(){try{i.texImage2D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function le(){try{i.texImage3D(...arguments)}catch(b){console.error("THREE.WebGLState:",b)}}function ve(b){ie.equals(b)===!1&&(i.scissor(b.x,b.y,b.z,b.w),ie.copy(b))}function ke(b){Se.equals(b)===!1&&(i.viewport(b.x,b.y,b.z,b.w),Se.copy(b))}function N(b,F){let B=c.get(F);B===void 0&&(B=new WeakMap,c.set(F,B));let K=B.get(b);K===void 0&&(K=i.getUniformBlockIndex(F,b.name),B.set(b,K))}function T(b,F){let K=c.get(F).get(b);l.get(F)!==K&&(i.uniformBlockBinding(F,K,b.__bindingPointIndex),l.set(F,K))}function L(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),o.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),h={},ee=null,re={},u={},f=new WeakMap,p=[],g=null,_=!1,m=null,d=null,M=null,v=null,x=null,P=null,A=null,C=new qe(0,0,0),O=0,w=!1,S=null,U=null,W=null,J=null,H=null,ie.set(0,0,i.canvas.width,i.canvas.height),Se.set(0,0,i.canvas.width,i.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:oe,disable:xe,bindFramebuffer:Fe,drawBuffers:be,useProgram:Be,setBlending:it,setMaterial:ye,setFlipSided:Te,setCullFace:Ae,setLineWidth:tt,setPolygonOffset:we,setScissorTest:Ze,activeTexture:gt,bindTexture:dt,unbindTexture:R,compressedTexImage2D:y,compressedTexImage3D:$,texImage2D:Le,texImage3D:le,updateUBOMapping:N,uniformBlockBinding:T,texStorage2D:fe,texStorage3D:De,texSubImage2D:te,texSubImage3D:ce,compressedTexSubImage2D:ne,compressedTexSubImage3D:Ne,scissor:ve,viewport:ke,reset:L}}function A0(i,e,t,n,s,r,o){let a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Ue,h=new WeakMap,u,f=new WeakMap,p=!1;try{p=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(R,y){return p?new OffscreenCanvas(R,y):ji("canvas")}function _(R,y,$){let te=1,ce=dt(R);if((ce.width>$||ce.height>$)&&(te=$/Math.max(ce.width,ce.height)),te<1)if(typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&R instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&R instanceof ImageBitmap||typeof VideoFrame<"u"&&R instanceof VideoFrame){let ne=Math.floor(te*ce.width),Ne=Math.floor(te*ce.height);u===void 0&&(u=g(ne,Ne));let fe=y?g(ne,Ne):u;return fe.width=ne,fe.height=Ne,fe.getContext("2d").drawImage(R,0,0,ne,Ne),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+ce.width+"x"+ce.height+") to ("+ne+"x"+Ne+")."),fe}else return"data"in R&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+ce.width+"x"+ce.height+")."),R;return R}function m(R){return R.generateMipmaps}function d(R){i.generateMipmap(R)}function M(R){return R.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:R.isWebGL3DRenderTarget?i.TEXTURE_3D:R.isWebGLArrayRenderTarget||R.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function v(R,y,$,te,ce=!1){if(R!==null){if(i[R]!==void 0)return i[R];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+R+"'")}let ne=y;if(y===i.RED&&($===i.FLOAT&&(ne=i.R32F),$===i.HALF_FLOAT&&(ne=i.R16F),$===i.UNSIGNED_BYTE&&(ne=i.R8)),y===i.RED_INTEGER&&($===i.UNSIGNED_BYTE&&(ne=i.R8UI),$===i.UNSIGNED_SHORT&&(ne=i.R16UI),$===i.UNSIGNED_INT&&(ne=i.R32UI),$===i.BYTE&&(ne=i.R8I),$===i.SHORT&&(ne=i.R16I),$===i.INT&&(ne=i.R32I)),y===i.RG&&($===i.FLOAT&&(ne=i.RG32F),$===i.HALF_FLOAT&&(ne=i.RG16F),$===i.UNSIGNED_BYTE&&(ne=i.RG8)),y===i.RG_INTEGER&&($===i.UNSIGNED_BYTE&&(ne=i.RG8UI),$===i.UNSIGNED_SHORT&&(ne=i.RG16UI),$===i.UNSIGNED_INT&&(ne=i.RG32UI),$===i.BYTE&&(ne=i.RG8I),$===i.SHORT&&(ne=i.RG16I),$===i.INT&&(ne=i.RG32I)),y===i.RGB_INTEGER&&($===i.UNSIGNED_BYTE&&(ne=i.RGB8UI),$===i.UNSIGNED_SHORT&&(ne=i.RGB16UI),$===i.UNSIGNED_INT&&(ne=i.RGB32UI),$===i.BYTE&&(ne=i.RGB8I),$===i.SHORT&&(ne=i.RGB16I),$===i.INT&&(ne=i.RGB32I)),y===i.RGBA_INTEGER&&($===i.UNSIGNED_BYTE&&(ne=i.RGBA8UI),$===i.UNSIGNED_SHORT&&(ne=i.RGBA16UI),$===i.UNSIGNED_INT&&(ne=i.RGBA32UI),$===i.BYTE&&(ne=i.RGBA8I),$===i.SHORT&&(ne=i.RGBA16I),$===i.INT&&(ne=i.RGBA32I)),y===i.RGB&&($===i.UNSIGNED_INT_5_9_9_9_REV&&(ne=i.RGB9_E5),$===i.UNSIGNED_INT_10F_11F_11F_REV&&(ne=i.R11F_G11F_B10F)),y===i.RGBA){let Ne=ce?Ns:rt.getTransfer(te);$===i.FLOAT&&(ne=i.RGBA32F),$===i.HALF_FLOAT&&(ne=i.RGBA16F),$===i.UNSIGNED_BYTE&&(ne=Ne===ht?i.SRGB8_ALPHA8:i.RGBA8),$===i.UNSIGNED_SHORT_4_4_4_4&&(ne=i.RGBA4),$===i.UNSIGNED_SHORT_5_5_5_1&&(ne=i.RGB5_A1)}return(ne===i.R16F||ne===i.R32F||ne===i.RG16F||ne===i.RG32F||ne===i.RGBA16F||ne===i.RGBA32F)&&e.get("EXT_color_buffer_float"),ne}function x(R,y){let $;return R?y===null||y===ci||y===hs?$=i.DEPTH24_STENCIL8:y===Tn?$=i.DEPTH32F_STENCIL8:y===cs&&($=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===ci||y===hs?$=i.DEPTH_COMPONENT24:y===Tn?$=i.DEPTH_COMPONENT32F:y===cs&&($=i.DEPTH_COMPONENT16),$}function P(R,y){return m(R)===!0||R.isFramebufferTexture&&R.minFilter!==Qt&&R.minFilter!==Sn?Math.log2(Math.max(y.width,y.height))+1:R.mipmaps!==void 0&&R.mipmaps.length>0?R.mipmaps.length:R.isCompressedTexture&&Array.isArray(R.image)?y.mipmaps.length:1}function A(R){let y=R.target;y.removeEventListener("dispose",A),O(y),y.isVideoTexture&&h.delete(y)}function C(R){let y=R.target;y.removeEventListener("dispose",C),S(y)}function O(R){let y=n.get(R);if(y.__webglInit===void 0)return;let $=R.source,te=f.get($);if(te){let ce=te[y.__cacheKey];ce.usedTimes--,ce.usedTimes===0&&w(R),Object.keys(te).length===0&&f.delete($)}n.remove(R)}function w(R){let y=n.get(R);i.deleteTexture(y.__webglTexture);let $=R.source,te=f.get($);delete te[y.__cacheKey],o.memory.textures--}function S(R){let y=n.get(R);if(R.depthTexture&&(R.depthTexture.dispose(),n.remove(R.depthTexture)),R.isWebGLCubeRenderTarget)for(let te=0;te<6;te++){if(Array.isArray(y.__webglFramebuffer[te]))for(let ce=0;ce<y.__webglFramebuffer[te].length;ce++)i.deleteFramebuffer(y.__webglFramebuffer[te][ce]);else i.deleteFramebuffer(y.__webglFramebuffer[te]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[te])}else{if(Array.isArray(y.__webglFramebuffer))for(let te=0;te<y.__webglFramebuffer.length;te++)i.deleteFramebuffer(y.__webglFramebuffer[te]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let te=0;te<y.__webglColorRenderbuffer.length;te++)y.__webglColorRenderbuffer[te]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[te]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let $=R.textures;for(let te=0,ce=$.length;te<ce;te++){let ne=n.get($[te]);ne.__webglTexture&&(i.deleteTexture(ne.__webglTexture),o.memory.textures--),n.remove($[te])}n.remove(R)}let U=0;function W(){U=0}function J(){let R=U;return R>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+R+" texture units while this GPU supports only "+s.maxTextures),U+=1,R}function H(R){let y=[];return y.push(R.wrapS),y.push(R.wrapT),y.push(R.wrapR||0),y.push(R.magFilter),y.push(R.minFilter),y.push(R.anisotropy),y.push(R.internalFormat),y.push(R.format),y.push(R.type),y.push(R.generateMipmaps),y.push(R.premultiplyAlpha),y.push(R.flipY),y.push(R.unpackAlignment),y.push(R.colorSpace),y.join()}function z(R,y){let $=n.get(R);if(R.isVideoTexture&&Ze(R),R.isRenderTargetTexture===!1&&R.isExternalTexture!==!0&&R.version>0&&$.__version!==R.version){let te=R.image;if(te===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(te.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{k($,R,y);return}}else R.isExternalTexture&&($.__webglTexture=R.sourceTexture?R.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,$.__webglTexture,i.TEXTURE0+y)}function q(R,y){let $=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&$.__version!==R.version){k($,R,y);return}t.bindTexture(i.TEXTURE_2D_ARRAY,$.__webglTexture,i.TEXTURE0+y)}function ae(R,y){let $=n.get(R);if(R.isRenderTargetTexture===!1&&R.version>0&&$.__version!==R.version){k($,R,y);return}t.bindTexture(i.TEXTURE_3D,$.__webglTexture,i.TEXTURE0+y)}function Z(R,y){let $=n.get(R);if(R.version>0&&$.__version!==R.version){oe($,R,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture,i.TEXTURE0+y)}let ee={[Jr]:i.REPEAT,[ni]:i.CLAMP_TO_EDGE,[Kr]:i.MIRRORED_REPEAT},re={[Qt]:i.NEAREST,[fh]:i.NEAREST_MIPMAP_NEAREST,[ar]:i.NEAREST_MIPMAP_LINEAR,[Sn]:i.LINEAR,[Do]:i.LINEAR_MIPMAP_NEAREST,[ai]:i.LINEAR_MIPMAP_LINEAR},ue={[_h]:i.NEVER,[bh]:i.ALWAYS,[xh]:i.LESS,[Cc]:i.LEQUAL,[yh]:i.EQUAL,[Sh]:i.GEQUAL,[vh]:i.GREATER,[Mh]:i.NOTEQUAL};function ge(R,y){if(y.type===Tn&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===Sn||y.magFilter===Do||y.magFilter===ar||y.magFilter===ai||y.minFilter===Sn||y.minFilter===Do||y.minFilter===ar||y.minFilter===ai)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(R,i.TEXTURE_WRAP_S,ee[y.wrapS]),i.texParameteri(R,i.TEXTURE_WRAP_T,ee[y.wrapT]),(R===i.TEXTURE_3D||R===i.TEXTURE_2D_ARRAY)&&i.texParameteri(R,i.TEXTURE_WRAP_R,ee[y.wrapR]),i.texParameteri(R,i.TEXTURE_MAG_FILTER,re[y.magFilter]),i.texParameteri(R,i.TEXTURE_MIN_FILTER,re[y.minFilter]),y.compareFunction&&(i.texParameteri(R,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(R,i.TEXTURE_COMPARE_FUNC,ue[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===Qt||y.minFilter!==ar&&y.minFilter!==ai||y.type===Tn&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let $=e.get("EXT_texture_filter_anisotropic");i.texParameterf(R,$.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function ie(R,y){let $=!1;R.__webglInit===void 0&&(R.__webglInit=!0,y.addEventListener("dispose",A));let te=y.source,ce=f.get(te);ce===void 0&&(ce={},f.set(te,ce));let ne=H(y);if(ne!==R.__cacheKey){ce[ne]===void 0&&(ce[ne]={texture:i.createTexture(),usedTimes:0},o.memory.textures++,$=!0),ce[ne].usedTimes++;let Ne=ce[R.__cacheKey];Ne!==void 0&&(ce[R.__cacheKey].usedTimes--,Ne.usedTimes===0&&w(y)),R.__cacheKey=ne,R.__webglTexture=ce[ne].texture}return $}function Se(R,y,$){return Math.floor(Math.floor(R/$)/y)}function me(R,y,$,te){let ne=R.updateRanges;if(ne.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,$,te,y.data);else{ne.sort((le,ve)=>le.start-ve.start);let Ne=0;for(let le=1;le<ne.length;le++){let ve=ne[Ne],ke=ne[le],N=ve.start+ve.count,T=Se(ke.start,y.width,4),L=Se(ve.start,y.width,4);ke.start<=N+1&&T===L&&Se(ke.start+ke.count-1,y.width,4)===T?ve.count=Math.max(ve.count,ke.start+ke.count-ve.start):(++Ne,ne[Ne]=ke)}ne.length=Ne+1;let fe=i.getParameter(i.UNPACK_ROW_LENGTH),De=i.getParameter(i.UNPACK_SKIP_PIXELS),Le=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let le=0,ve=ne.length;le<ve;le++){let ke=ne[le],N=Math.floor(ke.start/4),T=Math.ceil(ke.count/4),L=N%y.width,b=Math.floor(N/y.width),F=T,B=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,L),i.pixelStorei(i.UNPACK_SKIP_ROWS,b),t.texSubImage2D(i.TEXTURE_2D,0,L,b,F,B,$,te,y.data)}R.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,fe),i.pixelStorei(i.UNPACK_SKIP_PIXELS,De),i.pixelStorei(i.UNPACK_SKIP_ROWS,Le)}}function k(R,y,$){let te=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(te=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(te=i.TEXTURE_3D);let ce=ie(R,y),ne=y.source;t.bindTexture(te,R.__webglTexture,i.TEXTURE0+$);let Ne=n.get(ne);if(ne.version!==Ne.__version||ce===!0){t.activeTexture(i.TEXTURE0+$);let fe=rt.getPrimaries(rt.workingColorSpace),De=y.colorSpace===Yn?null:rt.getPrimaries(y.colorSpace),Le=y.colorSpace===Yn||fe===De?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le);let le=_(y.image,!1,s.maxTextureSize);le=gt(y,le);let ve=r.convert(y.format,y.colorSpace),ke=r.convert(y.type),N=v(y.internalFormat,ve,ke,y.colorSpace,y.isVideoTexture);ge(te,y);let T,L=y.mipmaps,b=y.isVideoTexture!==!0,F=Ne.__version===void 0||ce===!0,B=ne.dataReady,K=P(y,le);if(y.isDepthTexture)N=x(y.format===us,y.type),F&&(b?t.texStorage2D(i.TEXTURE_2D,1,N,le.width,le.height):t.texImage2D(i.TEXTURE_2D,0,N,le.width,le.height,0,ve,ke,null));else if(y.isDataTexture)if(L.length>0){b&&F&&t.texStorage2D(i.TEXTURE_2D,K,N,L[0].width,L[0].height);for(let X=0,Y=L.length;X<Y;X++)T=L[X],b?B&&t.texSubImage2D(i.TEXTURE_2D,X,0,0,T.width,T.height,ve,ke,T.data):t.texImage2D(i.TEXTURE_2D,X,N,T.width,T.height,0,ve,ke,T.data);y.generateMipmaps=!1}else b?(F&&t.texStorage2D(i.TEXTURE_2D,K,N,le.width,le.height),B&&me(y,le,ve,ke)):t.texImage2D(i.TEXTURE_2D,0,N,le.width,le.height,0,ve,ke,le.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){b&&F&&t.texStorage3D(i.TEXTURE_2D_ARRAY,K,N,L[0].width,L[0].height,le.depth);for(let X=0,Y=L.length;X<Y;X++)if(T=L[X],y.format!==cn)if(ve!==null)if(b){if(B)if(y.layerUpdates.size>0){let se=Oc(T.width,T.height,y.format,y.type);for(let he of y.layerUpdates){let _e=T.data.subarray(he*se/T.data.BYTES_PER_ELEMENT,(he+1)*se/T.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,he,T.width,T.height,1,ve,_e)}y.clearLayerUpdates()}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,T.width,T.height,le.depth,ve,T.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,X,N,T.width,T.height,le.depth,0,T.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else b?B&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,X,0,0,0,T.width,T.height,le.depth,ve,ke,T.data):t.texImage3D(i.TEXTURE_2D_ARRAY,X,N,T.width,T.height,le.depth,0,ve,ke,T.data)}else{b&&F&&t.texStorage2D(i.TEXTURE_2D,K,N,L[0].width,L[0].height);for(let X=0,Y=L.length;X<Y;X++)T=L[X],y.format!==cn?ve!==null?b?B&&t.compressedTexSubImage2D(i.TEXTURE_2D,X,0,0,T.width,T.height,ve,T.data):t.compressedTexImage2D(i.TEXTURE_2D,X,N,T.width,T.height,0,T.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):b?B&&t.texSubImage2D(i.TEXTURE_2D,X,0,0,T.width,T.height,ve,ke,T.data):t.texImage2D(i.TEXTURE_2D,X,N,T.width,T.height,0,ve,ke,T.data)}else if(y.isDataArrayTexture)if(b){if(F&&t.texStorage3D(i.TEXTURE_2D_ARRAY,K,N,le.width,le.height,le.depth),B)if(y.layerUpdates.size>0){let X=Oc(le.width,le.height,y.format,y.type);for(let Y of y.layerUpdates){let se=le.data.subarray(Y*X/le.data.BYTES_PER_ELEMENT,(Y+1)*X/le.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Y,le.width,le.height,1,ve,ke,se)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,ve,ke,le.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,N,le.width,le.height,le.depth,0,ve,ke,le.data);else if(y.isData3DTexture)b?(F&&t.texStorage3D(i.TEXTURE_3D,K,N,le.width,le.height,le.depth),B&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,ve,ke,le.data)):t.texImage3D(i.TEXTURE_3D,0,N,le.width,le.height,le.depth,0,ve,ke,le.data);else if(y.isFramebufferTexture){if(F)if(b)t.texStorage2D(i.TEXTURE_2D,K,N,le.width,le.height);else{let X=le.width,Y=le.height;for(let se=0;se<K;se++)t.texImage2D(i.TEXTURE_2D,se,N,X,Y,0,ve,ke,null),X>>=1,Y>>=1}}else if(L.length>0){if(b&&F){let X=dt(L[0]);t.texStorage2D(i.TEXTURE_2D,K,N,X.width,X.height)}for(let X=0,Y=L.length;X<Y;X++)T=L[X],b?B&&t.texSubImage2D(i.TEXTURE_2D,X,0,0,ve,ke,T):t.texImage2D(i.TEXTURE_2D,X,N,ve,ke,T);y.generateMipmaps=!1}else if(b){if(F){let X=dt(le);t.texStorage2D(i.TEXTURE_2D,K,N,X.width,X.height)}B&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,ve,ke,le)}else t.texImage2D(i.TEXTURE_2D,0,N,ve,ke,le);m(y)&&d(te),Ne.__version=ne.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function oe(R,y,$){if(y.image.length!==6)return;let te=ie(R,y),ce=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,R.__webglTexture,i.TEXTURE0+$);let ne=n.get(ce);if(ce.version!==ne.__version||te===!0){t.activeTexture(i.TEXTURE0+$);let Ne=rt.getPrimaries(rt.workingColorSpace),fe=y.colorSpace===Yn?null:rt.getPrimaries(y.colorSpace),De=y.colorSpace===Yn||Ne===fe?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,De);let Le=y.isCompressedTexture||y.image[0].isCompressedTexture,le=y.image[0]&&y.image[0].isDataTexture,ve=[];for(let Y=0;Y<6;Y++)!Le&&!le?ve[Y]=_(y.image[Y],!0,s.maxCubemapSize):ve[Y]=le?y.image[Y].image:y.image[Y],ve[Y]=gt(y,ve[Y]);let ke=ve[0],N=r.convert(y.format,y.colorSpace),T=r.convert(y.type),L=v(y.internalFormat,N,T,y.colorSpace),b=y.isVideoTexture!==!0,F=ne.__version===void 0||te===!0,B=ce.dataReady,K=P(y,ke);ge(i.TEXTURE_CUBE_MAP,y);let X;if(Le){b&&F&&t.texStorage2D(i.TEXTURE_CUBE_MAP,K,L,ke.width,ke.height);for(let Y=0;Y<6;Y++){X=ve[Y].mipmaps;for(let se=0;se<X.length;se++){let he=X[se];y.format!==cn?N!==null?b?B&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,se,0,0,he.width,he.height,N,he.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,se,L,he.width,he.height,0,he.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):b?B&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,se,0,0,he.width,he.height,N,T,he.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,se,L,he.width,he.height,0,N,T,he.data)}}}else{if(X=y.mipmaps,b&&F){X.length>0&&K++;let Y=dt(ve[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,K,L,Y.width,Y.height)}for(let Y=0;Y<6;Y++)if(le){b?B&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,ve[Y].width,ve[Y].height,N,T,ve[Y].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,L,ve[Y].width,ve[Y].height,0,N,T,ve[Y].data);for(let se=0;se<X.length;se++){let _e=X[se].image[Y].image;b?B&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,se+1,0,0,_e.width,_e.height,N,T,_e.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,se+1,L,_e.width,_e.height,0,N,T,_e.data)}}else{b?B&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,0,0,N,T,ve[Y]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,0,L,N,T,ve[Y]);for(let se=0;se<X.length;se++){let he=X[se];b?B&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,se+1,0,0,N,T,he.image[Y]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Y,se+1,L,N,T,he.image[Y])}}}m(y)&&d(i.TEXTURE_CUBE_MAP),ne.__version=ce.version,y.onUpdate&&y.onUpdate(y)}R.__version=y.version}function xe(R,y,$,te,ce,ne){let Ne=r.convert($.format,$.colorSpace),fe=r.convert($.type),De=v($.internalFormat,Ne,fe,$.colorSpace),Le=n.get(y),le=n.get($);if(le.__renderTarget=y,!Le.__hasExternalTextures){let ve=Math.max(1,y.width>>ne),ke=Math.max(1,y.height>>ne);ce===i.TEXTURE_3D||ce===i.TEXTURE_2D_ARRAY?t.texImage3D(ce,ne,De,ve,ke,y.depth,0,Ne,fe,null):t.texImage2D(ce,ne,De,ve,ke,0,Ne,fe,null)}t.bindFramebuffer(i.FRAMEBUFFER,R),we(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,te,ce,le.__webglTexture,0,tt(y)):(ce===i.TEXTURE_2D||ce>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ce<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,te,ce,le.__webglTexture,ne),t.bindFramebuffer(i.FRAMEBUFFER,null)}function Fe(R,y,$){if(i.bindRenderbuffer(i.RENDERBUFFER,R),y.depthBuffer){let te=y.depthTexture,ce=te&&te.isDepthTexture?te.type:null,ne=x(y.stencilBuffer,ce),Ne=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,fe=tt(y);we(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,fe,ne,y.width,y.height):$?i.renderbufferStorageMultisample(i.RENDERBUFFER,fe,ne,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ne,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ne,i.RENDERBUFFER,R)}else{let te=y.textures;for(let ce=0;ce<te.length;ce++){let ne=te[ce],Ne=r.convert(ne.format,ne.colorSpace),fe=r.convert(ne.type),De=v(ne.internalFormat,Ne,fe,ne.colorSpace),Le=tt(y);$&&we(y)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Le,De,y.width,y.height):we(y)?a.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Le,De,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,De,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function be(R,y){if(y&&y.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(i.FRAMEBUFFER,R),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let te=n.get(y.depthTexture);te.__renderTarget=y,(!te.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),z(y.depthTexture,0);let ce=te.__webglTexture,ne=tt(y);if(y.depthTexture.format===Ki)we(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ce,0,ne):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,ce,0);else if(y.depthTexture.format===us)we(y)?a.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ce,0,ne):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,ce,0);else throw new Error("Unknown depthTexture format")}function Be(R){let y=n.get(R),$=R.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==R.depthTexture){let te=R.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),te){let ce=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,te.removeEventListener("dispose",ce)};te.addEventListener("dispose",ce),y.__depthDisposeCallback=ce}y.__boundDepthTexture=te}if(R.depthTexture&&!y.__autoAllocateDepthBuffer){if($)throw new Error("target.depthTexture not supported in Cube render targets");let te=R.texture.mipmaps;te&&te.length>0?be(y.__webglFramebuffer[0],R):be(y.__webglFramebuffer,R)}else if($){y.__webglDepthbuffer=[];for(let te=0;te<6;te++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[te]),y.__webglDepthbuffer[te]===void 0)y.__webglDepthbuffer[te]=i.createRenderbuffer(),Fe(y.__webglDepthbuffer[te],R,!1);else{let ce=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=y.__webglDepthbuffer[te];i.bindRenderbuffer(i.RENDERBUFFER,ne),i.framebufferRenderbuffer(i.FRAMEBUFFER,ce,i.RENDERBUFFER,ne)}}else{let te=R.texture.mipmaps;if(te&&te.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),Fe(y.__webglDepthbuffer,R,!1);else{let ce=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ne=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ne),i.framebufferRenderbuffer(i.FRAMEBUFFER,ce,i.RENDERBUFFER,ne)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Ye(R,y,$){let te=n.get(R);y!==void 0&&xe(te.__webglFramebuffer,R,R.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),$!==void 0&&Be(R)}function D(R){let y=R.texture,$=n.get(R),te=n.get(y);R.addEventListener("dispose",C);let ce=R.textures,ne=R.isWebGLCubeRenderTarget===!0,Ne=ce.length>1;if(Ne||(te.__webglTexture===void 0&&(te.__webglTexture=i.createTexture()),te.__version=y.version,o.memory.textures++),ne){$.__webglFramebuffer=[];for(let fe=0;fe<6;fe++)if(y.mipmaps&&y.mipmaps.length>0){$.__webglFramebuffer[fe]=[];for(let De=0;De<y.mipmaps.length;De++)$.__webglFramebuffer[fe][De]=i.createFramebuffer()}else $.__webglFramebuffer[fe]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){$.__webglFramebuffer=[];for(let fe=0;fe<y.mipmaps.length;fe++)$.__webglFramebuffer[fe]=i.createFramebuffer()}else $.__webglFramebuffer=i.createFramebuffer();if(Ne)for(let fe=0,De=ce.length;fe<De;fe++){let Le=n.get(ce[fe]);Le.__webglTexture===void 0&&(Le.__webglTexture=i.createTexture(),o.memory.textures++)}if(R.samples>0&&we(R)===!1){$.__webglMultisampledFramebuffer=i.createFramebuffer(),$.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,$.__webglMultisampledFramebuffer);for(let fe=0;fe<ce.length;fe++){let De=ce[fe];$.__webglColorRenderbuffer[fe]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,$.__webglColorRenderbuffer[fe]);let Le=r.convert(De.format,De.colorSpace),le=r.convert(De.type),ve=v(De.internalFormat,Le,le,De.colorSpace,R.isXRRenderTarget===!0),ke=tt(R);i.renderbufferStorageMultisample(i.RENDERBUFFER,ke,ve,R.width,R.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+fe,i.RENDERBUFFER,$.__webglColorRenderbuffer[fe])}i.bindRenderbuffer(i.RENDERBUFFER,null),R.depthBuffer&&($.__webglDepthRenderbuffer=i.createRenderbuffer(),Fe($.__webglDepthRenderbuffer,R,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ne){t.bindTexture(i.TEXTURE_CUBE_MAP,te.__webglTexture),ge(i.TEXTURE_CUBE_MAP,y);for(let fe=0;fe<6;fe++)if(y.mipmaps&&y.mipmaps.length>0)for(let De=0;De<y.mipmaps.length;De++)xe($.__webglFramebuffer[fe][De],R,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+fe,De);else xe($.__webglFramebuffer[fe],R,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+fe,0);m(y)&&d(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ne){for(let fe=0,De=ce.length;fe<De;fe++){let Le=ce[fe],le=n.get(Le),ve=i.TEXTURE_2D;(R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(ve=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(ve,le.__webglTexture),ge(ve,Le),xe($.__webglFramebuffer,R,Le,i.COLOR_ATTACHMENT0+fe,ve,0),m(Le)&&d(ve)}t.unbindTexture()}else{let fe=i.TEXTURE_2D;if((R.isWebGL3DRenderTarget||R.isWebGLArrayRenderTarget)&&(fe=R.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(fe,te.__webglTexture),ge(fe,y),y.mipmaps&&y.mipmaps.length>0)for(let De=0;De<y.mipmaps.length;De++)xe($.__webglFramebuffer[De],R,y,i.COLOR_ATTACHMENT0,fe,De);else xe($.__webglFramebuffer,R,y,i.COLOR_ATTACHMENT0,fe,0);m(y)&&d(fe),t.unbindTexture()}R.depthBuffer&&Be(R)}function it(R){let y=R.textures;for(let $=0,te=y.length;$<te;$++){let ce=y[$];if(m(ce)){let ne=M(R),Ne=n.get(ce).__webglTexture;t.bindTexture(ne,Ne),d(ne),t.unbindTexture()}}}let ye=[],Te=[];function Ae(R){if(R.samples>0){if(we(R)===!1){let y=R.textures,$=R.width,te=R.height,ce=i.COLOR_BUFFER_BIT,ne=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ne=n.get(R),fe=y.length>1;if(fe)for(let Le=0;Le<y.length;Le++)t.bindFramebuffer(i.FRAMEBUFFER,Ne.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Le,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ne.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Le,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ne.__webglMultisampledFramebuffer);let De=R.texture.mipmaps;De&&De.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ne.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ne.__webglFramebuffer);for(let Le=0;Le<y.length;Le++){if(R.resolveDepthBuffer&&(R.depthBuffer&&(ce|=i.DEPTH_BUFFER_BIT),R.stencilBuffer&&R.resolveStencilBuffer&&(ce|=i.STENCIL_BUFFER_BIT)),fe){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ne.__webglColorRenderbuffer[Le]);let le=n.get(y[Le]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,le,0)}i.blitFramebuffer(0,0,$,te,0,0,$,te,ce,i.NEAREST),l===!0&&(ye.length=0,Te.length=0,ye.push(i.COLOR_ATTACHMENT0+Le),R.depthBuffer&&R.resolveDepthBuffer===!1&&(ye.push(ne),Te.push(ne),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,Te)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,ye))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),fe)for(let Le=0;Le<y.length;Le++){t.bindFramebuffer(i.FRAMEBUFFER,Ne.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Le,i.RENDERBUFFER,Ne.__webglColorRenderbuffer[Le]);let le=n.get(y[Le]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ne.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Le,i.TEXTURE_2D,le,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ne.__webglMultisampledFramebuffer)}else if(R.depthBuffer&&R.resolveDepthBuffer===!1&&l){let y=R.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function tt(R){return Math.min(s.maxSamples,R.samples)}function we(R){let y=n.get(R);return R.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function Ze(R){let y=o.render.frame;h.get(R)!==y&&(h.set(R,y),R.update())}function gt(R,y){let $=R.colorSpace,te=R.format,ce=R.type;return R.isCompressedTexture===!0||R.isVideoTexture===!0||$!==yi&&$!==Yn&&(rt.getTransfer($)===ht?(te!==cn||ce!==Fn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",$)),y}function dt(R){return typeof HTMLImageElement<"u"&&R instanceof HTMLImageElement?(c.width=R.naturalWidth||R.width,c.height=R.naturalHeight||R.height):typeof VideoFrame<"u"&&R instanceof VideoFrame?(c.width=R.displayWidth,c.height=R.displayHeight):(c.width=R.width,c.height=R.height),c}this.allocateTextureUnit=J,this.resetTextureUnits=W,this.setTexture2D=z,this.setTexture2DArray=q,this.setTexture3D=ae,this.setTextureCube=Z,this.rebindTextures=Ye,this.setupRenderTarget=D,this.updateRenderTargetMipmap=it,this.updateMultisampleRenderTarget=Ae,this.setupDepthRenderbuffer=Be,this.setupFrameBufferTexture=xe,this.useMultisampledRTT=we}function R0(i,e){function t(n,s=Yn){let r,o=rt.getTransfer(s);if(n===Fn)return i.UNSIGNED_BYTE;if(n===Uo)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Fo)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Sc)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===bc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===vc)return i.BYTE;if(n===Mc)return i.SHORT;if(n===cs)return i.UNSIGNED_SHORT;if(n===Lo)return i.INT;if(n===ci)return i.UNSIGNED_INT;if(n===Tn)return i.FLOAT;if(n===ls)return i.HALF_FLOAT;if(n===Ec)return i.ALPHA;if(n===wc)return i.RGB;if(n===cn)return i.RGBA;if(n===Ki)return i.DEPTH_COMPONENT;if(n===us)return i.DEPTH_STENCIL;if(n===Tc)return i.RED;if(n===No)return i.RED_INTEGER;if(n===Ac)return i.RG;if(n===Oo)return i.RG_INTEGER;if(n===Bo)return i.RGBA_INTEGER;if(n===cr||n===lr||n===hr||n===ur)if(o===ht)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===cr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===lr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===hr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ur)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===cr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===lr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===hr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ur)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===zo||n===ko||n===Ho||n===Vo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===zo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===ko)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ho)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Vo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Go||n===Wo||n===Xo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Go||n===Wo)return o===ht?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Xo)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===qo||n===Yo||n===Zo||n===$o||n===Jo||n===Ko||n===Qo||n===jo||n===ea||n===ta||n===na||n===ia||n===sa||n===ra)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===qo)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Yo)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Zo)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===$o)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Jo)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ko)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Qo)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===jo)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===ea)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ta)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===na)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===ia)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===sa)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ra)return o===ht?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===oa||n===aa||n===ca)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===oa)return o===ht?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===aa)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ca)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===la||n===ha||n===ua||n===da)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===la)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ha)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===ua)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===da)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===hs?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var C0=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,I0=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Jc=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Zs(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new En({vertexShader:C0,fragmentShader:I0,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Et(new nr(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Kc=class extends Gn{constructor(e,t){super();let n=this,s=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,f=null,p=null,g=null,_=typeof XRWebGLBinding<"u",m=new Jc,d={},M=t.getContextAttributes(),v=null,x=null,P=[],A=[],C=new Ue,O=null,w=new Jt;w.viewport=new yt;let S=new Jt;S.viewport=new yt;let U=[w,S],W=new So,J=null,H=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(k){let oe=P[k];return oe===void 0&&(oe=new is,P[k]=oe),oe.getTargetRaySpace()},this.getControllerGrip=function(k){let oe=P[k];return oe===void 0&&(oe=new is,P[k]=oe),oe.getGripSpace()},this.getHand=function(k){let oe=P[k];return oe===void 0&&(oe=new is,P[k]=oe),oe.getHandSpace()};function z(k){let oe=A.indexOf(k.inputSource);if(oe===-1)return;let xe=P[oe];xe!==void 0&&(xe.update(k.inputSource,k.frame,c||o),xe.dispatchEvent({type:k.type,data:k.inputSource}))}function q(){s.removeEventListener("select",z),s.removeEventListener("selectstart",z),s.removeEventListener("selectend",z),s.removeEventListener("squeeze",z),s.removeEventListener("squeezestart",z),s.removeEventListener("squeezeend",z),s.removeEventListener("end",q),s.removeEventListener("inputsourceschange",ae);for(let k=0;k<P.length;k++){let oe=A[k];oe!==null&&(A[k]=null,P[k].disconnect(oe))}J=null,H=null,m.reset();for(let k in d)delete d[k];e.setRenderTarget(v),p=null,f=null,u=null,s=null,x=null,me.stop(),n.isPresenting=!1,e.setPixelRatio(O),e.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(k){r=k,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(k){a=k,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(k){c=k},this.getBaseLayer=function(){return f!==null?f:p},this.getBinding=function(){return u===null&&_&&(u=new XRWebGLBinding(s,t)),u},this.getFrame=function(){return g},this.getSession=function(){return s},this.setSession=async function(k){if(s=k,s!==null){if(v=e.getRenderTarget(),s.addEventListener("select",z),s.addEventListener("selectstart",z),s.addEventListener("selectend",z),s.addEventListener("squeeze",z),s.addEventListener("squeezestart",z),s.addEventListener("squeezeend",z),s.addEventListener("end",q),s.addEventListener("inputsourceschange",ae),M.xrCompatible!==!0&&await t.makeXRCompatible(),O=e.getPixelRatio(),e.getSize(C),_&&"createProjectionLayer"in XRWebGLBinding.prototype){let xe=null,Fe=null,be=null;M.depth&&(be=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,xe=M.stencil?us:Ki,Fe=M.stencil?hs:ci);let Be={colorFormat:t.RGBA8,depthFormat:be,scaleFactor:r};u=this.getBinding(),f=u.createProjectionLayer(Be),s.updateRenderState({layers:[f]}),e.setPixelRatio(1),e.setSize(f.textureWidth,f.textureHeight,!1),x=new In(f.textureWidth,f.textureHeight,{format:cn,type:Fn,depthTexture:new Ys(f.textureWidth,f.textureHeight,Fe,void 0,void 0,void 0,void 0,void 0,void 0,xe),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}else{let xe={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};p=new XRWebGLLayer(s,t,xe),s.updateRenderState({baseLayer:p}),e.setPixelRatio(1),e.setSize(p.framebufferWidth,p.framebufferHeight,!1),x=new In(p.framebufferWidth,p.framebufferHeight,{format:cn,type:Fn,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:p.ignoreDepthValues===!1,resolveStencilBuffer:p.ignoreDepthValues===!1})}x.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await s.requestReferenceSpace(a),me.setContext(s),me.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function ae(k){for(let oe=0;oe<k.removed.length;oe++){let xe=k.removed[oe],Fe=A.indexOf(xe);Fe>=0&&(A[Fe]=null,P[Fe].disconnect(xe))}for(let oe=0;oe<k.added.length;oe++){let xe=k.added[oe],Fe=A.indexOf(xe);if(Fe===-1){for(let Be=0;Be<P.length;Be++)if(Be>=A.length){A.push(xe),Fe=Be;break}else if(A[Be]===null){A[Be]=xe,Fe=Be;break}if(Fe===-1)break}let be=P[Fe];be&&be.connect(xe)}}let Z=new I,ee=new I;function re(k,oe,xe){Z.setFromMatrixPosition(oe.matrixWorld),ee.setFromMatrixPosition(xe.matrixWorld);let Fe=Z.distanceTo(ee),be=oe.projectionMatrix.elements,Be=xe.projectionMatrix.elements,Ye=be[14]/(be[10]-1),D=be[14]/(be[10]+1),it=(be[9]+1)/be[5],ye=(be[9]-1)/be[5],Te=(be[8]-1)/be[0],Ae=(Be[8]+1)/Be[0],tt=Ye*Te,we=Ye*Ae,Ze=Fe/(-Te+Ae),gt=Ze*-Te;if(oe.matrixWorld.decompose(k.position,k.quaternion,k.scale),k.translateX(gt),k.translateZ(Ze),k.matrixWorld.compose(k.position,k.quaternion,k.scale),k.matrixWorldInverse.copy(k.matrixWorld).invert(),be[10]===-1)k.projectionMatrix.copy(oe.projectionMatrix),k.projectionMatrixInverse.copy(oe.projectionMatrixInverse);else{let dt=Ye+Ze,R=D+Ze,y=tt-gt,$=we+(Fe-gt),te=it*D/R*dt,ce=ye*D/R*dt;k.projectionMatrix.makePerspective(y,$,te,ce,dt,R),k.projectionMatrixInverse.copy(k.projectionMatrix).invert()}}function ue(k,oe){oe===null?k.matrixWorld.copy(k.matrix):k.matrixWorld.multiplyMatrices(oe.matrixWorld,k.matrix),k.matrixWorldInverse.copy(k.matrixWorld).invert()}this.updateCamera=function(k){if(s===null)return;let oe=k.near,xe=k.far;m.texture!==null&&(m.depthNear>0&&(oe=m.depthNear),m.depthFar>0&&(xe=m.depthFar)),W.near=S.near=w.near=oe,W.far=S.far=w.far=xe,(J!==W.near||H!==W.far)&&(s.updateRenderState({depthNear:W.near,depthFar:W.far}),J=W.near,H=W.far),W.layers.mask=k.layers.mask|6,w.layers.mask=W.layers.mask&3,S.layers.mask=W.layers.mask&5;let Fe=k.parent,be=W.cameras;ue(W,Fe);for(let Be=0;Be<be.length;Be++)ue(be[Be],Fe);be.length===2?re(W,w,S):W.projectionMatrix.copy(w.projectionMatrix),ge(k,W,Fe)};function ge(k,oe,xe){xe===null?k.matrix.copy(oe.matrixWorld):(k.matrix.copy(xe.matrixWorld),k.matrix.invert(),k.matrix.multiply(oe.matrixWorld)),k.matrix.decompose(k.position,k.quaternion,k.scale),k.updateMatrixWorld(!0),k.projectionMatrix.copy(oe.projectionMatrix),k.projectionMatrixInverse.copy(oe.projectionMatrixInverse),k.isPerspectiveCamera&&(k.fov=Qi*2*Math.atan(1/k.projectionMatrix.elements[5]),k.zoom=1)}this.getCamera=function(){return W},this.getFoveation=function(){if(!(f===null&&p===null))return l},this.setFoveation=function(k){l=k,f!==null&&(f.fixedFoveation=k),p!==null&&p.fixedFoveation!==void 0&&(p.fixedFoveation=k)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(W)},this.getCameraTexture=function(k){return d[k]};let ie=null;function Se(k,oe){if(h=oe.getViewerPose(c||o),g=oe,h!==null){let xe=h.views;p!==null&&(e.setRenderTargetFramebuffer(x,p.framebuffer),e.setRenderTarget(x));let Fe=!1;xe.length!==W.cameras.length&&(W.cameras.length=0,Fe=!0);for(let D=0;D<xe.length;D++){let it=xe[D],ye=null;if(p!==null)ye=p.getViewport(it);else{let Ae=u.getViewSubImage(f,it);ye=Ae.viewport,D===0&&(e.setRenderTargetTextures(x,Ae.colorTexture,Ae.depthStencilTexture),e.setRenderTarget(x))}let Te=U[D];Te===void 0&&(Te=new Jt,Te.layers.enable(D),Te.viewport=new yt,U[D]=Te),Te.matrix.fromArray(it.transform.matrix),Te.matrix.decompose(Te.position,Te.quaternion,Te.scale),Te.projectionMatrix.fromArray(it.projectionMatrix),Te.projectionMatrixInverse.copy(Te.projectionMatrix).invert(),Te.viewport.set(ye.x,ye.y,ye.width,ye.height),D===0&&(W.matrix.copy(Te.matrix),W.matrix.decompose(W.position,W.quaternion,W.scale)),Fe===!0&&W.cameras.push(Te)}let be=s.enabledFeatures;if(be&&be.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&_){u=n.getBinding();let D=u.getDepthInformation(xe[0]);D&&D.isValid&&D.texture&&m.init(D,s.renderState)}if(be&&be.includes("camera-access")&&_){e.state.unbindTexture(),u=n.getBinding();for(let D=0;D<xe.length;D++){let it=xe[D].camera;if(it){let ye=d[it];ye||(ye=new Zs,d[it]=ye);let Te=u.getCameraImage(it);ye.sourceTexture=Te}}}}for(let xe=0;xe<P.length;xe++){let Fe=A[xe],be=P[xe];Fe!==null&&be!==void 0&&be.update(Fe,oe,c||o)}ie&&ie(k,oe),oe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:oe}),g=null}let me=new nu;me.setAnimationLoop(Se),this.setAnimationLoop=function(k){ie=k},this.dispose=function(){}}},Ri=new zt,P0=new ot;function D0(i,e){function t(m,d){m.matrixAutoUpdate===!0&&m.updateMatrix(),d.value.copy(m.matrix)}function n(m,d){d.color.getRGB(m.fogColor.value,Lc(i)),d.isFog?(m.fogNear.value=d.near,m.fogFar.value=d.far):d.isFogExp2&&(m.fogDensity.value=d.density)}function s(m,d,M,v,x){d.isMeshBasicMaterial||d.isMeshLambertMaterial?r(m,d):d.isMeshToonMaterial?(r(m,d),u(m,d)):d.isMeshPhongMaterial?(r(m,d),h(m,d)):d.isMeshStandardMaterial?(r(m,d),f(m,d),d.isMeshPhysicalMaterial&&p(m,d,x)):d.isMeshMatcapMaterial?(r(m,d),g(m,d)):d.isMeshDepthMaterial?r(m,d):d.isMeshDistanceMaterial?(r(m,d),_(m,d)):d.isMeshNormalMaterial?r(m,d):d.isLineBasicMaterial?(o(m,d),d.isLineDashedMaterial&&a(m,d)):d.isPointsMaterial?l(m,d,M,v):d.isSpriteMaterial?c(m,d):d.isShadowMaterial?(m.color.value.copy(d.color),m.opacity.value=d.opacity):d.isShaderMaterial&&(d.uniformsNeedUpdate=!1)}function r(m,d){m.opacity.value=d.opacity,d.color&&m.diffuse.value.copy(d.color),d.emissive&&m.emissive.value.copy(d.emissive).multiplyScalar(d.emissiveIntensity),d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.bumpMap&&(m.bumpMap.value=d.bumpMap,t(d.bumpMap,m.bumpMapTransform),m.bumpScale.value=d.bumpScale,d.side===Zt&&(m.bumpScale.value*=-1)),d.normalMap&&(m.normalMap.value=d.normalMap,t(d.normalMap,m.normalMapTransform),m.normalScale.value.copy(d.normalScale),d.side===Zt&&m.normalScale.value.negate()),d.displacementMap&&(m.displacementMap.value=d.displacementMap,t(d.displacementMap,m.displacementMapTransform),m.displacementScale.value=d.displacementScale,m.displacementBias.value=d.displacementBias),d.emissiveMap&&(m.emissiveMap.value=d.emissiveMap,t(d.emissiveMap,m.emissiveMapTransform)),d.specularMap&&(m.specularMap.value=d.specularMap,t(d.specularMap,m.specularMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest);let M=e.get(d),v=M.envMap,x=M.envMapRotation;v&&(m.envMap.value=v,Ri.copy(x),Ri.x*=-1,Ri.y*=-1,Ri.z*=-1,v.isCubeTexture&&v.isRenderTargetTexture===!1&&(Ri.y*=-1,Ri.z*=-1),m.envMapRotation.value.setFromMatrix4(P0.makeRotationFromEuler(Ri)),m.flipEnvMap.value=v.isCubeTexture&&v.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=d.reflectivity,m.ior.value=d.ior,m.refractionRatio.value=d.refractionRatio),d.lightMap&&(m.lightMap.value=d.lightMap,m.lightMapIntensity.value=d.lightMapIntensity,t(d.lightMap,m.lightMapTransform)),d.aoMap&&(m.aoMap.value=d.aoMap,m.aoMapIntensity.value=d.aoMapIntensity,t(d.aoMap,m.aoMapTransform))}function o(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform))}function a(m,d){m.dashSize.value=d.dashSize,m.totalSize.value=d.dashSize+d.gapSize,m.scale.value=d.scale}function l(m,d,M,v){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.size.value=d.size*M,m.scale.value=v*.5,d.map&&(m.map.value=d.map,t(d.map,m.uvTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function c(m,d){m.diffuse.value.copy(d.color),m.opacity.value=d.opacity,m.rotation.value=d.rotation,d.map&&(m.map.value=d.map,t(d.map,m.mapTransform)),d.alphaMap&&(m.alphaMap.value=d.alphaMap,t(d.alphaMap,m.alphaMapTransform)),d.alphaTest>0&&(m.alphaTest.value=d.alphaTest)}function h(m,d){m.specular.value.copy(d.specular),m.shininess.value=Math.max(d.shininess,1e-4)}function u(m,d){d.gradientMap&&(m.gradientMap.value=d.gradientMap)}function f(m,d){m.metalness.value=d.metalness,d.metalnessMap&&(m.metalnessMap.value=d.metalnessMap,t(d.metalnessMap,m.metalnessMapTransform)),m.roughness.value=d.roughness,d.roughnessMap&&(m.roughnessMap.value=d.roughnessMap,t(d.roughnessMap,m.roughnessMapTransform)),d.envMap&&(m.envMapIntensity.value=d.envMapIntensity)}function p(m,d,M){m.ior.value=d.ior,d.sheen>0&&(m.sheenColor.value.copy(d.sheenColor).multiplyScalar(d.sheen),m.sheenRoughness.value=d.sheenRoughness,d.sheenColorMap&&(m.sheenColorMap.value=d.sheenColorMap,t(d.sheenColorMap,m.sheenColorMapTransform)),d.sheenRoughnessMap&&(m.sheenRoughnessMap.value=d.sheenRoughnessMap,t(d.sheenRoughnessMap,m.sheenRoughnessMapTransform))),d.clearcoat>0&&(m.clearcoat.value=d.clearcoat,m.clearcoatRoughness.value=d.clearcoatRoughness,d.clearcoatMap&&(m.clearcoatMap.value=d.clearcoatMap,t(d.clearcoatMap,m.clearcoatMapTransform)),d.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=d.clearcoatRoughnessMap,t(d.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),d.clearcoatNormalMap&&(m.clearcoatNormalMap.value=d.clearcoatNormalMap,t(d.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(d.clearcoatNormalScale),d.side===Zt&&m.clearcoatNormalScale.value.negate())),d.dispersion>0&&(m.dispersion.value=d.dispersion),d.iridescence>0&&(m.iridescence.value=d.iridescence,m.iridescenceIOR.value=d.iridescenceIOR,m.iridescenceThicknessMinimum.value=d.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=d.iridescenceThicknessRange[1],d.iridescenceMap&&(m.iridescenceMap.value=d.iridescenceMap,t(d.iridescenceMap,m.iridescenceMapTransform)),d.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=d.iridescenceThicknessMap,t(d.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),d.transmission>0&&(m.transmission.value=d.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),d.transmissionMap&&(m.transmissionMap.value=d.transmissionMap,t(d.transmissionMap,m.transmissionMapTransform)),m.thickness.value=d.thickness,d.thicknessMap&&(m.thicknessMap.value=d.thicknessMap,t(d.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=d.attenuationDistance,m.attenuationColor.value.copy(d.attenuationColor)),d.anisotropy>0&&(m.anisotropyVector.value.set(d.anisotropy*Math.cos(d.anisotropyRotation),d.anisotropy*Math.sin(d.anisotropyRotation)),d.anisotropyMap&&(m.anisotropyMap.value=d.anisotropyMap,t(d.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=d.specularIntensity,m.specularColor.value.copy(d.specularColor),d.specularColorMap&&(m.specularColorMap.value=d.specularColorMap,t(d.specularColorMap,m.specularColorMapTransform)),d.specularIntensityMap&&(m.specularIntensityMap.value=d.specularIntensityMap,t(d.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,d){d.matcap&&(m.matcap.value=d.matcap)}function _(m,d){let M=e.get(d).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function L0(i,e,t,n){let s={},r={},o=[],a=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,v){let x=v.program;n.uniformBlockBinding(M,x)}function c(M,v){let x=s[M.id];x===void 0&&(g(M),x=h(M),s[M.id]=x,M.addEventListener("dispose",m));let P=v.program;n.updateUBOMapping(M,P);let A=e.render.frame;r[M.id]!==A&&(f(M),r[M.id]=A)}function h(M){let v=u();M.__bindingPointIndex=v;let x=i.createBuffer(),P=M.__size,A=M.usage;return i.bindBuffer(i.UNIFORM_BUFFER,x),i.bufferData(i.UNIFORM_BUFFER,P,A),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,v,x),x}function u(){for(let M=0;M<a;M++)if(o.indexOf(M)===-1)return o.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function f(M){let v=s[M.id],x=M.uniforms,P=M.__cache;i.bindBuffer(i.UNIFORM_BUFFER,v);for(let A=0,C=x.length;A<C;A++){let O=Array.isArray(x[A])?x[A]:[x[A]];for(let w=0,S=O.length;w<S;w++){let U=O[w];if(p(U,A,w,P)===!0){let W=U.__offset,J=Array.isArray(U.value)?U.value:[U.value],H=0;for(let z=0;z<J.length;z++){let q=J[z],ae=_(q);typeof q=="number"||typeof q=="boolean"?(U.__data[0]=q,i.bufferSubData(i.UNIFORM_BUFFER,W+H,U.__data)):q.isMatrix3?(U.__data[0]=q.elements[0],U.__data[1]=q.elements[1],U.__data[2]=q.elements[2],U.__data[3]=0,U.__data[4]=q.elements[3],U.__data[5]=q.elements[4],U.__data[6]=q.elements[5],U.__data[7]=0,U.__data[8]=q.elements[6],U.__data[9]=q.elements[7],U.__data[10]=q.elements[8],U.__data[11]=0):(q.toArray(U.__data,H),H+=ae.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,W,U.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function p(M,v,x,P){let A=M.value,C=v+"_"+x;if(P[C]===void 0)return typeof A=="number"||typeof A=="boolean"?P[C]=A:P[C]=A.clone(),!0;{let O=P[C];if(typeof A=="number"||typeof A=="boolean"){if(O!==A)return P[C]=A,!0}else if(O.equals(A)===!1)return O.copy(A),!0}return!1}function g(M){let v=M.uniforms,x=0,P=16;for(let C=0,O=v.length;C<O;C++){let w=Array.isArray(v[C])?v[C]:[v[C]];for(let S=0,U=w.length;S<U;S++){let W=w[S],J=Array.isArray(W.value)?W.value:[W.value];for(let H=0,z=J.length;H<z;H++){let q=J[H],ae=_(q),Z=x%P,ee=Z%ae.boundary,re=Z+ee;x+=ee,re!==0&&P-re<ae.storage&&(x+=P-re),W.__data=new Float32Array(ae.storage/Float32Array.BYTES_PER_ELEMENT),W.__offset=x,x+=ae.storage}}}let A=x%P;return A>0&&(x+=P-A),M.__size=x,M.__cache={},this}function _(M){let v={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(v.boundary=4,v.storage=4):M.isVector2?(v.boundary=8,v.storage=8):M.isVector3||M.isColor?(v.boundary=16,v.storage=12):M.isVector4?(v.boundary=16,v.storage=16):M.isMatrix3?(v.boundary=48,v.storage=48):M.isMatrix4?(v.boundary=64,v.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),v}function m(M){let v=M.target;v.removeEventListener("dispose",m);let x=o.indexOf(v.__bindingPointIndex);o.splice(x,1),i.deleteBuffer(s[v.id]),delete s[v.id],delete r[v.id]}function d(){for(let M in s)i.deleteBuffer(s[M]);o=[],s={},r={}}return{bind:l,update:c,dispose:d}}var _a=class{constructor(e={}){let{canvas:t=Eh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:f=!1}=e;this.isWebGLRenderer=!0;let p;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");p=n.getContextAttributes().alpha}else p=o;let g=new Uint32Array(4),_=new Int32Array(4),m=null,d=null,M=[],v=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=wn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let x=this,P=!1;this._outputColorSpace=Ut;let A=0,C=0,O=null,w=-1,S=null,U=new yt,W=new yt,J=null,H=new qe(0),z=0,q=t.width,ae=t.height,Z=1,ee=null,re=null,ue=new yt(0,0,q,ae),ge=new yt(0,0,q,ae),ie=!1,Se=new qs,me=!1,k=!1,oe=new ot,xe=new I,Fe=new yt,be={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Be=!1;function Ye(){return O===null?Z:1}let D=n;function it(E,V){return t.getContext(E,V)}try{let E={alpha:!0,depth:s,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"180"}`),t.addEventListener("webglcontextlost",B,!1),t.addEventListener("webglcontextrestored",K,!1),t.addEventListener("webglcontextcreationerror",X,!1),D===null){let V="webgl2";if(D=it(V,E),D===null)throw it(V)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(E){throw console.error("THREE.WebGLRenderer: "+E.message),E}let ye,Te,Ae,tt,we,Ze,gt,dt,R,y,$,te,ce,ne,Ne,fe,De,Le,le,ve,ke,N,T,L;function b(){ye=new Km(D),ye.init(),N=new R0(D,ye),Te=new Wm(D,ye,e,N),Ae=new T0(D,ye),Te.reversedDepthBuffer&&f&&Ae.buffers.depth.setReversed(!0),tt=new eg(D),we=new f0,Ze=new A0(D,ye,Ae,we,Te,N,tt),gt=new qm(x),dt=new Jm(x),R=new of(D),T=new Vm(D,R),y=new Qm(D,R,tt,T),$=new ng(D,y,R,tt),le=new tg(D,Te,Ze),fe=new Xm(we),te=new d0(x,gt,dt,ye,Te,T,fe),ce=new D0(x,we),ne=new m0,Ne=new M0(ye),Le=new Hm(x,gt,dt,Ae,$,p,l),De=new E0(x,$,Te),L=new L0(D,tt,Te,Ae),ve=new Gm(D,ye,tt),ke=new jm(D,ye,tt),tt.programs=te.programs,x.capabilities=Te,x.extensions=ye,x.properties=we,x.renderLists=ne,x.shadowMap=De,x.state=Ae,x.info=tt}b();let F=new Kc(x,D);this.xr=F,this.getContext=function(){return D},this.getContextAttributes=function(){return D.getContextAttributes()},this.forceContextLoss=function(){let E=ye.get("WEBGL_lose_context");E&&E.loseContext()},this.forceContextRestore=function(){let E=ye.get("WEBGL_lose_context");E&&E.restoreContext()},this.getPixelRatio=function(){return Z},this.setPixelRatio=function(E){E!==void 0&&(Z=E,this.setSize(q,ae,!1))},this.getSize=function(E){return E.set(q,ae)},this.setSize=function(E,V,Q=!0){if(F.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}q=E,ae=V,t.width=Math.floor(E*Z),t.height=Math.floor(V*Z),Q===!0&&(t.style.width=E+"px",t.style.height=V+"px"),this.setViewport(0,0,E,V)},this.getDrawingBufferSize=function(E){return E.set(q*Z,ae*Z).floor()},this.setDrawingBufferSize=function(E,V,Q){q=E,ae=V,Z=Q,t.width=Math.floor(E*Q),t.height=Math.floor(V*Q),this.setViewport(0,0,E,V)},this.getCurrentViewport=function(E){return E.copy(U)},this.getViewport=function(E){return E.copy(ue)},this.setViewport=function(E,V,Q,j){E.isVector4?ue.set(E.x,E.y,E.z,E.w):ue.set(E,V,Q,j),Ae.viewport(U.copy(ue).multiplyScalar(Z).round())},this.getScissor=function(E){return E.copy(ge)},this.setScissor=function(E,V,Q,j){E.isVector4?ge.set(E.x,E.y,E.z,E.w):ge.set(E,V,Q,j),Ae.scissor(W.copy(ge).multiplyScalar(Z).round())},this.getScissorTest=function(){return ie},this.setScissorTest=function(E){Ae.setScissorTest(ie=E)},this.setOpaqueSort=function(E){ee=E},this.setTransparentSort=function(E){re=E},this.getClearColor=function(E){return E.copy(Le.getClearColor())},this.setClearColor=function(){Le.setClearColor(...arguments)},this.getClearAlpha=function(){return Le.getClearAlpha()},this.setClearAlpha=function(){Le.setClearAlpha(...arguments)},this.clear=function(E=!0,V=!0,Q=!0){let j=0;if(E){let G=!1;if(O!==null){let de=O.texture.format;G=de===Bo||de===Oo||de===No}if(G){let de=O.texture.type,Ee=de===Fn||de===ci||de===cs||de===hs||de===Uo||de===Fo,Oe=Le.getClearColor(),Re=Le.getClearAlpha(),Ge=Oe.r,Xe=Oe.g,ze=Oe.b;Ee?(g[0]=Ge,g[1]=Xe,g[2]=ze,g[3]=Re,D.clearBufferuiv(D.COLOR,0,g)):(_[0]=Ge,_[1]=Xe,_[2]=ze,_[3]=Re,D.clearBufferiv(D.COLOR,0,_))}else j|=D.COLOR_BUFFER_BIT}V&&(j|=D.DEPTH_BUFFER_BIT),Q&&(j|=D.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),D.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",B,!1),t.removeEventListener("webglcontextrestored",K,!1),t.removeEventListener("webglcontextcreationerror",X,!1),Le.dispose(),ne.dispose(),Ne.dispose(),we.dispose(),gt.dispose(),dt.dispose(),$.dispose(),T.dispose(),L.dispose(),te.dispose(),F.dispose(),F.removeEventListener("sessionstart",pe),F.removeEventListener("sessionend",Pe),We.stop()};function B(E){E.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),P=!0}function K(){console.log("THREE.WebGLRenderer: Context Restored."),P=!1;let E=tt.autoReset,V=De.enabled,Q=De.autoUpdate,j=De.needsUpdate,G=De.type;b(),tt.autoReset=E,De.enabled=V,De.autoUpdate=Q,De.needsUpdate=j,De.type=G}function X(E){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",E.statusMessage)}function Y(E){let V=E.target;V.removeEventListener("dispose",Y),se(V)}function se(E){he(E),we.remove(E)}function he(E){let V=we.get(E).programs;V!==void 0&&(V.forEach(function(Q){te.releaseProgram(Q)}),E.isShaderMaterial&&te.releaseShaderCache(E))}this.renderBufferDirect=function(E,V,Q,j,G,de){V===null&&(V=be);let Ee=G.isMesh&&G.matrixWorld.determinant()<0,Oe=Lt(E,V,Q,j,G);Ae.setMaterial(j,Ee);let Re=Q.index,Ge=1;if(j.wireframe===!0){if(Re=y.getWireframeAttribute(Q),Re===void 0)return;Ge=2}let Xe=Q.drawRange,ze=Q.attributes.position,nt=Xe.start*Ge,ut=(Xe.start+Xe.count)*Ge;de!==null&&(nt=Math.max(nt,de.start*Ge),ut=Math.min(ut,(de.start+de.count)*Ge)),Re!==null?(nt=Math.max(nt,0),ut=Math.min(ut,Re.count)):ze!=null&&(nt=Math.max(nt,0),ut=Math.min(ut,ze.count));let wt=ut-nt;if(wt<0||wt===1/0)return;T.setup(G,j,Oe,Q,Re);let _t,pt=ve;if(Re!==null&&(_t=R.get(Re),pt=ke,pt.setIndex(_t)),G.isMesh)j.wireframe===!0?(Ae.setLineWidth(j.wireframeLinewidth*Ye()),pt.setMode(D.LINES)):pt.setMode(D.TRIANGLES);else if(G.isLine){let He=j.linewidth;He===void 0&&(He=1),Ae.setLineWidth(He*Ye()),G.isLineSegments?pt.setMode(D.LINES):G.isLineLoop?pt.setMode(D.LINE_LOOP):pt.setMode(D.LINE_STRIP)}else G.isPoints?pt.setMode(D.POINTS):G.isSprite&&pt.setMode(D.TRIANGLES);if(G.isBatchedMesh)if(G._multiDrawInstances!==null)es("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),pt.renderMultiDrawInstances(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount,G._multiDrawInstances);else if(ye.get("WEBGL_multi_draw"))pt.renderMultiDraw(G._multiDrawStarts,G._multiDrawCounts,G._multiDrawCount);else{let He=G._multiDrawStarts,Mt=G._multiDrawCounts,at=G._multiDrawCount,jt=Re?R.get(Re).bytesPerElement:1,Fi=we.get(j).currentProgram.getUniforms();for(let en=0;en<at;en++)Fi.setValue(D,"_gl_DrawID",en),pt.render(He[en]/jt,Mt[en])}else if(G.isInstancedMesh)pt.renderInstances(nt,wt,G.count);else if(Q.isInstancedBufferGeometry){let He=Q._maxInstanceCount!==void 0?Q._maxInstanceCount:1/0,Mt=Math.min(Q.instanceCount,He);pt.renderInstances(nt,wt,Mt)}else pt.render(nt,wt)};function _e(E,V,Q){E.transparent===!0&&E.side===Pt&&E.forceSinglePass===!1?(E.side=Zt,E.needsUpdate=!0,lt(E,V,Q),E.side=Kt,E.needsUpdate=!0,lt(E,V,Q),E.side=Pt):lt(E,V,Q)}this.compile=function(E,V,Q=null){Q===null&&(Q=E),d=Ne.get(Q),d.init(V),v.push(d),Q.traverseVisible(function(G){G.isLight&&G.layers.test(V.layers)&&(d.pushLight(G),G.castShadow&&d.pushShadow(G))}),E!==Q&&E.traverseVisible(function(G){G.isLight&&G.layers.test(V.layers)&&(d.pushLight(G),G.castShadow&&d.pushShadow(G))}),d.setupLights();let j=new Set;return E.traverse(function(G){if(!(G.isMesh||G.isPoints||G.isLine||G.isSprite))return;let de=G.material;if(de)if(Array.isArray(de))for(let Ee=0;Ee<de.length;Ee++){let Oe=de[Ee];_e(Oe,Q,G),j.add(Oe)}else _e(de,Q,G),j.add(de)}),d=v.pop(),j},this.compileAsync=function(E,V,Q=null){let j=this.compile(E,V,Q);return new Promise(G=>{function de(){if(j.forEach(function(Ee){we.get(Ee).currentProgram.isReady()&&j.delete(Ee)}),j.size===0){G(E);return}setTimeout(de,10)}ye.get("KHR_parallel_shader_compile")!==null?de():setTimeout(de,10)})};let Ce=null;function Ie(E){Ce&&Ce(E)}function pe(){We.stop()}function Pe(){We.start()}let We=new nu;We.setAnimationLoop(Ie),typeof self<"u"&&We.setContext(self),this.setAnimationLoop=function(E){Ce=E,F.setAnimationLoop(E),E===null?We.stop():We.start()},F.addEventListener("sessionstart",pe),F.addEventListener("sessionend",Pe),this.render=function(E,V){if(V!==void 0&&V.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(E.matrixWorldAutoUpdate===!0&&E.updateMatrixWorld(),V.parent===null&&V.matrixWorldAutoUpdate===!0&&V.updateMatrixWorld(),F.enabled===!0&&F.isPresenting===!0&&(F.cameraAutoUpdate===!0&&F.updateCamera(V),V=F.getCamera()),E.isScene===!0&&E.onBeforeRender(x,E,V,O),d=Ne.get(E,v.length),d.init(V),v.push(d),oe.multiplyMatrices(V.projectionMatrix,V.matrixWorldInverse),Se.setFromProjectionMatrix(oe,vn,V.reversedDepth),k=this.localClippingEnabled,me=fe.init(this.clippingPlanes,k),m=ne.get(E,M.length),m.init(),M.push(m),F.enabled===!0&&F.isPresenting===!0){let de=x.xr.getDepthSensingMesh();de!==null&&Ve(de,V,-1/0,x.sortObjects)}Ve(E,V,0,x.sortObjects),m.finish(),x.sortObjects===!0&&m.sort(ee,re),Be=F.enabled===!1||F.isPresenting===!1||F.hasDepthSensing()===!1,Be&&Le.addToRenderList(m,E),this.info.render.frame++,me===!0&&fe.beginShadows();let Q=d.state.shadowsArray;De.render(Q,E,V),me===!0&&fe.endShadows(),this.info.autoReset===!0&&this.info.reset();let j=m.opaque,G=m.transmissive;if(d.setupLights(),V.isArrayCamera){let de=V.cameras;if(G.length>0)for(let Ee=0,Oe=de.length;Ee<Oe;Ee++){let Re=de[Ee];st(j,G,E,Re)}Be&&Le.render(E);for(let Ee=0,Oe=de.length;Ee<Oe;Ee++){let Re=de[Ee];Qe(m,E,Re,Re.viewport)}}else G.length>0&&st(j,G,E,V),Be&&Le.render(E),Qe(m,E,V);O!==null&&C===0&&(Ze.updateMultisampleRenderTarget(O),Ze.updateRenderTargetMipmap(O)),E.isScene===!0&&E.onAfterRender(x,E,V),T.resetDefaultState(),w=-1,S=null,v.pop(),v.length>0?(d=v[v.length-1],me===!0&&fe.setGlobalState(x.clippingPlanes,d.state.camera)):d=null,M.pop(),M.length>0?m=M[M.length-1]:m=null};function Ve(E,V,Q,j){if(E.visible===!1)return;if(E.layers.test(V.layers)){if(E.isGroup)Q=E.renderOrder;else if(E.isLOD)E.autoUpdate===!0&&E.update(V);else if(E.isLight)d.pushLight(E),E.castShadow&&d.pushShadow(E);else if(E.isSprite){if(!E.frustumCulled||Se.intersectsSprite(E)){j&&Fe.setFromMatrixPosition(E.matrixWorld).applyMatrix4(oe);let Ee=$.update(E),Oe=E.material;Oe.visible&&m.push(E,Ee,Oe,Q,Fe.z,null)}}else if((E.isMesh||E.isLine||E.isPoints)&&(!E.frustumCulled||Se.intersectsObject(E))){let Ee=$.update(E),Oe=E.material;if(j&&(E.boundingSphere!==void 0?(E.boundingSphere===null&&E.computeBoundingSphere(),Fe.copy(E.boundingSphere.center)):(Ee.boundingSphere===null&&Ee.computeBoundingSphere(),Fe.copy(Ee.boundingSphere.center)),Fe.applyMatrix4(E.matrixWorld).applyMatrix4(oe)),Array.isArray(Oe)){let Re=Ee.groups;for(let Ge=0,Xe=Re.length;Ge<Xe;Ge++){let ze=Re[Ge],nt=Oe[ze.materialIndex];nt&&nt.visible&&m.push(E,Ee,nt,Q,Fe.z,ze)}}else Oe.visible&&m.push(E,Ee,Oe,Q,Fe.z,null)}}let de=E.children;for(let Ee=0,Oe=de.length;Ee<Oe;Ee++)Ve(de[Ee],V,Q,j)}function Qe(E,V,Q,j){let G=E.opaque,de=E.transmissive,Ee=E.transparent;d.setupLightsView(Q),me===!0&&fe.setGlobalState(x.clippingPlanes,Q),j&&Ae.viewport(U.copy(j)),G.length>0&&vt(G,V,Q),de.length>0&&vt(de,V,Q),Ee.length>0&&vt(Ee,V,Q),Ae.buffers.depth.setTest(!0),Ae.buffers.depth.setMask(!0),Ae.buffers.color.setMask(!0),Ae.setPolygonOffset(!1)}function st(E,V,Q,j){if((Q.isScene===!0?Q.overrideMaterial:null)!==null)return;d.state.transmissionRenderTarget[j.id]===void 0&&(d.state.transmissionRenderTarget[j.id]=new In(1,1,{generateMipmaps:!0,type:ye.has("EXT_color_buffer_half_float")||ye.has("EXT_color_buffer_float")?ls:Fn,minFilter:ai,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:rt.workingColorSpace}));let de=d.state.transmissionRenderTarget[j.id],Ee=j.viewport||U;de.setSize(Ee.z*x.transmissionResolutionScale,Ee.w*x.transmissionResolutionScale);let Oe=x.getRenderTarget(),Re=x.getActiveCubeFace(),Ge=x.getActiveMipmapLevel();x.setRenderTarget(de),x.getClearColor(H),z=x.getClearAlpha(),z<1&&x.setClearColor(16777215,.5),x.clear(),Be&&Le.render(Q);let Xe=x.toneMapping;x.toneMapping=wn;let ze=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),d.setupLightsView(j),me===!0&&fe.setGlobalState(x.clippingPlanes,j),vt(E,Q,j),Ze.updateMultisampleRenderTarget(de),Ze.updateRenderTargetMipmap(de),ye.has("WEBGL_multisampled_render_to_texture")===!1){let nt=!1;for(let ut=0,wt=V.length;ut<wt;ut++){let _t=V[ut],pt=_t.object,He=_t.geometry,Mt=_t.material,at=_t.group;if(Mt.side===Pt&&pt.layers.test(j.layers)){let jt=Mt.side;Mt.side=Zt,Mt.needsUpdate=!0,ct(pt,Q,j,He,Mt,at),Mt.side=jt,Mt.needsUpdate=!0,nt=!0}}nt===!0&&(Ze.updateMultisampleRenderTarget(de),Ze.updateRenderTargetMipmap(de))}x.setRenderTarget(Oe,Re,Ge),x.setClearColor(H,z),ze!==void 0&&(j.viewport=ze),x.toneMapping=Xe}function vt(E,V,Q){let j=V.isScene===!0?V.overrideMaterial:null;for(let G=0,de=E.length;G<de;G++){let Ee=E[G],Oe=Ee.object,Re=Ee.geometry,Ge=Ee.group,Xe=Ee.material;Xe.allowOverride===!0&&j!==null&&(Xe=j),Oe.layers.test(Q.layers)&&ct(Oe,V,Q,Re,Xe,Ge)}}function ct(E,V,Q,j,G,de){E.onBeforeRender(x,V,Q,j,G,de),E.modelViewMatrix.multiplyMatrices(Q.matrixWorldInverse,E.matrixWorld),E.normalMatrix.getNormalMatrix(E.modelViewMatrix),G.onBeforeRender(x,V,Q,j,E,de),G.transparent===!0&&G.side===Pt&&G.forceSinglePass===!1?(G.side=Zt,G.needsUpdate=!0,x.renderBufferDirect(Q,V,j,G,E,de),G.side=Kt,G.needsUpdate=!0,x.renderBufferDirect(Q,V,j,G,E,de),G.side=Pt):x.renderBufferDirect(Q,V,j,G,E,de),E.onAfterRender(x,V,Q,j,G,de)}function lt(E,V,Q){V.isScene!==!0&&(V=be);let j=we.get(E),G=d.state.lights,de=d.state.shadowsArray,Ee=G.state.version,Oe=te.getParameters(E,G.state,de,V,Q),Re=te.getProgramCacheKey(Oe),Ge=j.programs;j.environment=E.isMeshStandardMaterial?V.environment:null,j.fog=V.fog,j.envMap=(E.isMeshStandardMaterial?dt:gt).get(E.envMap||j.environment),j.envMapRotation=j.environment!==null&&E.envMap===null?V.environmentRotation:E.envMapRotation,Ge===void 0&&(E.addEventListener("dispose",Y),Ge=new Map,j.programs=Ge);let Xe=Ge.get(Re);if(Xe!==void 0){if(j.currentProgram===Xe&&j.lightsStateVersion===Ee)return Dt(E,Oe),Xe}else Oe.uniforms=te.getUniforms(E),E.onBeforeCompile(Oe,x),Xe=te.acquireProgram(Oe,Re),Ge.set(Re,Xe),j.uniforms=Oe.uniforms;let ze=j.uniforms;return(!E.isShaderMaterial&&!E.isRawShaderMaterial||E.clipping===!0)&&(ze.clippingPlanes=fe.uniform),Dt(E,Oe),j.needsLights=Rn(E),j.lightsStateVersion=Ee,j.needsLights&&(ze.ambientLightColor.value=G.state.ambient,ze.lightProbe.value=G.state.probe,ze.directionalLights.value=G.state.directional,ze.directionalLightShadows.value=G.state.directionalShadow,ze.spotLights.value=G.state.spot,ze.spotLightShadows.value=G.state.spotShadow,ze.rectAreaLights.value=G.state.rectArea,ze.ltc_1.value=G.state.rectAreaLTC1,ze.ltc_2.value=G.state.rectAreaLTC2,ze.pointLights.value=G.state.point,ze.pointLightShadows.value=G.state.pointShadow,ze.hemisphereLights.value=G.state.hemi,ze.directionalShadowMap.value=G.state.directionalShadowMap,ze.directionalShadowMatrix.value=G.state.directionalShadowMatrix,ze.spotShadowMap.value=G.state.spotShadowMap,ze.spotLightMatrix.value=G.state.spotLightMatrix,ze.spotLightMap.value=G.state.spotLightMap,ze.pointShadowMap.value=G.state.pointShadowMap,ze.pointShadowMatrix.value=G.state.pointShadowMatrix),j.currentProgram=Xe,j.uniformsList=null,Xe}function ft(E){if(E.uniformsList===null){let V=E.currentProgram.getUniforms();E.uniformsList=ps.seqWithValue(V.seq,E.uniforms)}return E.uniformsList}function Dt(E,V){let Q=we.get(E);Q.outputColorSpace=V.outputColorSpace,Q.batching=V.batching,Q.batchingColor=V.batchingColor,Q.instancing=V.instancing,Q.instancingColor=V.instancingColor,Q.instancingMorph=V.instancingMorph,Q.skinning=V.skinning,Q.morphTargets=V.morphTargets,Q.morphNormals=V.morphNormals,Q.morphColors=V.morphColors,Q.morphTargetsCount=V.morphTargetsCount,Q.numClippingPlanes=V.numClippingPlanes,Q.numIntersection=V.numClipIntersection,Q.vertexAlphas=V.vertexAlphas,Q.vertexTangents=V.vertexTangents,Q.toneMapping=V.toneMapping}function Lt(E,V,Q,j,G){V.isScene!==!0&&(V=be),Ze.resetTextureUnits();let de=V.fog,Ee=j.isMeshStandardMaterial?V.environment:null,Oe=O===null?x.outputColorSpace:O.isXRRenderTarget===!0?O.texture.colorSpace:yi,Re=(j.isMeshStandardMaterial?dt:gt).get(j.envMap||Ee),Ge=j.vertexColors===!0&&!!Q.attributes.color&&Q.attributes.color.itemSize===4,Xe=!!Q.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),ze=!!Q.morphAttributes.position,nt=!!Q.morphAttributes.normal,ut=!!Q.morphAttributes.color,wt=wn;j.toneMapped&&(O===null||O.isXRRenderTarget===!0)&&(wt=x.toneMapping);let _t=Q.morphAttributes.position||Q.morphAttributes.normal||Q.morphAttributes.color,pt=_t!==void 0?_t.length:0,He=we.get(j),Mt=d.state.lights;if(me===!0&&(k===!0||E!==S)){let Xt=E===S&&j.id===w;fe.setState(j,E,Xt)}let at=!1;j.version===He.__version?(He.needsLights&&He.lightsStateVersion!==Mt.state.version||He.outputColorSpace!==Oe||G.isBatchedMesh&&He.batching===!1||!G.isBatchedMesh&&He.batching===!0||G.isBatchedMesh&&He.batchingColor===!0&&G.colorTexture===null||G.isBatchedMesh&&He.batchingColor===!1&&G.colorTexture!==null||G.isInstancedMesh&&He.instancing===!1||!G.isInstancedMesh&&He.instancing===!0||G.isSkinnedMesh&&He.skinning===!1||!G.isSkinnedMesh&&He.skinning===!0||G.isInstancedMesh&&He.instancingColor===!0&&G.instanceColor===null||G.isInstancedMesh&&He.instancingColor===!1&&G.instanceColor!==null||G.isInstancedMesh&&He.instancingMorph===!0&&G.morphTexture===null||G.isInstancedMesh&&He.instancingMorph===!1&&G.morphTexture!==null||He.envMap!==Re||j.fog===!0&&He.fog!==de||He.numClippingPlanes!==void 0&&(He.numClippingPlanes!==fe.numPlanes||He.numIntersection!==fe.numIntersection)||He.vertexAlphas!==Ge||He.vertexTangents!==Xe||He.morphTargets!==ze||He.morphNormals!==nt||He.morphColors!==ut||He.toneMapping!==wt||He.morphTargetsCount!==pt)&&(at=!0):(at=!0,He.__version=j.version);let jt=He.currentProgram;at===!0&&(jt=lt(j,V,G));let Fi=!1,en=!1,ws=!1,St=jt.getUniforms(),ln=He.uniforms;if(Ae.useProgram(jt.program)&&(Fi=!0,en=!0,ws=!0),j.id!==w&&(w=j.id,en=!0),Fi||S!==E){Ae.buffers.depth.getReversed()&&E.reversedDepth!==!0&&(E._reversedDepth=!0,E.updateProjectionMatrix()),St.setValue(D,"projectionMatrix",E.projectionMatrix),St.setValue(D,"viewMatrix",E.matrixWorldInverse);let $t=St.map.cameraPosition;$t!==void 0&&$t.setValue(D,xe.setFromMatrixPosition(E.matrixWorld)),Te.logarithmicDepthBuffer&&St.setValue(D,"logDepthBufFC",2/(Math.log(E.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&St.setValue(D,"isOrthographic",E.isOrthographicCamera===!0),S!==E&&(S=E,en=!0,ws=!0)}if(G.isSkinnedMesh){St.setOptional(D,G,"bindMatrix"),St.setOptional(D,G,"bindMatrixInverse");let Xt=G.skeleton;Xt&&(Xt.boneTexture===null&&Xt.computeBoneTexture(),St.setValue(D,"boneTexture",Xt.boneTexture,Ze))}G.isBatchedMesh&&(St.setOptional(D,G,"batchingTexture"),St.setValue(D,"batchingTexture",G._matricesTexture,Ze),St.setOptional(D,G,"batchingIdTexture"),St.setValue(D,"batchingIdTexture",G._indirectTexture,Ze),St.setOptional(D,G,"batchingColorTexture"),G._colorsTexture!==null&&St.setValue(D,"batchingColorTexture",G._colorsTexture,Ze));let hn=Q.morphAttributes;if((hn.position!==void 0||hn.normal!==void 0||hn.color!==void 0)&&le.update(G,Q,jt),(en||He.receiveShadow!==G.receiveShadow)&&(He.receiveShadow=G.receiveShadow,St.setValue(D,"receiveShadow",G.receiveShadow)),j.isMeshGouraudMaterial&&j.envMap!==null&&(ln.envMap.value=Re,ln.flipEnvMap.value=Re.isCubeTexture&&Re.isRenderTargetTexture===!1?-1:1),j.isMeshStandardMaterial&&j.envMap===null&&V.environment!==null&&(ln.envMapIntensity.value=V.environmentIntensity),en&&(St.setValue(D,"toneMappingExposure",x.toneMappingExposure),He.needsLights&&gn(ln,ws),de&&j.fog===!0&&ce.refreshFogUniforms(ln,de),ce.refreshMaterialUniforms(ln,j,Z,ae,d.state.transmissionRenderTarget[E.id]),ps.upload(D,ft(He),ln,Ze)),j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(ps.upload(D,ft(He),ln,Ze),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&St.setValue(D,"center",G.center),St.setValue(D,"modelViewMatrix",G.modelViewMatrix),St.setValue(D,"normalMatrix",G.normalMatrix),St.setValue(D,"modelMatrix",G.matrixWorld),j.isShaderMaterial||j.isRawShaderMaterial){let Xt=j.uniformsGroups;for(let $t=0,Ia=Xt.length;$t<Ia;$t++){let ui=Xt[$t];L.update(ui,jt),L.bind(ui,jt)}}return jt}function gn(E,V){E.ambientLightColor.needsUpdate=V,E.lightProbe.needsUpdate=V,E.directionalLights.needsUpdate=V,E.directionalLightShadows.needsUpdate=V,E.pointLights.needsUpdate=V,E.pointLightShadows.needsUpdate=V,E.spotLights.needsUpdate=V,E.spotLightShadows.needsUpdate=V,E.rectAreaLights.needsUpdate=V,E.hemisphereLights.needsUpdate=V}function Rn(E){return E.isMeshLambertMaterial||E.isMeshToonMaterial||E.isMeshPhongMaterial||E.isMeshStandardMaterial||E.isShadowMaterial||E.isShaderMaterial&&E.lights===!0}this.getActiveCubeFace=function(){return A},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return O},this.setRenderTargetTextures=function(E,V,Q){let j=we.get(E);j.__autoAllocateDepthBuffer=E.resolveDepthBuffer===!1,j.__autoAllocateDepthBuffer===!1&&(j.__useRenderToTexture=!1),we.get(E.texture).__webglTexture=V,we.get(E.depthTexture).__webglTexture=j.__autoAllocateDepthBuffer?void 0:Q,j.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(E,V){let Q=we.get(E);Q.__webglFramebuffer=V,Q.__useDefaultFramebuffer=V===void 0};let Ui=D.createFramebuffer();this.setRenderTarget=function(E,V=0,Q=0){O=E,A=V,C=Q;let j=!0,G=null,de=!1,Ee=!1;if(E){let Re=we.get(E);if(Re.__useDefaultFramebuffer!==void 0)Ae.bindFramebuffer(D.FRAMEBUFFER,null),j=!1;else if(Re.__webglFramebuffer===void 0)Ze.setupRenderTarget(E);else if(Re.__hasExternalTextures)Ze.rebindTextures(E,we.get(E.texture).__webglTexture,we.get(E.depthTexture).__webglTexture);else if(E.depthBuffer){let ze=E.depthTexture;if(Re.__boundDepthTexture!==ze){if(ze!==null&&we.has(ze)&&(E.width!==ze.image.width||E.height!==ze.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");Ze.setupDepthRenderbuffer(E)}}let Ge=E.texture;(Ge.isData3DTexture||Ge.isDataArrayTexture||Ge.isCompressedArrayTexture)&&(Ee=!0);let Xe=we.get(E).__webglFramebuffer;E.isWebGLCubeRenderTarget?(Array.isArray(Xe[V])?G=Xe[V][Q]:G=Xe[V],de=!0):E.samples>0&&Ze.useMultisampledRTT(E)===!1?G=we.get(E).__webglMultisampledFramebuffer:Array.isArray(Xe)?G=Xe[Q]:G=Xe,U.copy(E.viewport),W.copy(E.scissor),J=E.scissorTest}else U.copy(ue).multiplyScalar(Z).floor(),W.copy(ge).multiplyScalar(Z).floor(),J=ie;if(Q!==0&&(G=Ui),Ae.bindFramebuffer(D.FRAMEBUFFER,G)&&j&&Ae.drawBuffers(E,G),Ae.viewport(U),Ae.scissor(W),Ae.setScissorTest(J),de){let Re=we.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_CUBE_MAP_POSITIVE_X+V,Re.__webglTexture,Q)}else if(Ee){let Re=V;for(let Ge=0;Ge<E.textures.length;Ge++){let Xe=we.get(E.textures[Ge]);D.framebufferTextureLayer(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0+Ge,Xe.__webglTexture,Q,Re)}}else if(E!==null&&Q!==0){let Re=we.get(E.texture);D.framebufferTexture2D(D.FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Re.__webglTexture,Q)}w=-1},this.readRenderTargetPixels=function(E,V,Q,j,G,de,Ee,Oe=0){if(!(E&&E.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Re=we.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ee!==void 0&&(Re=Re[Ee]),Re){Ae.bindFramebuffer(D.FRAMEBUFFER,Re);try{let Ge=E.textures[Oe],Xe=Ge.format,ze=Ge.type;if(!Te.textureFormatReadable(Xe)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!Te.textureTypeReadable(ze)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}V>=0&&V<=E.width-j&&Q>=0&&Q<=E.height-G&&(E.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Oe),D.readPixels(V,Q,j,G,N.convert(Xe),N.convert(ze),de))}finally{let Ge=O!==null?we.get(O).__webglFramebuffer:null;Ae.bindFramebuffer(D.FRAMEBUFFER,Ge)}}},this.readRenderTargetPixelsAsync=async function(E,V,Q,j,G,de,Ee,Oe=0){if(!(E&&E.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Re=we.get(E).__webglFramebuffer;if(E.isWebGLCubeRenderTarget&&Ee!==void 0&&(Re=Re[Ee]),Re)if(V>=0&&V<=E.width-j&&Q>=0&&Q<=E.height-G){Ae.bindFramebuffer(D.FRAMEBUFFER,Re);let Ge=E.textures[Oe],Xe=Ge.format,ze=Ge.type;if(!Te.textureFormatReadable(Xe))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!Te.textureTypeReadable(ze))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let nt=D.createBuffer();D.bindBuffer(D.PIXEL_PACK_BUFFER,nt),D.bufferData(D.PIXEL_PACK_BUFFER,de.byteLength,D.STREAM_READ),E.textures.length>1&&D.readBuffer(D.COLOR_ATTACHMENT0+Oe),D.readPixels(V,Q,j,G,N.convert(Xe),N.convert(ze),0);let ut=O!==null?we.get(O).__webglFramebuffer:null;Ae.bindFramebuffer(D.FRAMEBUFFER,ut);let wt=D.fenceSync(D.SYNC_GPU_COMMANDS_COMPLETE,0);return D.flush(),await wh(D,wt,4),D.bindBuffer(D.PIXEL_PACK_BUFFER,nt),D.getBufferSubData(D.PIXEL_PACK_BUFFER,0,de),D.deleteBuffer(nt),D.deleteSync(wt),de}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(E,V=null,Q=0){let j=Math.pow(2,-Q),G=Math.floor(E.image.width*j),de=Math.floor(E.image.height*j),Ee=V!==null?V.x:0,Oe=V!==null?V.y:0;Ze.setTexture2D(E,0),D.copyTexSubImage2D(D.TEXTURE_2D,Q,0,0,Ee,Oe,G,de),Ae.unbindTexture()};let Sr=D.createFramebuffer(),br=D.createFramebuffer();this.copyTextureToTexture=function(E,V,Q=null,j=null,G=0,de=null){de===null&&(G!==0?(es("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),de=G,G=0):de=0);let Ee,Oe,Re,Ge,Xe,ze,nt,ut,wt,_t=E.isCompressedTexture?E.mipmaps[de]:E.image;if(Q!==null)Ee=Q.max.x-Q.min.x,Oe=Q.max.y-Q.min.y,Re=Q.isBox3?Q.max.z-Q.min.z:1,Ge=Q.min.x,Xe=Q.min.y,ze=Q.isBox3?Q.min.z:0;else{let hn=Math.pow(2,-G);Ee=Math.floor(_t.width*hn),Oe=Math.floor(_t.height*hn),E.isDataArrayTexture?Re=_t.depth:E.isData3DTexture?Re=Math.floor(_t.depth*hn):Re=1,Ge=0,Xe=0,ze=0}j!==null?(nt=j.x,ut=j.y,wt=j.z):(nt=0,ut=0,wt=0);let pt=N.convert(V.format),He=N.convert(V.type),Mt;V.isData3DTexture?(Ze.setTexture3D(V,0),Mt=D.TEXTURE_3D):V.isDataArrayTexture||V.isCompressedArrayTexture?(Ze.setTexture2DArray(V,0),Mt=D.TEXTURE_2D_ARRAY):(Ze.setTexture2D(V,0),Mt=D.TEXTURE_2D),D.pixelStorei(D.UNPACK_FLIP_Y_WEBGL,V.flipY),D.pixelStorei(D.UNPACK_PREMULTIPLY_ALPHA_WEBGL,V.premultiplyAlpha),D.pixelStorei(D.UNPACK_ALIGNMENT,V.unpackAlignment);let at=D.getParameter(D.UNPACK_ROW_LENGTH),jt=D.getParameter(D.UNPACK_IMAGE_HEIGHT),Fi=D.getParameter(D.UNPACK_SKIP_PIXELS),en=D.getParameter(D.UNPACK_SKIP_ROWS),ws=D.getParameter(D.UNPACK_SKIP_IMAGES);D.pixelStorei(D.UNPACK_ROW_LENGTH,_t.width),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,_t.height),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Ge),D.pixelStorei(D.UNPACK_SKIP_ROWS,Xe),D.pixelStorei(D.UNPACK_SKIP_IMAGES,ze);let St=E.isDataArrayTexture||E.isData3DTexture,ln=V.isDataArrayTexture||V.isData3DTexture;if(E.isDepthTexture){let hn=we.get(E),Xt=we.get(V),$t=we.get(hn.__renderTarget),Ia=we.get(Xt.__renderTarget);Ae.bindFramebuffer(D.READ_FRAMEBUFFER,$t.__webglFramebuffer),Ae.bindFramebuffer(D.DRAW_FRAMEBUFFER,Ia.__webglFramebuffer);for(let ui=0;ui<Re;ui++)St&&(D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,we.get(E).__webglTexture,G,ze+ui),D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,we.get(V).__webglTexture,de,wt+ui)),D.blitFramebuffer(Ge,Xe,Ee,Oe,nt,ut,Ee,Oe,D.DEPTH_BUFFER_BIT,D.NEAREST);Ae.bindFramebuffer(D.READ_FRAMEBUFFER,null),Ae.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else if(G!==0||E.isRenderTargetTexture||we.has(E)){let hn=we.get(E),Xt=we.get(V);Ae.bindFramebuffer(D.READ_FRAMEBUFFER,Sr),Ae.bindFramebuffer(D.DRAW_FRAMEBUFFER,br);for(let $t=0;$t<Re;$t++)St?D.framebufferTextureLayer(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,hn.__webglTexture,G,ze+$t):D.framebufferTexture2D(D.READ_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,hn.__webglTexture,G),ln?D.framebufferTextureLayer(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,Xt.__webglTexture,de,wt+$t):D.framebufferTexture2D(D.DRAW_FRAMEBUFFER,D.COLOR_ATTACHMENT0,D.TEXTURE_2D,Xt.__webglTexture,de),G!==0?D.blitFramebuffer(Ge,Xe,Ee,Oe,nt,ut,Ee,Oe,D.COLOR_BUFFER_BIT,D.NEAREST):ln?D.copyTexSubImage3D(Mt,de,nt,ut,wt+$t,Ge,Xe,Ee,Oe):D.copyTexSubImage2D(Mt,de,nt,ut,Ge,Xe,Ee,Oe);Ae.bindFramebuffer(D.READ_FRAMEBUFFER,null),Ae.bindFramebuffer(D.DRAW_FRAMEBUFFER,null)}else ln?E.isDataTexture||E.isData3DTexture?D.texSubImage3D(Mt,de,nt,ut,wt,Ee,Oe,Re,pt,He,_t.data):V.isCompressedArrayTexture?D.compressedTexSubImage3D(Mt,de,nt,ut,wt,Ee,Oe,Re,pt,_t.data):D.texSubImage3D(Mt,de,nt,ut,wt,Ee,Oe,Re,pt,He,_t):E.isDataTexture?D.texSubImage2D(D.TEXTURE_2D,de,nt,ut,Ee,Oe,pt,He,_t.data):E.isCompressedTexture?D.compressedTexSubImage2D(D.TEXTURE_2D,de,nt,ut,_t.width,_t.height,pt,_t.data):D.texSubImage2D(D.TEXTURE_2D,de,nt,ut,Ee,Oe,pt,He,_t);D.pixelStorei(D.UNPACK_ROW_LENGTH,at),D.pixelStorei(D.UNPACK_IMAGE_HEIGHT,jt),D.pixelStorei(D.UNPACK_SKIP_PIXELS,Fi),D.pixelStorei(D.UNPACK_SKIP_ROWS,en),D.pixelStorei(D.UNPACK_SKIP_IMAGES,ws),de===0&&V.generateMipmaps&&D.generateMipmap(Mt),Ae.unbindTexture()},this.initRenderTarget=function(E){we.get(E).__webglFramebuffer===void 0&&Ze.setupRenderTarget(E)},this.initTexture=function(E){E.isCubeTexture?Ze.setTextureCube(E,0):E.isData3DTexture?Ze.setTexture3D(E,0):E.isDataArrayTexture||E.isCompressedArrayTexture?Ze.setTexture2DArray(E,0):Ze.setTexture2D(E,0),Ae.unbindTexture()},this.resetState=function(){A=0,C=0,O=null,Ae.reset(),T.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=rt._getDrawingBufferColorSpace(e),t.unpackColorSpace=rt._getUnpackColorSpace()}};var Zn=(i,e=0,t=1)=>Math.max(e,Math.min(t,Number.isFinite(i)?i:e)),Pi=(i,e,t)=>i+(e-i)*t,gs=i=>{let e=Zn(i);return e*e*(3-2*e)},_s=(i,e,t)=>Math.exp(-Math.pow((i-e)/t,2)),U0=Object.freeze({path:"production/animation-look-study/turnaround-auxiliary-v2.png",size:[2043,770],role:"Generated auxiliary side view used only to estimate hidden depth",calibration:{eyeRow:248,chinRow:308,pixelsPerUnit:157,depthReferencePixelX:1156,depthReferenceZ:.42,facing:"left"},observations:[{name:"forehead",pixel:[1158,210],y:.242,z:.407},{name:"upper nose bridge",pixel:[1156,235],y:.083,z:.42},{name:"lower nose bridge",pixel:[1152,250],y:-.013,z:.445},{name:"nose tip",pixel:[1141,260],y:-.076,z:.515},{name:"nose base",pixel:[1143,270],y:-.14,z:.503},{name:"lip plane",pixel:[1146,280],y:-.204,z:.484},{name:"lower lip / front chin",pixel:[1152,290],y:-.267,z:.445},{name:"lower front chin",pixel:[1160,300],y:-.331,z:.394},{name:"chin",pixel:[1166,305],y:-.363,z:.356},{name:"lowest chin",pixel:[1171,308],y:-.382,z:.324}],uncertainty:"Approximate skin-contour observations; hair occludes the forehead and rear jaw. Absolute depth and camera yaw are inferred, not measured."});function fr(i){let e=i.length,t=new Float64Array(e),n=new Float64Array(e-1),s=new Float64Array(e-1);for(let r=0;r<e-1;r++)n[r]=i[r+1][0]-i[r][0],s[r]=(i[r+1][1]-i[r][1])/n[r];t[0]=s[0],t[e-1]=s[e-2];for(let r=1;r<e-1;r++)if(s[r-1]*s[r]<=0)t[r]=0;else{let o=2*n[r]+n[r-1],a=n[r]+2*n[r-1];t[r]=(o+a)/(o/s[r-1]+a/s[r])}return r=>{if(r<=i[0][0])return i[0][1];if(r>=i[e-1][0])return i[e-1][1];let o=0,a=e-1;for(;a-o>1;){let u=o+a>>1;i[u][0]<=r?o=u:a=u}let l=(r-i[o][0])/n[o],c=l*l,h=c*l;return(2*h-3*c+1)*i[o][1]+(h-2*c+l)*n[o]*t[o]+(-2*h+3*c)*i[a][1]+(h-c)*n[o]*t[a]}}var F0=fr([[-.382,.324],[-.363,.356],[-.331,.394],[-.267,.445],[-.204,.484],[-.14,.503],[-.108,.51],[-.076,.515],[-.045,.465],[-.013,.445],[.083,.42],[.242,.407],[.36,.385],[.5,.28],[.6,.13],[.64,.015]]),N0=fr([[-.382,.324],[-.331,.361],[-.267,.389],[-.204,.413],[-.14,.429],[-.076,.436],[0,.441],[.083,.42],[.242,.407],[.36,.385],[.5,.28],[.6,.13],[.64,.015]]),O0=fr([[-.382,.324],[-.363,.304],[-.331,.248],[-.267,.16],[-.204,.09],[-.14,.04],[-.076,.018],[.05,.015],[.64,.015]]),B0=fr([[-.382,0],[-.363,.09],[-.331,.15],[-.267,.225],[-.14,.3],[0,.33],[.2,.34],[.4,.28],[.6,.12],[.64,0]]),z0=fr([[-.382,.023],[-.267,.033],[-.204,.035],[-.076,.066],[.05,.025],[.2,0],[.64,0]]),au=Object.freeze({strength:1,noseProjection:0,lipProjection:0,chinProjection:0,noseCenterX:.066,lipCenterX:.035,noseWidth:.095,lipWidth:.16,cheekExponent:.25}),k0=Object.freeze({strength:"0 retains the previous depth; 1 uses this candidate. Start side QA at .65, then compare 1.",noseProjection:"Additional nose depth in local units; suggested tuning range -.025 to +.025.",lipProjection:"Additional lip depth; suggested tuning range -.020 to +.020.",chinProjection:"Advances the entire lower closing jaw and seam together; suggested -.040 to +.040.",noseCenterX:"Align the 3D nose with the original painted nose, approximately local X +.066.",lipCenterX:"Original painted mouth axis, approximately local X +.035.",noseWidth:"Nose deformation falloff width; suggested .075 to .120. Does not widen X/Y geometry.",lipWidth:"Lower-face feature falloff width; suggested .130 to .190.",cheekExponent:"Lateral cheek curvature; .25 retains the current upper-face cross section."});function H0(i={}){let e={...au,...i};for(let t of Object.keys(au))if(!Number.isFinite(e[t]))throw new TypeError(`Invalid face profile parameter: ${t}`);return e.strength=Zn(e.strength),e.noseWidth=Zn(e.noseWidth,.03,.25),e.lipWidth=Zn(e.lipWidth,.05,.3),e.cheekExponent=Zn(e.cheekExponent,.1,1),e}function cu(i,e){let t=Zn(i,-.382,.64),n=e.chinProjection*gs((-.245-t)/.137),s=gs((t- -.382)/.035)*gs((.64-t)/.04),r=e.noseProjection*_s(t,-.076,.06)+e.lipProjection*_s(t,-.204,.075),o=z0(t)+(e.noseCenterX-.066)*_s(t,-.076,.065)+(e.lipCenterX-.035)*_s(t,-.204,.075),a=gs((-.105-t)/.145);return{y:t,midlineZ:F0(t)+n+r*s,baseCenterZ:N0(t)+n,seamZ:O0(t)+n,rearDepth:B0(t),axisX:o,featureWidth:Pi(e.noseWidth,e.lipWidth,a)}}function lu({halfWidthAt:i,centerAt:e=()=>0,installed:t=!1,...n}={}){if(typeof i!="function"||typeof e!="function")throw new TypeError("Pass the existing halfWidthAt(y) and centerAt(y) silhouette functions");let s=H0(n),r=d=>{let M=cu(d,s),v=Number(i(M.y)),x=Number(e(M.y));if(!Number.isFinite(v)||!Number.isFinite(x)||v<0)throw new RangeError("Invalid existing frontal silhouette section");let P=(M.y-.129)/.511,A=.43-.07*gs((-.1-M.y)/.282)-.045*gs((M.y-.3)/.34);return{...M,width:v,center:x,legacyDepth:A*Math.pow(Math.max(0,1-P*P),.2),legacyNose:.019*_s(M.y,-.08,.068)}},o=1024,a=["midlineZ","baseCenterZ","seamZ","rearDepth","axisX","featureWidth","width","center","legacyDepth","legacyNose"],l=Object.fromEntries(a.map(d=>[d,new Float64Array(o+1)]));for(let d=0;d<=o;d++){let M=r(Pi(-.382,.64,d/o));for(let v of a)l[v][d]=M[v]}let c={y:0};function h(d){let M=Zn(d,-.382,.64),v=(M- -.382)/(.64- -.382)*o,x=Math.min(o-1,Math.floor(v)),P=v-x;c.y=M;for(let A of a)c[A]=Pi(l[A][x],l[A][x+1],P);return c.width<.05&&(c.width=i(M),c.center=e(M)),c}function u(d,M){if(d.width<1e-8)return 0;let v=(M-d.center)/d.width;if(Math.abs(v)>.96){let x=i(d.y);v=x>1e-8?(M-e(d.y))/x:0}return v=Zn(v,-1,1),Math.abs(v)>1-1e-6?Math.sign(v):v}function f(d,M,v,x){return .015+M.legacyDepth*(x??Math.pow(Math.max(0,1-v*v),.25))+M.legacyNose*_s(d,.02,.075)}function p(d,M){let v=h(M),x=u(v,d);if(Math.abs(x)===1)return Pi(.015,v.seamZ,s.strength);if(s.strength===0)return f(d,v,x);let P=Math.pow(Math.max(0,1-x*x),s.cheekExponent),A=v.seamZ+(v.baseCenterZ-v.seamZ)*P,C=Zn(v.axisX,v.center-v.width,v.center+v.width),O=u(v,C),w=v.seamZ+(v.baseCenterZ-v.seamZ)*Math.pow(Math.max(0,1-O*O),s.cheekExponent),S=d>=C?v.center+v.width-C:C-(v.center-v.width),U=S>1e-8?(d-C)/S:0,W=Math.exp(-Math.pow((d-C)/v.featureWidth,4))*Math.sqrt(Math.max(0,1-U*U)),J=A+(v.midlineZ-w)*W;return s.strength===1?J:Pi(f(d,v,x,s.cheekExponent===.25?P:void 0),J,s.strength)}function g(d,M){let v=h(M),x=u(v,d),P=Math.sqrt(Math.max(0,1-x*x)),A=.015-.33*Math.sqrt(Math.max(0,1-Math.pow((v.y-.129)/.511,2)))*P;return Pi(A,v.seamZ-v.rearDepth*P,s.strength)}function _(d){return Pi(.015,h(d).seamZ,s.strength)}let m={type:"optional-anime-profile-volume",installed:!!t,validatedAt90Degrees:!1,reference:U0,parameters:{...s},parameterHelp:k0,frontalInvariants:["Existing vertex X/Y coordinates","Original UV coordinates and reference pixels","Existing eye/mouth apertures and dynamic topology"],integration:["Create this volume with the original widthAt/centerAt functions.","Use frontZ for every existing face layer; keep current per-layer Z offsets and alpha seam blend.","Use backZ in backGeometry, retaining its existing X/Y rows. Both edges use boundaryZ.","Recompute changed geometry bounds/normals. Keep scalp geometry independently volumetric."],limitations:["Auxiliary side depth is inferred and has not passed rendered 90\xB0 QA.","Perspective projection can change apparent frontal size after Z edits even though geometric X/Y and UV are unchanged.","This only closes the face shell. It does not fix scalp, hair, ear or body side topology."],closure:{minY:-.382,maxY:.64,sharedSeam:!0,chinZ:_(-.382),crownZ:_(.64)},implementation:{sectionSamples:o+1,interpolation:"linear precomputed sections; exact silhouette evaluation near boundary"}};return{frontZ:p,backZ:g,boundaryZ:_,faceDepthProfile:d=>cu(d,s).midlineZ,sample:r,metadata:m}}var jc=Object.freeze({width:1920,height:1080,origin:[815,583],pixelsPerUnit:775,tilt:.06,path:"references/video-covers/BV1g2JX6HEHX.jpg",eyes:[{name:"left",aperture:[615,588],iris:[634.5,590],irisRadius:[74.5,87],width:.151},{name:"right",aperture:[1020,569],iris:[1003.5,569],irisRadius:[63.5,82],width:.139}]}),el=Math.PI*2,va=Math.cos(.06),Ma=Math.sin(.06),At=(i,e=0,t=1)=>Math.min(t,Math.max(e,Number.isFinite(i)?i:0)),Tt=(i,e,t)=>i+(e-i)*t,Ms=i=>i*i*(3-2*i),V0="#c8b9a9";function xs(i,e){return[(va*(i-815)-Ma*(e-583))/775,(-Ma*(i-815)-va*(e-583))/775]}function pu(i,e){return[815+775*(va*i-Ma*e),583-775*(Ma*i+va*e)]}var kt=[];function tl(i,e,t,n,s=24){for(let r=kt.length?1:0;r<=s;r++){let o=r/s,a=1-o;kt.push([a*a*a*i[0]+3*a*a*o*e[0]+3*a*o*o*t[0]+o*o*o*n[0],a*a*a*i[1]+3*a*a*o*e[1]+3*a*o*o*t[1]+o*o*o*n[1]])}}tl([0,.64],[.39,.64],[.6,.44],[.6,.2]);tl([.6,.2],[.6,.04],[.54,-.1],[.41,-.245]);tl([.41,-.245],[.3,-.345],[.12,-.382],[.023,-.382]);var ya=[...kt,...kt.slice(1,-1).reverse().map(([i,e])=>[-i+.046*Ms(At((-e-.1)/.282)),e])];function nl(i){let e=At(i,-.382,.64),t=0,n=kt.length-1;for(;n-t>1;){let a=t+n>>1;kt[a][1]>=e?t=a:n=a}let s=kt[t][1],r=kt[n][1],o=s===r?0:(s-e)/(s-r);return Tt(.023*Ms(At((-s-.1)/.282)),.023*Ms(At((-r-.1)/.282)),o)}function mu(i){let e=At(i,-.382,.64),t=0,n=kt.length-1;for(;n-t>1;){let l=t+n>>1;kt[l][1]>=e?t=l:n=l}let[s,r]=kt[t],[o,a]=kt[n];return Math.max(1e-4,Tt(s,o,r===a?0:(r-e)/(r-a))-nl(e))}var Sa=lu({halfWidthAt:mu,centerAt:nl,strength:.65,installed:!0});function Ss(i,e){return Sa.frontZ(i,e)}var G0=[[476,573],[522,500],[573,422],[632,305],[662,418],[704,494],[756,532],[793,559],[780,574],[817,570],[840,551],[866,572],[915,568],[892,542],[911,465],[938,363],[953,292],[981,379],[1045,426],[1099,462],[1140,510],[1168,581],[1153,661],[1127,711],[1084,716],[1107,737],[1145,743],[1115,790],[1072,820],[976,855],[912,858],[896,848],[802,848],[783,864],[740,867],[623,849],[549,818],[521,791],[580,768],[532,758],[499,721],[477,667],[463,608]],hu=G0.map(i=>xs(...i)),uu=[{upper:[[499,607],[516,557],[542,521],[578,496],[618,487],[656,492],[689,514],[709,551],[724,598]],lower:[[499,607],[519,634],[550,659],[591,677],[639,682],[684,666],[713,642],[724,598]]},{upper:[[916,573],[926,529],[948,495],[978,474],[1010,470],[1040,481],[1067,507],[1088,541],[1104,592]],lower:[[916,573],[924,597],[940,622],[971,648],[1008,651],[1057,650],[1083,630],[1104,592]]}],xr=jc.eyes.map((i,e)=>({...i,index:e,center:xs(...i.aperture),irisCenter:xs(...i.iris),outerX:e===0?.198:.185,outerTop:.205,outerBottom:.147,upper:uu[e].upper.map(t=>xs(...t)),lower:uu[e].lower.map(t=>xs(...t))}));for(let i of xr)i.minX=i.upper[0][0],i.maxX=i.upper.at(-1)[0];var pn=xs(852,741),ys={center:pn,rx:.108,top:.056,bottom:.078};function gu(i,e,t,n,s,r){let o=Math.sin(r);return[i+t*Math.cos(r),e+(o>=0?n:s)*o]}function _u(i,e,t=0){return gu(...i.center,i.outerX+t,i.outerTop+t,i.outerBottom+t,e)}function xu(i,e=0){return gu(...pn,ys.rx+e,ys.top+e,ys.bottom+e,i)}function du(i,e,t){let n=!1;for(let s=0,r=t.length-1;s<t.length;r=s++){let[o,a]=t[s],[l,c]=t[r];a>e!=c>e&&i<(l-o)*(e-a)/(c-a)+o&&(n=!n)}return n}function fu(i,e,t=0){for(let s of xr){let r=e-s.center[1],o=r>=0?s.outerTop:s.outerBottom;if(((i-s.center[0])/(s.outerX+t))**2+(r/(o+t))**2<1)return!0}let n=e-pn[1];return((i-pn[0])/(ys.rx+t))**2+(n/((n>=0?ys.top:ys.bottom)+t))**2<1}function Di(i,e,t,n){let s=new It;return s.setAttribute("position",new Je(i,3)),t&&s.setAttribute("uv",new Je(t,2)),n&&s.setAttribute("color",new Je(n,3)),e&&s.setIndex(e),s.computeVertexNormals(),s.computeBoundingSphere(),s}var W0=new qe;function yu(i,e){let t=Math.exp(-(((i+.29)/.17)**2)-((e+.17)/.105)**2)+1.08*Math.exp(-(((i-.32)/.16)**2)-((e+.17)/.105)**2),n=Math.max(i,0)*12;return W0.setRGB(At((205-16*i+10*Math.min(e,0)+4*t-n)/255),At((193-15*i+7*Math.min(e,0)-25*t-n)/255),At((177-17*i+6*Math.min(e,0)-29*t-n)/255),Ut)}function X0(i){let e=i.getAttribute("position"),t=new Float32Array(e.count*3);for(let n=0;n<e.count;n++){let s=yu(e.getX(n),e.getY(n));t.set([s.r,s.g,s.b],n*3)}return i.setAttribute("color",new Je(t,3)),i}function q0(){let i=new Xn(ya.map(([c,h])=>new Ue(c,h))),e=([c,h])=>`${Math.fround(c)},${Math.fround(h)}`,t=(c,h)=>{let u=e(c),f=e(h);return u<f?`${u}|${f}`:`${f}|${u}`},n=new Set(ya.map((c,h)=>t(c,ya[(h+1)%ya.length])));for(let c of xr){let h=Array.from({length:96},(u,f)=>new Ue(..._u(c,-f/96*el)));i.holes.push(new Ln(h))}i.holes.push(new Ln(Array.from({length:64},(c,h)=>new Ue(...xu(-h/64*el)))));let s=new ir(i,24).toNonIndexed(),r=s.getAttribute("position"),o=[],a=8,l=(c,h,u)=>{for(let f of[c,h,u])o.push(f[0],f[1],f[2]?Sa.boundaryZ(f[1]):Ss(f[0],f[1]))};for(let c=0;c<r.count;c+=3){let h=[r.getX(c),r.getY(c)],u=[r.getX(c+1),r.getY(c+1)],f=[r.getX(c+2),r.getY(c+2)],p=n.has(t(h,u)),g=n.has(t(h,f)),_=n.has(t(u,f)),m=(d,M)=>[h[0]+(u[0]-h[0])*d/a+(f[0]-h[0])*M/a,h[1]+(u[1]-h[1])*d/a+(f[1]-h[1])*M/a,M===0&&p||d===0&&g||d+M===a&&_];for(let d=0;d<a;d++)for(let M=0;M<a-d;M++)l(m(d,M),m(d+1,M),m(d,M+1)),d+M<a-1&&l(m(d+1,M),m(d+1,M+1),m(d,M+1))}return s.dispose(),X0(Di(o))}function Y0(i,e){let t=[],n=[],h=.005511363636363636,u=(.4- -.38)/136,f=p=>{let g=p.reduce((_,m)=>[_[0]+m[0]/3,_[1]+m[1]/3],[0,0]);if(!(!du(...g,hu)||fu(...g,.002))&&!p.some(_=>!du(..._,hu)||fu(..._,.001)))for(let[_,m]of p){t.push(_,m,Ss(_,m)+.0012);let[d,M]=pu(_,m);n.push(d/i,1-M/e)}};for(let p=0;p<136;p++)for(let g=0;g<176;g++){let _=-.48+g*h,m=-.38+p*u;f([[_,m],[_+h,m],[_,m+u]]),f([[_+h,m],[_+h,m+u],[_,m+u]])}return Di(t,null,n)}function Z0(){let i=[],e=[],t=[];for(let r=0;r<kt.length-1;r++)for(let o=0;o<8;o++)t.push(Tt(kt[r][1],kt[r+1][1],o/8));t.push(kt.at(-1)[1]),t.reverse();let s=t.length-1;for(let r=0;r<=s;r++){let o=t[r],a=r===0||r===s?0:mu(o),l=nl(o);for(let c=0;c<=32;c++){let h=c/32*Math.PI,u=l+a*Math.cos(h);if(i.push(u,o,Sa.backZ(u,o)),r<s&&c<32){let f=r*33+c;e.push(f,f+32+1,f+1,f+1,f+32+1,f+32+2)}}}return Di(i,e)}function pr(i=96,e=8,t=!1){let n=new Float32Array((i+1)*(e+1)*3),s=[];for(let o=0;o<e;o++)for(let a=0;a<i;a++){let l=o*(i+1)+a;s.push(l,l+i+1,l+1,l+1,l+i+1,l+i+2)}let r=Di(n,s,t?new Float32Array((i+1)*(e+1)*2):null);return r.getAttribute("position").setUsage(fn),r.boundingSphere=new dn(new I(0,.1,.2),1),r.userData={segments:i,rings:e},r}function mr(i,e,t,n,s=!1){let{segments:r,rings:o}=i.userData,a=i.getAttribute("position"),l=0,c=i.getAttribute("color");s&&!c&&(c=new Je(new Float32Array(a.count*4),4).setUsage(fn),i.setAttribute("color",c));for(let h=0;h<=o;h++)for(let u=0;u<=r;u++){let f=u/r*el,p=e(f),g=t(f),_=h/o,m=Tt(p[0],g[0],_),d=Tt(p[1],g[1],_);if(a.setXYZ(l,m,d,Ss(m,d)+n),s){let M=yu(m,d),v=Ms(At(Math.hypot(m-p[0],d-p[1])/.017));c.setXYZW(l,M.r,M.g,M.b,v)}l++}s&&(c.needsUpdate=!0),a.needsUpdate=!0}function $0(i,e){for(let t=0;t<i.length-1;t++)if(e<=i[t+1][0]){let n=At((e-i[t][0])/(i[t+1][0]-i[t][0])),s=i[Math.max(0,t-1)][1],r=i[t][1],o=i[t+1][1],a=i[Math.min(i.length-1,t+2)][1];return .5*(2*r+(-s+o)*n+(2*s-5*r+4*o-a)*n*n+(-s+3*r-3*o+a)*n*n*n)}return i.at(-1)[1]}function vs(i,e,t,n){let s=Tt(i.minX,i.maxX,(e+1)/2),r=Math.pow(Math.max(0,1-e*e),.6),a=Tt(i.upper[0][1],i.upper.at(-1)[1],(e+1)/2)+(.013+.02*n.happy-.006*n.sad)*r,l=$0(t?i.upper:i.lower,s)+(t?-.022*n.happy-.018*n.sad:.022*n.happy)*r;return Tt(l,a,n.blink)}function J0(i,e,t){let n=Math.cos(e),s=Math.sin(e)>=0;return[Tt(i.minX,i.maxX,(n+1)/2),vs(i,n,s,t)]}function gr(i=80){let e=new Float32Array((i+1)*2*3),t=[];for(let s=0;s<i;s++){let r=s*2;t.push(r,r+2,r+1,r+1,r+2,r+3)}let n=Di(e,t);return n.getAttribute("position").setUsage(fn),n.boundingSphere=new dn(new I(0,.1,.2),1),n.userData={steps:i},n}function _r(i,e,t,n){let s=i.getAttribute("position"),{steps:r}=i.userData;for(let o=0;o<=r;o++){let a=o/r,l=e(At(a-5e-4)),c=e(At(a+5e-4)),h=e(a),u=c[0]-l[0],f=c[1]-l[1],p=Math.hypot(u,f)||1,g=typeof t=="function"?t(a):t;for(let _=0;_<2;_++){let m=_===0?-1:1,d=h[0]-f/p*g*m/2,M=h[1]+u/p*g*m/2;s.setXYZ(o*2+_,d,M,Ss(d,M)+n)}}s.needsUpdate=!0}function K0(i=38,e=42){let t=new Float32Array((i+1)*(e+1)*3),n=new Float32Array((i+1)*(e+1)*2),s=[];for(let o=0;o<i;o++)for(let a=0;a<e;a++){let l=o*(e+1)+a;s.push(l,l+1,l+e+1,l+1,l+e+2,l+e+1)}let r=Di(t,s,n);return r.getAttribute("position").setUsage(fn),r.getAttribute("uv").setUsage(fn),r.boundingSphere=new dn(new I(0,.1,.2),1),r.userData={rows:i,cols:e},r}function Q0(i,e,t,n,s){let{rows:r,cols:o}=i.userData,a=i.getAttribute("position"),l=i.getAttribute("uv"),c=e.irisRadius[0]/775,h=e.irisRadius[1]/775,u=t.gazeX*.014,f=t.gazeY*.01,p=e.irisCenter[0]+u,g=e.irisCenter[1]+f;for(let _=0;_<=r;_++)for(let m=0;m<=o;m++){let d=m/o*2-1,M=p+d*c,v=h*Math.sqrt(Math.max(0,1-d*d)),x=At((M-e.minX)/(e.maxX-e.minX)*2-1,-1,1),P=Math.max(g-v,vs(e,x,!1,t)+3e-4),A=Math.min(g+v,vs(e,x,!0,t)-3e-4),C=Tt(P,Math.max(P,A),_/r),O=_*(o+1)+m;a.setXYZ(O,M,C,Ss(M,C)+.0048);let[w,S]=pu(M-u,C-f);l.setXY(O,w/n,1-S/s)}a.needsUpdate=!0,l.needsUpdate=!0}function j0(i,e){let t=Math.cos(i),n=Math.sqrt(Math.max(0,1-t*t)),s=Math.sin(i)>=0,r=e.happy,o=e.sad,a=.073+.009*r+.016*e.talk,l=(.01+.009*r-.017*o)*(t*t-.45),c=.009*e.talk*n,h=-(.053*e.talk+.012*r)*n;return[pn[0]+t*a,pn[1]+l+(s?c:h)]}function vu({head:i,resources:e,texture:t,sourceWidth:n=1920,sourceHeight:s=1080}={}){if(!i?.add)throw new TypeError("createPaintedFace requires a Three.js head Object3D");if(!t?.isTexture)throw new TypeError("createPaintedFace requires the loaded original reference texture");if(!(n>0&&s>0))throw new RangeError("Invalid source texture dimensions");let r=new Bt;r.name="painted-face",i.add(r);let o=new Set,a=!1,l=ee=>(o.add(ee),e?.add&&e.add(ee),ee),c=(ee,re={})=>{let ue=l(new Gt({color:V0,side:Pt,toneMapped:!1,...re}));return ue.name=ee,ue},h=(ee,re,ue)=>{l(re);let ge=new Et(re,ue);return ge.name=ee,r.add(ge),ge};t.colorSpace=Ut;let u=c("unpainted skin volume"),f=c("source-fitted skin lighting and blush",{color:16777215,vertexColors:!0}),p=c("source-fitted skin with blended exterior",{color:16777215,vertexColors:!0,transparent:!0,depthWrite:!1}),g=c("original unmodified facial paint",{color:16777215,map:t}),_=c("original iris paint including pupil and highlights",{color:16777215,map:t}),m=c("warm eye white",{color:"#dcd9d3"}),d=c("navy brown upper eyelashes",{color:"#1c1820"}),M=c("subtle lower eyelashes",{color:"#8e756b"}),v=c("soft independent eyebrows",{color:"#9d8579"}),x=c("recessed mouth interior",{color:"#6d3b40"}),P=c("tongue",{color:"#bd7476"}),A=c("soft drawn jaw contour",{color:"#80675e"});h("closed rounded back of skull",Z0(),u),h("curved face with genuine eye and mouth openings",q0(),f),h("reference skin, nose and cheek paint only",Y0(n,s),g);let C=h("continuous short rounded chin contour",gr(112),A),O=kt.filter(ee=>ee[1]<-.2),w=[...O.map(([ee,re])=>[-ee+.046*Ms(At((-re-.1)/.282)),re]),...O.slice(0,-1).reverse()];_r(C.geometry,ee=>{let re=ee*(w.length-1),ue=Math.min(w.length-2,Math.floor(re)),ge=re-ue;return[Tt(w[ue][0],w[ue+1][0],ge),Tt(w[ue][1],w[ue+1][1],ge)]},.0022,.004);let S=xr.map(ee=>({e:ee,ring:h(`${ee.name} deforming skin eyelid`,pr(96,16),p),white:h(`${ee.name} exposed sclera`,pr(96,9),m),iris:h(`${ee.name} sampled original iris`,K0(),_),upper:h(`${ee.name} moving upper eyelash`,gr(),d),wing:h(`${ee.name} pointed outer lashes`,Di(new Float32Array(9)),d),lower:h(`${ee.name} moving lower eyelash`,gr(),M),crease:h(`${ee.name} moving eyelid crease`,gr(64),v)})),U=h("continuously deforming skin around mouth",pr(96,14),p),W=h("continuously opening mouth cavity",pr(96,8),x),J=h("tongue inside opening",pr(64,4),P),H=h("continuous smile contour",gr(96),x),z={blink:0,talk:0,mood:"neutral",happy:0,sad:0,gazeX:0,gazeY:0};function q(...ee){if(a)return;let re=[...ee].reverse().find(me=>me&&typeof me=="object")||{};z.blink=At(Number(re.blink));let ue=re.talk??re.talking??0;z.talk=At(ue===!0?1:Number(ue)),z.mood=["neutral","happy","sad"].includes(re.mood)?re.mood:"neutral",z.happy=At(Number(re.happy??(z.mood==="happy"?1:0))),z.sad=At(Number(re.sad??(z.mood==="sad"?1:0))),z.gazeX=At(Number(re.gazeX),-1,1),z.gazeY=At(Number(re.gazeY),-1,1);let ge={...z,blink:0};for(let me of S){let k=me.e,oe=ye=>J0(k,ye,z);mr(me.ring.geometry,ye=>_u(k,ye,.025),oe,.006,!0),mr(me.white.geometry,oe,()=>k.center,.0032),Q0(me.iris.geometry,k,z,n,s),me.iris.visible=z.blink<.993,me.white.visible=z.blink<.998;let xe=ye=>{let Te=Tt(-1,1,ye);return[Tt(k.minX,k.maxX,ye),vs(k,Te,!0,z)]},Fe=ye=>{let Te=Tt(-1,1,ye);return[Tt(k.minX,k.maxX,ye),vs(k,Te,!1,z)]};_r(me.upper.geometry,xe,ye=>Tt(.006+.028*Math.pow(Math.sin(Math.PI*ye),.55),.0025+.0065*Math.pow(Math.sin(Math.PI*ye),.65),z.blink),.008),_r(me.lower.geometry,Fe,ye=>.0015+.0016*Math.sin(Math.PI*ye),.007),_r(me.crease.geometry,ye=>{let Te=Tt(.22,.88,ye);return[Tt(k.minX,k.maxX,Te),vs(k,Te*2-1,!0,ge)+.06+.002*z.blink+z.sad*.016*(k.index===0?ye:1-ye)]},ye=>.004*Math.pow(Math.sin(Math.PI*ye),.6),.0072);let be=k.index===0?0:1,Be=k.index===0?-1:1,Ye=xe(be),D=me.wing.geometry.getAttribute("position");[[Ye[0]+Be*.035,Ye[1]+.035*(1-z.blink*.5)],[Ye[0]-Be*.014,Ye[1]+.051*(1-z.blink*.65)],[Ye[0]-Be*.018,Ye[1]-.027*(1-z.blink)]].forEach(([ye,Te],Ae)=>D.setXYZ(Ae,ye,Te,Ss(ye,Te)+.0083)),D.needsUpdate=!0,me.wing.geometry.computeBoundingSphere()}let ie=me=>j0(me,z);mr(U.geometry,me=>xu(me,.025),ie,.006,!0),mr(W.geometry,ie,()=>[pn[0],pn[1]-.02*z.talk],.003);let Se=me=>{let k=ie(me);return[Tt(pn[0],k[0],.62),Tt(pn[1]-.036*z.talk,k[1],.33)]};mr(J.geometry,Se,()=>[pn[0],pn[1]-.035*z.talk],.004),J.visible=z.talk>.25,_r(H.geometry,me=>ie(Math.PI+Math.PI*me),me=>{let k=Ms(At((Math.abs(me-.5)-.055)/.03)),oe=Tt(k,1,At(z.talk*8+z.happy));return(.0027+7e-4*Math.sin(Math.PI*me))*oe},.0075),r.userData.expression={...z}}function ae(){if(!a){a=!0,r.removeFromParent();for(let ee of o)ee.dispose(),e?.delete?.(ee);o.clear()}}let Z={type:"curved-painted-anime-face",source:jc.path,sourceSize:[n,s],origin:jc.origin,pixelsPerUnit:775,tilt:.06,chin:[.023,-.382],crown:[0,.64],eyes:xr.map(ee=>({name:ee.name,center:ee.center,irisCenter:ee.irisCenter,irisRadius:ee.irisRadius.map(re=>re/775)})),textureUnmodified:!0,independentPupilLayers:!1,originalTearsRemoved:!0,continuousControls:["blink","talk","happy","sad","gazeX","gazeY"],profileVolume:Sa.metadata,scope:"Front identity retained; blended Z profile and closed chin seam are installed for side-view QA, not yet validated at 90 degrees"};return r.userData.metadata=Z,q({}),{root:r,update:q,dispose:ae,metadata:Z}}var sl=mt.clamp,ba=(i,e,t)=>{let n=sl((t-i)/(e-i),0,1);return n*n*(3-2*n)},Es=(i,e)=>(i?.add?.(e),e),rl=Object.freeze({top:.84,centerY:.17,height:.67,width:.73,centerZ:-.03,frontDepth:.43,backDepth:.52});function e_(i){let e=Math.cos(i);return e>=0?.34-.74*Math.pow(Math.abs(Math.sin(i)),1.6):-.4-.08*Math.pow(-e,1.5)}function Mu(i,e){let t=rl,n=1-((e-t.centerY)/t.height)**2-(i/t.width)**2;return t.centerZ+t.frontDepth*Math.sqrt(Math.max(0,n))}var bs=[[96,43],[120,73],[150,94],[180,102],[220,108],[260,108],[300,106],[340,100],[370,76]];function il(i,e){let t=sl(e,100,370),n=bs.at(-1)[1];for(let s=0;s<bs.length-1;s++)if(t>=bs[s][0]&&t<=bs[s+1][0]){let r=bs[s],o=bs[s+1];n=mt.lerp(r[1],o[1],(t-r[0])/(o[0]-r[0]));break}return[(1818-n*Math.sin(i))/2043,1-t/770]}function Su(i,e){let t=Es(i,new Si({color:3165044,vertexColors:!0,side:Kt})),n=e?.isTexture?Es(i,new Gt({map:e,color:16773327,toneMapped:!1,side:Kt})):t;return[t,n]}function t_(i,e){let t=rl,n=48,s=96,r=[],o=[],a=[],l=[],c=[],h=new qe(8623275),u=new qe(11912924),f=new qe;function p(M){let v=r.length/3;for(let x=0;x<=n;x++)for(let P=0;P<=s;P++){let A=2*Math.PI*P/s,C=e_(A),O=t.height-(M?.025:0),S=t.top-(M?.022:0)-O,U=Math.acos(sl((C+(M?.018:0)-S)/O,-1,1)),W=U*x/n,J=Math.sin(W),H=S+O*Math.cos(W),z=(Math.cos(A)>=0?t.frontDepth:t.backDepth)-(M?.027:0);r.push((t.width-(M?.027:0))*J*Math.sin(A),H,t.centerZ+z*J*Math.cos(A)),o.push(...il(A,100+(.84-H)/1.32*270)),f.copy(h).lerp(u,.46+.24*Math.cos(W)),a.push(f.r,f.g,f.b)}for(let x=0;x<n;x++)for(let P=0;P<s;P++){let A=v+x*(s+1)+P,C=A+s+1,O=!M&&Math.cos(2*Math.PI*(P+.5)/s)<0?c:l;M?O.push(A,A+1,C,C,A+1,C+1):O.push(A,C,A+1,C,C+1,A+1)}return v}let g=p(!1),_=p(!0);for(let M=0;M<s;M++){let v=g+n*(s+1)+M,x=_+n*(s+1)+M;l.push(v,v+1,x,x,v+1,x+1)}let m=Es(i,new It);m.setAttribute("position",new Je(r,3)),m.setAttribute("uv",new Je(o,2)),m.setAttribute("color",new Je(a,3)),m.setIndex([...l,...c]),m.addGroup(0,l.length,0),m.addGroup(l.length,c.length,1),m.computeVertexNormals();let d=new Et(m,Su(i,e));return d.name="continuous-scalp-front-side-back-shell",d.userData.structure={type:"continuous-scalp-shell",rows:n,cols:s,outerCount:(n+1)*(s+1),shape:t},d}function n_(i,e){let s=[],r=[],o=[],a=[],l=[],c=[],h=new qe;for(let g=0;g<=64;g++){let _=g/64,m=Math.sqrt(Math.max(0,1-ba(.29,1,_)**2)),d=.73*(1-.14*ba(0,1,_))*m,M=.18-1.17*_,v=-.03-.22*ba(0,.85,_),x=(.1+.33*(1-ba(0,.3,_)))*m,P=.52*(1-.54*_)*m;for(let A=0;A<=96;A++){let C=2*Math.PI*A/96,O=Math.cos(C),w=1+.025*Math.cos(C*6+_*.9)*Math.sin(Math.PI*_);if(s.push(d*Math.sin(C)*w,M,v+(O>=0?x:P)*O*w),r.push(...il(C,235+135*_)),h.setHex(9544378).multiplyScalar(.86+.12*(1-_)),o.push(h.r,h.g,h.b),a.push(_*_*_*.65),g<64&&A<96){let S=g*97+A,U=S+96+1;(Math.cos(2*Math.PI*(A+.5)/96)<0?c:l).push(S,U,S+1,U,U+1,S+1)}}}let u=s.length/3;s.push(0,.18,-.03),r.push(...il(Math.PI,235)),o.push(1,1,1),a.push(0);for(let g=0;g<96;g++)l.push(u,g+1,g);let f=Es(i,new It);f.setAttribute("position",new Je(s,3).setUsage(fn)),f.setAttribute("uv",new Je(r,2)),f.setAttribute("color",new Je(o,3)),f.setIndex([...l,...c]),f.addGroup(0,l.length,0),f.addGroup(l.length,c.length,1),f.computeVertexNormals();let p=new Et(f,Su(i,e));return p.name="rounded-posterior-waterfall-hair-volume",p.userData.structure={type:"closed-elliptical-waterfall",rows:64,cols:96},{mesh:p,geometry:f,rest:Float32Array.from(s),weights:Float32Array.from(a)}}function i_(i){let n=[],s=[],r=[],o=new qe(12302789),a=new qe(15460585),l=new qe;for(let f=0;f<=96;f++){let p=Math.PI*f/96,g=Math.cos(p),_=Math.sin(p),m=.009*Math.cos(p*28);for(let d=0;d<=16;d++){let M=2*Math.PI*d/16,v=.036+.036*Math.cos(M)+m*.45,x=(.74+v)*g,P=.17+(.67+v)*_,A=-.015+.07*Math.sin(M)+m*Math.sin(M);if(n.push(x,P-.045*x,A),l.copy(a).lerp(o,.18+.22*(.5+.5*Math.cos(p*28+M*.5))),s.push(l.r,l.g,l.b),f<96&&d<16){let C=f*17+d,O=C+16+1;r.push(C,O,C+1,O,O+1,C+1)}}}let c=Es(i,new It);c.setAttribute("position",new Je(n,3)),c.setAttribute("color",new Je(s,3)),c.setIndex(r),c.computeVertexNormals();let h=Es(i,new Gt({vertexColors:!0,toneMapped:!1,side:Pt})),u=new Et(c,h);return u.name="continuous-rounded-three-dimensional-headband",u}function bu({resources:i,turnaroundTexture:e}={}){let t=new Bt;t.name="continuous-scalp-and-rear-hair";let n=t_(i,e),s=n_(i,e),r=i_(i);t.add(n,s.mesh,r);function o(a,l){let c=s.geometry.attributes.position;for(let h=0;h<c.count;h++){let u=h*3,f=s.weights[h];c.array[u]=s.rest[u]+a*f,c.array[u+1]=s.rest[u+1]-Math.abs(a)*f*.08,c.array[u+2]=s.rest[u+2]+l*f}c.needsUpdate=!0,s.geometry.computeVertexNormals(),s.geometry.computeBoundingSphere()}return{root:t,deform:o,metadata:{scalp:rl,frontOpeningY:.34,sideOpeningY:-.4,backOpeningY:-.48,posterior:"closed curved elliptical volume joining the scalp at the equator",headband:"rounded XY arch with front/back depth around z=0",rearTexture:e?.isTexture?"turnaround-auxiliary-v2.png: blue rear-head pixels only, y100\u2013370; no clothing bow":null,limitations:["Rear painting is inferred auxiliary art.","Lower rear flow stretches the safe blue region; it is not an authored final back view."]}}}var An=Object.freeze({width:1920,height:1080,origin:[815,583],scale:775,angle:.06}),Eu=Math.cos(An.angle),wu=Math.sin(An.angle),Rt=mt.clamp,Ea=new zt(0,0,0,"YXZ");function Au(i,e){let t=i-An.origin[0],n=e-An.origin[1];return[(Eu*t-wu*n)/An.scale,(-wu*t-Eu*n)/An.scale]}function mn(i,e){let t=new Xn;t.moveTo(...i);for(let[n,...s]of e)t[n==="C"?"bezierCurveTo":n==="Q"?"quadraticCurveTo":"lineTo"](...s);return t.closePath(),t}var s_=[{name:"left-face-framing-hair",type:"hair",rootY:285,tipY:850,depth:.065,shape:mn([700,0],[["C",550,-2,350,93,277,300],["C",253,370,238,425,240,472],["C",222,596,253,782,335,853],["C",315,820,303,775,300,720],["C",327,814,459,866,579,830],["C",539,829,511,788,496,758],["C",525,770,558,770,581,755],["C",533,754,491,711,474,647],["C",458,605,447,582,454,566],["C",490,518,550,446,580,366],["C",603,326,623,292,633,266],["C",625,188,658,73,700,0]])},{name:"right-face-framing-hair",type:"hair",rootY:255,tipY:820,depth:.065,shape:mn([835,0],[["C",1008,-12,1123,91,1197,251],["C",1242,335,1261,407,1269,500],["C",1297,586,1304,689,1283,761],["C",1278,781,1266,794,1254,805],["C",1264,777,1267,739,1265,718],["C",1222,797,1165,826,1088,811],["C",1120,798,1140,755,1149,703],["C",1130,715,1109,718,1087,712],["C",1114,699,1129,652,1135,602],["C",1143,573,1143,548,1141,535],["C",1121,492,1087,450,1053,400],["C",1018,348,983,300,960,267],["C",943,160,890,52,835,0]])},{name:"central-forked-bangs",type:"hair",rootY:170,tipY:575,depth:.044,offset:.004,shape:mn([687,0],[["C",741,-7,795,-6,851,0],["C",927,68,961,171,963,274],["C",967,352,960,423,937,450],["C",925,485,901,516,894,525],["C",894,538,907,561,919,567],["C",893,576,861,563,840,548],["C",826,563,801,577,778,575],["C",790,562,797,547,795,541],["C",798,533,791,521,778,510],["C",767,495,759,481,755,470],["C",758,497,765,519,779,541],["L",791,549],["C",767,538,741,522,723,500],["C",682,444,647,339,636,275],["C",624,182,652,65,687,0]])},{name:"left-whale-fin-ear",type:"ear",rootY:525,tipY:750,depth:.055,offset:-.075,shape:mn([231,544],[["C",179,595,103,660,24,705],["C",13,713,5,717,0,720],["L",0,735],["C",29,757,65,776,94,781],["C",105,796,131,794,153,782],["C",182,801,212,787,226,771],["C",245,776,262,764,272,748],["C",265,700,252,623,231,544]])},{name:"right-whale-fin-ear",type:"ear",rootY:490,tipY:713,depth:.055,offset:-.075,shape:mn([1269,494],[["C",1313,550,1374,598,1457,620],["C",1477,626,1468,642,1455,650],["C",1444,661,1428,669,1416,672],["C",1413,695,1386,706,1364,704],["C",1354,705,1345,702,1339,697],["C",1319,720,1287,721,1262,704],["C",1273,642,1280,570,1269,494]])},{name:"left-blue-ribbon",type:"bow",rootY:440,tipY:598,depth:.03,offset:.034,shape:mn([196,485],[["C",170,471,139,456,124,473],["C",111,488,117,522,122,543],["C",121,568,127,588,139,593],["C",153,598,184,563,199,549],["C",216,561,246,591,261,586],["C",275,568,278,506,272,467],["C",268,443,250,440,236,455],["C",223,462,210,476,196,485]])},{name:"right-blue-ribbon",type:"bow",rootY:390,tipY:513,depth:.03,offset:.032,shape:mn([1272,412],[["C",1285,397,1303,380,1315,386],["C",1319,394,1325,412,1326,438],["C",1327,453,1318,470,1312,480],["C",1323,497,1319,511,1308,514],["C",1292,516,1278,505,1266,490],["C",1263,466,1264,434,1272,412]])},{name:"left-painted-white-frill",type:"frill",rootY:0,tipY:490,depth:.045,offset:-.085,shape:mn([349,0],[["C",335,10,331,29,339,47],["C",314,43,307,64,300,82],["C",267,73,235,96,217,123],["C",195,154,191,197,210,229],["C",175,242,160,277,178,310],["C",150,325,137,365,154,400],["C",135,416,129,446,143,474],["C",167,480,185,469,204,452],["C",217,454,230,460,240,469],["C",254,342,296,224,382,150],["C",452,89,530,37,617,0]])},{name:"right-painted-white-frill",type:"frill",rootY:0,tipY:400,depth:.045,offset:-.085,shape:mn([897,0],[["L",1105,0],["C",1121,12,1126,41,1118,63],["C",1152,56,1186,83,1200,111],["C",1223,146,1229,185,1210,213],["C",1244,225,1269,256,1276,286],["C",1285,320,1276,347,1258,362],["C",1272,375,1275,393,1264,409],["C",1243,340,1227,291,1197,251],["C",1121,96,1015,-6,897,0]])}];function Ru(i,e,t){if(t.type==="frill")return .052+.013*Math.cos(i*8)+.008*Math.sin(e*10);let s=.494-(t.type==="ear"?.1:.205)*Math.pow(i/.8,2)-.027*Math.pow((e-.12)/.73,2)+(t.offset||0),r=Rt((e-.35)/.35,0,1),o=r*r*(3-2*r);return mt.lerp(s,Mu(i,e)+.038+(t.offset||0),o)}function Tu(i){let e=i.getPoints(18);for(let s of e)s.x=Rt(s.x,0,An.width-1),s.y=Rt(s.y,0,An.height-1);e.length>1&&e[0].distanceToSquared(e.at(-1))<1e-8&&e.pop();let t=e.filter((s,r)=>r===0||s.distanceToSquared(e[r-1])>1e-8),n=[];for(let s=0;s<t.length;s++){let r=t[s],o=t[(s+1)%t.length],a=Math.max(1,Math.ceil(r.distanceTo(o)/18));for(let l=0;l<a;l++)n.push(r.clone().lerp(o,l/a))}return n}function r_(i,e=[]){let t=[],n=[],s=new Map;function r(l){let c=`${l.x.toFixed(5)},${l.y.toFixed(5)}`;if(s.has(c))return s.get(c);let h=t.length;return t.push(l),s.set(c,h),h}function o(l,c,h,u){let f=l.distanceToSquared(c),p=c.distanceToSquared(h),g=h.distanceToSquared(l);if(u<5&&Math.max(f,p,g)>2704){let _=l.clone().add(c).multiplyScalar(.5),m=c.clone().add(h).multiplyScalar(.5),d=h.clone().add(l).multiplyScalar(.5);o(l,_,d,u+1),o(_,c,m,u+1),o(d,m,h,u+1),o(_,m,d,u+1)}else n.push(r(l),r(c),r(h))}let a=i.concat(...e);for(let[l,c,h]of Mn.triangulateShape(i,e))o(a[l],a[c],a[h],0);return{vertices:t,faces:n}}function yr(i,e){return i?.add?i.add(e):Array.isArray(i)&&i.push(e),e}function vr(i,e,t,n,s){let r=Tu(i.shape),o=i.shape.holes.map(ie=>Tu(ie)),{vertices:a,faces:l}=r_(r,o),c=new Bt;c.name=i.name;let h=[],u=[],f=[],p=[],g=i.rounded||i.type==="long-hair"||i.type==="hair",_=[r,...o],m=new Map;function d(ie){if(!g)return i.depth;let Se=`${ie.x.toFixed(5)},${ie.y.toFixed(5)}`;if(m.has(Se))return m.get(Se);let me=1/0;for(let Fe of _)for(let be=0;be<Fe.length;be++){let Be=Fe[be],Ye=Fe[(be+1)%Fe.length],D=Ye.x-Be.x,it=Ye.y-Be.y,ye=D*D+it*it,Te=ye?Rt(((ie.x-Be.x)*D+(ie.y-Be.y)*it)/ye,0,1):0;me=Math.min(me,(ie.x-Be.x-D*Te)**2+(ie.y-Be.y-it*Te)**2)}let k=i.type==="long-hair"?45:i.type==="ahoge"?16:70,xe=.01+(i.type==="long-hair"?.3:i.type==="ahoge"?.072:.22)*Math.sqrt(Rt(Math.sqrt(me)/k,0,1));return m.set(Se,xe),xe}let M=ie=>{let Se;if(i.mapPoint)Se=i.mapPoint(ie);else{let[me,k]=Au(ie.x,ie.y);Se=[me,k,Ru(me,k,i)]}return g&&(i.type==="long-hair"||i.type==="ahoge")&&(Se[2]+=(d(ie)-.01)*.42),Se},v=ie=>{if(i.static||i.type==="frill"||i.type==="bow")return 0;let Se=Rt((ie-i.rootY)/(i.tipY-i.rootY),0,1);return Se*Se*(3-2*Se)*(i.type==="ear"?.32:1)};for(let ie of a)h.push(...M(ie)),u.push(ie.x/n,1-ie.y/s),f.push(v(ie.y)),p.push(d(ie));let x=yr(t,new It);x.setAttribute("position",new Je(h,3).setUsage(fn)),x.setAttribute("uv",new Je(u,2));let P=[];for(let ie=0;ie<l.length;ie+=3){let Se=l[ie],me=l[ie+1],k=l[ie+2],oe=(h[me*3]-h[Se*3])*(h[k*3+1]-h[Se*3+1])-(h[me*3+1]-h[Se*3+1])*(h[k*3]-h[Se*3]);P.push(Se,oe>0?me:k,oe>0?k:me)}x.setIndex(P),x.computeVertexNormals();let A=!!i.source,C=i.type==="frill";if(C){let ie=[];for(let Se of a){let me=Rt(Se.y/65,0,1);ie.push(1,1,1,me*me*(3-2*me))}x.setAttribute("color",new Je(ie,4))}let O=yr(t,new Gt({map:e,color:i.color||16777215,toneMapped:!1,side:Kt,vertexColors:C,transparent:A||C,alphaTest:A?.4:C?.025:0})),w=new Et(x,O);w.name=`${i.name}:original-pixel-surface`,c.add(w);let S=[],U=[],W=[],J=[];for(let ie of[r,...o])for(let Se=0;Se<ie.length;Se++){let me=ie[Se],k=ie[(Se+1)%ie.length],oe=M(me),xe=M(k),Fe=[oe[0],oe[1],oe[2]-d(me)],be=[xe[0],xe[1],xe[2]-d(k)];for(let[Be,Ye]of[[oe,me],[Fe,me],[xe,k],[xe,k],[Fe,me],[be,k]])if(S.push(...Be),U.push(v(Ye.y)),W.push(Ye.x/n,1-Ye.y/s),C){let D=Rt(Ye.y/65,0,1);J.push(1,1,1,D*D*(3-2*D))}}let H=yr(t,new It);H.setAttribute("position",new Je(S,3).setUsage(fn)),C&&H.setAttribute("color",new Je(J,4)),H.computeVertexNormals();let z=yr(t,new Si({color:C?12105664:2967152,side:Pt,vertexColors:C,transparent:C,alphaTest:C?.025:0})),q=new Et(H,z);q.name=`${i.name}:closed-thickness`,c.add(q);let ae=yr(t,x.clone()),Z=ae.attributes.position;for(let ie=0;ie<Z.count;ie++)Z.setZ(ie,Z.getZ(ie)-p[ie]);let ee=ae.index.array;for(let ie=0;ie<ee.length;ie+=3)[ee[ie+1],ee[ie+2]]=[ee[ie+2],ee[ie+1]];ae.computeVertexNormals();let re=new Et(ae,z);re.name=`${i.name}:back`,c.add(re);let ue=[{geometry:x,rest:Float32Array.from(h),weights:Float32Array.from(f)},{geometry:H,rest:Float32Array.from(S),weights:Float32Array.from(U)},{geometry:ae,rest:Float32Array.from(ae.attributes.position.array),weights:Float32Array.from(f)}],ge=r.reduce((ie,Se)=>({minX:Math.min(ie.minX,Se.x),maxX:Math.max(ie.maxX,Se.x),minY:Math.min(ie.minY,Se.y),maxY:Math.max(ie.maxY,Se.y)}),{minX:1/0,maxX:-1/0,minY:1/0,maxY:-1/0});return{group:c,deformers:ue,patch:i,bounds:ge,vertexCount:a.length,sourceOutline:r.map(ie=>[ie.x,ie.y]),sourceHoles:o.map(ie=>ie.map(Se=>[Se.x,Se.y])),crossSection:{type:g?"rounded-lenticular":"thin-volume",minDepth:Math.min(...p),maxDepth:Math.max(...p)}}}function o_(i,e,t,n){return[{name:"left-painted-long-wave",side:-1,u0:180,u1:330,points:[[-.5,-.13,.015],[-.61,-.4,-.015],[-.7,-.7,0],[-.64,-.98,.025],[-.76,-1.12,.07]],width:.155},{name:"right-painted-long-wave",side:1,u0:220,u1:380,points:[[.5,-.12,-.015],[.63,-.41,-.025],[.7,-.7,-.01],[.61,-.97,.015],[.71,-1.11,.055]],width:.157},{name:"left-painted-inner-curl",side:-1,u0:260,u1:380,points:[[-.43,-.2,-.055],[-.47,-.48,-.075],[-.43,-.76,-.055],[-.49,-1,-.025],[-.59,-1.055,.02]],width:.105},{name:"right-painted-inner-curl",side:1,u0:200,u1:320,points:[[.43,-.19,-.065],[.48,-.48,-.075],[.44,-.77,-.055],[.5,-.98,-.03],[.58,-1.045,.015]],width:.105}].map(r=>{let o=new Dn(r.points.map(l=>new I(...l)),!1,"catmullrom",.45),a={name:r.name,type:"long-hair",rootY:810,tipY:1040,depth:.045,shape:mn([r.u0,810],[["L",r.u1,810],["L",r.u1,1040],["L",r.u0,1040]]),mapPoint(l){let c=Rt((l.y-810)/230,0,1),h=(l.x-(r.u0+r.u1)/2)/((r.u1-r.u0)/2),u=o.getPoint(c),f=(.85+.23*Math.sin(c*Math.PI))*(1-Math.pow(c,7))+.002;return[u.x+h*r.width*f,u.y+.018*h*Math.sin(c*Math.PI),u.z+.027*(1-h*h)*Math.sin(c*Math.PI)]}};return vr(a,i,e,t,n)})}function a_(i,e){let t={name:"auxiliary-painted-hook-ahoge",type:"ahoge",rounded:!0,source:"production/v1/neutral-front.png",rootY:351,tipY:244,depth:.027,shape:mn([563,353],[["C",580,331,588,296,577,273],["C",567,250,540,240,516,244],["C",480,245,449,268,438,292],["C",427,314,433,333,449,338],["C",438,324,448,306,468,295],["C",495,280,523,276,543,289],["C",560,301,568,327,563,353]]),mapPoint(n){let s=(n.x-564)/360,r=Rt((353-n.y)/109,0,1),o=.735+(353-n.y)/360;return[s,o,.17-.1*r-.025*(s/.45)**2]}};return vr(t,i,e,1144,1375)}var c_=[[370,626],[369,628],[367,627],[351,635],[337,655],[318,674],[300,689],[291,699],[286,712],[286,722],[289,730],[295,737],[288,742],[280,745],[265,755],[252,768],[246,779],[244,787],[244,793],[246,801],[249,807],[254,814],[262,822],[270,826],[278,833],[281,834],[282,838],[276,844],[270,848],[264,850],[253,850],[248,848],[243,843],[241,839],[241,834],[240,834],[236,843],[236,852],[243,868],[253,877],[262,882],[275,885],[282,885],[283,884],[288,884],[297,880],[298,881],[294,888],[288,893],[282,896],[273,896],[268,892],[269,900],[275,910],[282,916],[297,923],[301,924],[317,924],[329,920],[331,921],[331,927],[334,934],[340,940],[345,942],[346,944],[342,951],[336,956],[330,958],[323,956],[323,958],[331,967],[343,971],[352,971],[361,968],[365,965],[366,966],[366,972],[363,979],[359,983],[355,985],[348,984],[355,993],[361,996],[373,997],[374,998],[375,997],[385,996],[390,993],[392,993],[398,988],[400,996],[404,1004],[413,1013],[424,1018],[433,1018],[428,1011],[428,1003],[430,998],[438,1010],[448,1017],[436,997],[409,978],[376,952],[356,931],[350,923],[360,902],[360,881],[372,858],[390,839],[410,831],[425,806],[429,793],[435,779],[435,744],[437,737],[437,734],[435,732],[439,731],[440,733],[446,733],[447,734],[446,735],[441,735],[449,748],[477,746],[492,726],[490,698],[472,677],[446,673],[432,645]],l_=[[[312,759],[313,760],[303,772],[296,784],[296,786],[294,789],[293,796],[292,797],[292,804],[293,806],[291,807],[285,801],[281,794],[281,792],[280,791],[281,781],[285,775],[293,767],[302,762]],[[362,662],[363,664],[362,665],[360,673],[355,683],[355,685],[347,700],[340,710],[333,718],[326,723],[322,722],[316,716],[314,711],[313,704],[314,703],[314,698],[316,694],[321,687],[348,673]]];function h_(i,e){return[-1,1].map(t=>{let n=new Xn;c_.forEach(([r,o],a)=>a?n.lineTo(r,o):n.moveTo(r,o)),n.closePath();for(let r of l_){let o=new Ln;r.forEach(([a,l],c)=>c?o.lineTo(a,l):o.moveTo(a,l)),o.closePath(),n.holes.push(o)}let s={name:`${t<0?"left":"right"}-auxiliary-source-traced-long-curls`,type:"long-hair",source:"production/v1/neutral-front.png",color:10127536,rootY:650,tipY:1018,depth:.065,shape:n,mapPoint(r){let o=(r.x-582)/340,a=t<0?o:-o,l=(586-r.y)/340-.02,c=-.045+.055*Math.pow(Rt((r.y-626)/392,0,1),2)-.09*((r.x-350)/150)**2;return[a,l,c]}};return vr(s,i,e,1144,1375)})}function u_(i,e){let t={name:"inferred-rounded-crown-using-original-blue-pixels",type:"crown-inferred",static:!0,rootY:0,tipY:55,depth:.065,offset:.006,shape:mn([620,0],[["L",890,0],["L",890,55],["L",620,55]]),mapPoint(n){let[s,r]=Au(n.x,n.y),o=(n.x-620)/270,a=r+.065*Math.sin(Math.PI*o)*Rt(1-n.y/55,0,1);return[s,a,Ru(s,a,t)]}};return vr(t,i,e,1920,1080)}function d_(i,e,t){if(!(i.patch.static||i.patch.type==="frill"||i.patch.type==="bow"))for(let n of i.deformers){let s=n.geometry.attributes.position;for(let r=0;r<s.count;r++){let o=r*3,a=n.weights[r],l=n.rest[o],c=n.rest[o+1],h=n.rest[o+2];s.array[o]=l+e*a,s.array[o+1]=c-Math.abs(e)*a*.11+t*a*.12,s.array[o+2]=h+t*a+e*l*a*.2}s.needsUpdate=!0,n.geometry.computeVertexNormals(),n.geometry.computeBoundingSphere()}}function Cu({head:i,resources:e,texture:t,garmentTexture:n,turnaroundTexture:s,sourceWidth:r=1920,sourceHeight:o=1080}){if(!i?.isObject3D)throw new TypeError("createPaintedHair requires a THREE.Object3D head");if(!t?.isTexture)throw new TypeError("createPaintedHair requires the unedited source THREE.Texture");if(r!==An.width||o!==An.height)throw new RangeError("Hair trace requires the 1920 \xD7 1080 source cover");let a=new Bt;a.name="source-painted-hair",i.add(a);let l=bu({resources:e,turnaroundTexture:s});a.add(l.root);let c=[...n?.isTexture?h_(n,e):o_(t,e,r,o),...s_.map(x=>vr(x,t,e,r,o)),u_(t,e)];n?.isTexture&&c.push(a_(n,e));for(let x of c)a.add(x.group);let h=new et;i.getWorldQuaternion(h);let u=h.clone(),f=new et,p=new et,g=c.map((x,P)=>({x:0,z:0,vx:0,vz:0,frequency:10+P%3*1.2,damping:.86+P%2*.06})),_=!1,m=0,d=0;function M(x,P,A={}){let C=Rt(Number.isFinite(x)?x:0,0,.05),O=Rt(A.strength??1,0,1);i.getWorldQuaternion(h),_||(u.copy(h),_=!0),p.copy(u).invert(),f.copy(p).multiply(h),Ea.setFromQuaternion(f,"YXZ");let w=C>0?Rt(Ea.x/C,-8,8):0,S=C>0?Rt(Ea.y/C,-8,8):0,U=C>0?Rt((w-m)/C,-80,80):0,W=C>0?Rt((S-d)/C,-80,80):0;C>0&&(u.copy(h),m=w,d=S);let J=Ea.setFromQuaternion(h,"YXZ").z;for(let H=0;H<c.length;H++){let z=c[H],q=g[H],ae=q.frequency,Z=Rt(-S*.012-W*7e-4+Math.sin(J)*.008,-.045,.045)*O,ee=Rt(w*.01+U*5e-4,-.025,.025)*O,re=Math.max(1,Math.ceil(C/.008)),ue=C/re;for(let ge=0;ge<re;ge++)q.vx+=(ae*ae*(Z-q.x)-2*q.damping*ae*q.vx)*ue,q.x+=q.vx*ue,q.vz+=(ae*ae*(ee-q.z)-2*q.damping*ae*q.vz)*ue,q.z+=q.vz*ue;q.x=Rt(q.x,-.055,.055),q.z=Rt(q.z,-.035,.035),d_(z,q.x,q.z)}l.deform((g[0]?.x||0)*.55+(g[1]?.x||0)*.45,(g[0]?.z||0)*.55+(g[1]?.z||0)*.45)}let v={technique:"Continuous 3D scalp and rounded posterior volume, source-pixel curved locks with lenticular cross-sections and damped tip deformation",source:"references/video-covers/BV1g2JX6HEHX.jpg",sourceWidth:r,sourceHeight:o,mapping:An,supportedYawDegrees:25,limitations:["The cropped crown and hidden scalp are inferred geometry.",n?.isTexture?"Long curls and ahoge are traced from the approved auxiliary neutral-front image; left curls are mirrored on the right.":"Long waves use clean source blue-hair pixels on authored curved geometry; their lower silhouette is inferred.","Side/back painting remains a structural study, not a final authored turnaround."],structure:l.metadata,patches:c.map(x=>({name:x.patch.name,type:x.patch.type,source:x.patch.source||"references/video-covers/BV1g2JX6HEHX.jpg",bounds:x.bounds,vertexCount:x.vertexCount,outline:x.sourceOutline,holes:x.sourceHoles,crossSection:x.crossSection})),totalFrontVertices:c.reduce((x,P)=>x+P.vertexCount,0),checkState:()=>g.map(x=>({x:x.x,z:x.z,vx:x.vx,vz:x.vz}))};return M(0,0,{}),{root:a,update:M,metadata:v}}function Iu({hip:i,target:e,upperLength:t,lowerLength:n,pole:s=new I(0,0,1)}){let r=e.clone().sub(i),o=r.length();o<1e-10?r.set(0,-1,0):r.multiplyScalar(1/o);let a=Math.abs(t-n)+1e-7,l=t+n-1e-7,c=mt.clamp(o,a,l),h=i.clone().addScaledVector(r,c),u=(t**2+c**2-n**2)/(2*c),f=Math.sqrt(Math.max(0,t**2-u**2)),p=s.clone().normalize().addScaledVector(r,-s.clone().normalize().dot(r));p.lengthSq()<1e-10&&(p.set(Math.abs(r.x)<.8?1:0,Math.abs(r.x)<.8?0:1,0),p.addScaledVector(r,-p.dot(r))),p.normalize();let g=i.clone().addScaledVector(r,u).addScaledVector(p,f);return{hip:i.clone(),knee:g,ankle:h,kneePole:p,requestedDistance:o,distance:c,clamped:Math.abs(c-o)>1e-7}}function Pu({parent:i,resources:e,garmentTexture:t}){if(!i?.isObject3D)throw new TypeError("A parent Object3D is required");if(!e?.add)throw new TypeError("A shared resource set is required");let n=new Bt;n.name="painted-full-body-study",i.add(n);let s=N=>(e.add(N),N),r=mt.clamp,o=mt.lerp,a=(N,T,L)=>mt.smoothstep(L,N,T),l=1144,c=1375,h=N=>(N-580)/260,u=N=>N<=1003?.2+(835-N)/260:.2+-168/260+(1003-N)/260*1.18,f=N=>580+N*260,p=N=>N>=u(1003)?835-(N-.2)*260:1003-(N-u(1003))*260/1.18,g=N=>s(new Gt({color:N,side:Pt,toneMapped:!1})),_=g("#27334d"),m=g("#1e2a42"),d=g("#e1dcd6"),M=g("#efc8af"),v=g("#1c2846"),x=g("#283450"),P=g("#26314d"),A=s(new Gt({map:t||null,color:t?16777215:3424603,vertexColors:!0,alphaTest:0,side:Pt,toneMapped:!1})),C=new qe("#e2ded7"),O=new qe("#ccd0c6"),w=new qe,S=s(new Gt({map:t||null,color:t?"#8187a6":"#354364",alphaTest:0,side:Pt,toneMapped:!1})),U=g("#4a6381"),W=[],J=new Map,H={};function z(N,T,L,b=n){let F=new Pn;return F.name=T,F.position.set(...L),b.add(F),H[N]=F,J.set(F,W.length),W.push(F),F}let q=z("hips","pelvis / garment anchor",[0,.2,0]),ae=z("spine","bodice spine",[0,.28,0],q);z("chest","collar / chest",[0,.18,0],ae),z("skirtLeft","left skirt cloth",[-.23,-.06,0],q),z("skirtRight","right skirt cloth",[.23,-.06,0],q),z("skirtFront","front apron cloth",[0,-.08,.17],q),z("skirtBack","back skirt cloth",[0,-.08,-.15],q);for(let[N,T]of[["left",-1],["right",1]]){let L=z(`${N}UpperArm`,`${N} upper sleeve`,[T*.355,.025,.035],ae),b=z(`${N}ForeArm`,`${N} elbow / sleeve`,[T*.17,-.265,.015],L);z(`${N}Hand`,`${N} wrist / fingers`,[T*.13,-.185,.07],b);let F=z(`${N}UpperLeg`,`${N} hip / thigh`,[T*.245,-.667,.015],q),B=z(`${N}LowerLeg`,`${N} knee / sock`,[0,-.235,.025],F);z(`${N}Foot`,`${N} ankle / shoe`,[0,-.235,.065],B)}let Z=z("tailBase","whale tail base",[.37,-.56,-.26],q),ee=z("tailMid","whale tail middle",[.42,-.02,-.025],Z);z("tailTip","whale tail flukes",[.43,.075,0],ee),n.updateMatrixWorld(!0);let re=s(new vi(W));re.calculateInverses();let ue={};for(let[N,T]of Object.entries(H))ue[N]=T.position.clone();let ge=N=>J.get(H[N]);function ie(N){let T=new Map;for(let[F,B]of N)B>1e-5&&T.set(F,(T.get(F)||0)+B);let L=[...T].sort((F,B)=>B[1]-F[1]).slice(0,4),b=L.reduce((F,B)=>F+B[1],0)||1;return L.map(([F,B])=>[F,B/b])}function Se(N,T){let L=a(.22,.64,T),b=a(.5,.73,T)*.36;return[[ge("hips"),1-L],[ge("spine"),L*(1-b)],[ge("chest"),L*b]]}function me(N,T,L,b,F=!1){let B=a(820,1e3,b)*.72,K=r(Math.abs(N)/.77,0,1),X=N<0;return[[ge("hips"),1-B],[ge(X?"skirtLeft":"skirtRight"),B*(.48+.28*K)],[ge(F?"skirtBack":"skirtFront"),B*(.52-.28*K)]]}function k(N,T,L){let b=a(784,849,T),F=a(855,885,T),B=N==="left"?L:1156-L,K=(1-a(756,791,T))*a(465,500,B)*.78;return[[ge("spine"),K],[ge(`${N}UpperArm`),(1-b)*(1-K)],[ge(`${N}ForeArm`),b*(1-F)*(1-K)],[ge(`${N}Hand`),b*F*(1-K)]]}function oe(N,T){let L=a(1018,1063,T),b=a(1070,1096,T);return[[ge(`${N}UpperLeg`),1-L],[ge(`${N}LowerLeg`),L*(1-b)],[ge(`${N}Foot`),L*b]]}function xe(N){let T=a(.4,.94,N),L=a(.95,1.4,N);return[[ge("tailBase"),1-T],[ge("tailMid"),T*(1-L)],[ge("tailTip"),T*L]]}function Fe(){let N=[],T=[],L=[],b=[];return{position:N,uv:T,skinIndex:L,skinWeight:b,vertex(F,B,K,X,Y=!1){let se=h(F),he=u(B),_e=N.length/3;N.push(se,he,K),T.push(F/l,1-B/c);let Ce=ie(X(se,he,F,B,Y));for(let Ie=0;Ie<4;Ie++)L.push(Ce[Ie]?.[0]??ge("hips")),b.push(Ce[Ie]?.[1]??0);return _e}}}let be=[];function Be(N,T,L,b,F,B){let K=s(new It);K.setAttribute("position",new Je(T.position,3)),K.setAttribute("uv",new Je(T.uv,2)),K.setAttribute("skinIndex",new Wn(T.skinIndex,4)),K.setAttribute("skinWeight",new Je(T.skinWeight,4));let X=[];for(let se=0;se<T.position.length/3;se++){let he=(1-T.uv[se*2+1])*c,_e=N.includes("hand and fingers")?1:N.includes("thigh, sock")?1-a(1040,1054,he):0;w.copy(C).lerp(O,_e),X.push(w.r,w.g,w.b)}K.setAttribute("color",new Je(X,3)),K.setIndex([...L,...b,...F]),K.addGroup(0,L.length,0),K.addGroup(L.length,b.length,1),K.addGroup(L.length+b.length,F.length,2),K.computeVertexNormals(),K.computeBoundingBox(),K.computeBoundingSphere();let Y=new Xs(K,B);return Y.name=N,Y.frustumCulled=!1,n.add(Y),Y.bind(re),Y.userData.closedVolume=!0,Y.userData.sourceRegion=N,be.push(Y),Y}function Ye(N,T=5){let L=[];for(let b=0;b<N.length-1;b++){let F=N[b],B=N[b+1],K=Math.max(1,Math.ceil((B[0]-F[0])/T));for(let X=0;X<K;X++){let Y=X/K;L.push([o(F[0],B[0],Y),o(F[1],B[1],Y),o(F[2],B[2],Y)])}}return L.push(N.at(-1)),L}function D({name:N,points:T,weights:L,frontZ:b=.2,backZ:F=0,materials:B=[A,_,m],detail:K=2}){let X=Fe(),Y=[],se=[],he=[],_e=T.map(([Ve,Qe])=>new Ue(Ve,Qe)),Ce=Mn.area(_e)>0,Ie=Mn.triangulateShape(_e,[]),pe=(Ve,Qe)=>{let st=ye(Ve.x,Ve.y,T),ct=.002+((b-F)*.5-.002)*Math.sin(Math.min(1,st/23)*Math.PI*.5);return(b+F)*.5+(Qe?-ct:ct)};function Pe(Ve,Qe,st,vt,ct){if(vt){let ft=Ve.clone().lerp(Qe,.5),Dt=Qe.clone().lerp(st,.5),Lt=st.clone().lerp(Ve,.5);Pe(Ve,ft,Lt,vt-1,ct),Pe(ft,Qe,Dt,vt-1,ct),Pe(Lt,Dt,st,vt-1,ct),Pe(ft,Dt,Lt,vt-1,ct);return}let lt=[Ve,Qe,st].map(ft=>X.vertex(ft.x,ft.y,pe(ft,ct),L,ct));(ct?se:Y).push(...ct?lt:lt.reverse())}for(let Ve of Ie)for(let Qe of[!1,!0])Pe(...Ve.map(st=>_e[st]),K,Qe);for(let Ve=0;Ve<_e.length;Ve++){let Qe=_e[Ve],st=_e[(Ve+1)%_e.length],vt=2**K;for(let ct=0;ct<vt;ct++){let lt=Qe.clone().lerp(st,ct/vt),ft=Qe.clone().lerp(st,(ct+1)/vt),Dt=X.vertex(lt.x,lt.y,pe(lt,!1),L),Lt=X.vertex(ft.x,ft.y,pe(ft,!1),L),gn=X.vertex(lt.x,lt.y,pe(lt,!0),L,!0),Rn=X.vertex(ft.x,ft.y,pe(ft,!0),L,!0);he.push(...Ce?[Dt,Lt,gn,Lt,Rn,gn]:[Dt,gn,Lt,Lt,gn,Rn])}}let We=Be(N,X,Y,se,he,B);return We.userData.volumeStudy={kind:"biconvex-lens",inferredSides:!0,edgeThickness:.004,maximumThickness:b-F,frontFitContour:T,frontVertexCount:Y.length},We}function it(N,T,L){let b=!1;for(let F=0,B=L.length-1;F<L.length;B=F++){let K=L[F],X=L[B];K[1]>T!=X[1]>T&&N<(X[0]-K[0])*(T-K[1])/(X[1]-K[1])+K[0]&&(b=!b)}return b}function ye(N,T,L){let b=1/0;for(let F=0;F<L.length;F++){let B=L[F],K=L[(F+1)%L.length],X=K[0]-B[0],Y=K[1]-B[1],se=r(((N-B[0])*X+(T-B[1])*Y)/(X*X+Y*Y||1),0,1);b=Math.min(b,Math.hypot(N-B[0]-X*se,T-B[1]-Y*se))}return b}function Te(N,T,L){if(it(N,T,L)||ye(N,T,L)<1e-6)return[N,T];let b=null,F=1/0;for(let B=0;B<L.length;B++){let K=L[B],X=L[(B+1)%L.length],Y=X[0]-K[0],se=X[1]-K[1],he=r(((N-K[0])*Y+(T-K[1])*se)/(Y*Y+se*se||1),0,1),_e=K[0]+Y*he,Ce=K[1]+se*he,Ie=Math.hypot(_e-N,Ce-T);Ie<F&&(F=Ie,b=[_e,Ce])}return b}function Ae(N,T){let L=-1/0;for(let b=0;b<T.length;b++){let F=T[b],B=T[(b+1)%T.length];if(N>=Math.min(F[0],B[0])-1e-7&&N<=Math.max(F[0],B[0])+1e-7){if(Math.abs(B[0]-F[0])<1e-9){L=Math.max(L,F[1],B[1]);continue}L=Math.max(L,o(F[1],B[1],(N-F[0])/(B[0]-F[0])))}}return L}function tt({name:N,levels:T,segments:L=48,sample:b,weights:F,materials:B=[A,_,m],region:K,contour:X=null,axis:Y="Y"}){let se=Fe(),he=[[],[],[]],_e=[];for(let Ie=0;Ie<T.length;Ie++){let pe=[];for(let Pe=0;Pe<L;Pe++){let We=Pe/L*Math.PI*2,Ve=b(T[Ie],We,Ie),Qe=f(Ve.x),st=p(Ve.y);pe.push(se.vertex(Qe,st,Ve.z,F,Math.cos(We)<0))}_e.push(pe)}for(let Ie=0;Ie<_e.length-1;Ie++)for(let pe=0;pe<L;pe++){let Pe=(pe+1)%L,We=_e[Ie][pe],Ve=_e[Ie+1][pe],Qe=(pe+.5)/L*Math.PI*2,st=K?K((T[Ie]+T[Ie+1])*.5,Qe):Math.cos(Qe)>=0?0:1;he[st].push(We,Ve,_e[Ie][Pe],_e[Ie][Pe],Ve,_e[Ie+1][Pe])}for(let Ie of[0,_e.length-1]){let pe=new I;for(let We of _e[Ie])pe.add(new I().fromArray(se.position,We*3));pe.multiplyScalar(1/L);let Pe=se.vertex(f(pe.x),p(pe.y),pe.z,F,Ie===0);for(let We=0;We<L;We++){let Ve=_e[Ie][We],Qe=_e[Ie][(We+1)%L];he[1].push(...Ie===0?[Pe,Ve,Qe]:[Pe,Qe,Ve])}}let Ce=Be(N,se,...he,B);return Ce.userData.volumeStudy={kind:"360-sections",axis:Y,sections:_e.length,angularSegments:L,inferredSides:!0,frontFitContour:X,sectionRings:_e,frontMaterialIndex:0},Ce}function we({name:N,anchors:T,weights:L,frontDepth:b=.27,backDepth:F=.17,materials:B=[A,_,m],region:K}){let X=Ye(T),Y=[...T.map(([se,he])=>[he,se]),...T.toReversed().map(([se,he,_e])=>[_e,se])];return tt({name:N,levels:X.map((se,he)=>he),weights:L,materials:B,contour:Y,region:K,sample:(se,he)=>{let[_e,Ce,Ie]=X[se],pe=(Ce+Ie)*.5+(Ie-Ce)*.5*Math.sin(he),Pe=Math.cos(he);return new I(h(pe),u(_e),-.015+Pe*(Pe>=0?b:F))}})}we({name:"traced collar, bib, bow and continuous bodice",anchors:[[692,554,609],[700,519,642],[713,506,654],[735,504,657],[765,507,655],[795,507,654],[811,504,655],[830,508,652]],weights:Se});let gt=[[508,819],[496,836],[480,857],[461,879],[438,899],[410,917],[392,927],[380,935],[377,941],[382,950],[392,955],[393,961],[397,968],[405,974],[416,978],[420,982],[429,989],[438,995],[450,999],[466,1e3],[480,997],[483,1005],[494,1012],[510,1015],[526,1016],[539,1012],[544,1005],[549,1010],[557,1016],[566,1020],[583,1021],[595,1017],[603,1010],[607,1006],[614,1012],[629,1016],[645,1013],[656,1007],[666,999],[679,999],[696,995],[711,990],[717,982],[735,979],[742,969],[748,960],[756,954],[761,947],[767,940],[764,933],[756,925],[747,918],[727,899],[701,879],[681,857],[664,836],[652,819]];tt({name:"continuous flared skirt, painted front apron and encircling ivory hem",levels:Array.from({length:29},(N,T)=>T/28),segments:96,weights:me,materials:[A,_,d],contour:gt,region:(N,T)=>Math.cos(T)>=0?0:N>.87?2:1,sample:(N,T)=>{let L=Math.sin(T),b=Math.cos(T),F=572+195*L,B=Ae(F,gt),K=o(580+72*L,F,N),X=o(819,B,N);b<0&&(X-=5*N),b>=-1e-8&&([K,X]=Te(K,X,gt));let Y=.005*Math.cos(T*18)*N*N;return new I(h(K),u(X),-.015+b*(o(.235,b>=0?.36:.3,N)+Y))}});let dt=[[748,451,481],[758,440,493],[775,426,498],[793,433,487],[812,415,474],[832,400,458],[848,397,443],[860,392,428],[873,384,409]],R=[[397,869],[411,878],[417,883],[416,887],[406,886],[416,894],[415,898],[411,900],[399,895],[401,905],[397,909],[392,905],[386,896],[382,905],[377,908],[374,904],[379,892],[368,898],[363,896],[364,892],[378,883],[382,876]],y=[[486,1075],[511,1068],[537,1073],[547,1085],[552,1101],[552,1116],[546,1128],[533,1135],[507,1137],[490,1132],[480,1123],[477,1108],[479,1091]],$={};for(let[N,T]of[["left",-1],["right",1]]){let L=pe=>N==="left"?pe:1156-pe,b=dt.map(([pe,Pe,We])=>N==="left"?[pe,Pe,We]:[pe,L(We),L(Pe)]),F=[...b.map(([pe,Pe])=>[Pe,pe]),...b.toReversed().map(([pe,Pe,We])=>[We,pe])],B=[[479,753],[467,761],[462,775],[457,793],[443,815],[425,838],[408,859],[400,870]].map(([pe,Pe])=>new I(h(L(pe)),u(Pe),.04)),K=new Dn(B,!1,"centripetal");tt({name:`${N} traced puff sleeve and cuff`,levels:Array.from({length:30},(pe,Pe)=>Pe/29),segments:40,axis:"shoulder-elbow-wrist",weights:(pe,Pe,We,Ve)=>k(N,Ve,We),materials:[A,_,d],contour:F,region:(pe,Pe)=>Math.cos(Pe)>=0?0:pe>.85?2:1,sample:(pe,Pe)=>{let We=K.getPoint(pe),Ve=K.getTangent(pe),Qe=new I(-Ve.y,Ve.x,0).normalize(),st=.034+.105*Math.pow(Math.sin(Math.PI*pe),.7),vt=Math.sin(Pe),ct=Math.cos(Pe),lt=We.clone().addScaledVector(Qe,st*vt),ft=f(lt.x),Dt=p(lt.y);return[ft,Dt]=Te(ft,Dt,F),lt.x=h(ft),lt.y=u(Dt),lt.z=We.z+ct*(.055+.1*Math.pow(Math.sin(Math.PI*pe),.7)),lt}}),D({name:`${N} traced open hand and fingers`,points:R.map(([pe,Pe])=>[L(pe),Pe]),weights:()=>[[ge(`${N}Hand`),1]],frontZ:.22,backZ:.135,materials:[A,M,M]});let Y=[[1001,486,548],[1015,479,546],[1034,479,545],[1050,482,543],[1070,484,543],[1085,482,545],[1095,484,544]].map(([pe,Pe,We])=>N==="left"?[pe,Pe,We]:[pe,L(We),L(Pe)]),se=Ye(Y);we({name:`${N} traced thigh, sock and ankle`,anchors:Y,weights:(pe,Pe,We,Ve)=>oe(N,Ve),frontDepth:.15,backDepth:.11,materials:[A,M,d],region:(pe,Pe)=>Math.cos(Pe)>=0?0:se[Math.round(pe)][0]>1043?2:1});let he=y.map(([pe,Pe])=>[L(pe),Pe]),_e=h(L(514)),Ce=u(1135),Ie=new Dn([new I(.03,.075,-.125),new I(.1,.19,-.1),new I(.13,.265,-.025),new I(.143,.252,.065),new I(.145,.19,.18),new I(.117,.125,.275),new I(.02,.028,.335)],!1,"centripetal");$[N]=tt({name:`${N} traced mary jane shoe`,levels:Array.from({length:33},(pe,Pe)=>Pe/32),segments:48,axis:"heel-instep-toe",weights:()=>[[ge(`${N}Foot`),1]],materials:[A,v,m],contour:he,region:(pe,Pe)=>Math.cos(Pe)<-.72?2:Ie.getPoint(pe).z>=-.015?0:1,sample:(pe,Pe)=>{let We=Ie.getPoint(pe),Ve=Math.max(0,(Math.cos(Pe)+.72)/1.72),Qe=f(_e+We.x*Math.sin(Pe)),st=p(Ce+We.y*Ve);return[Qe,st]=Te(Qe,st,he),new I(h(Qe),u(st),We.z)}})}let te=new Dn([new I(.31,-.2,-.31),new I(.45,-.34,-.32),new I(.6,-.45,-.33),new I(.75,-.49,-.34),new I(.88,-.47,-.34)],!1,"centripetal");tt({name:"continuous rounded whale tail stem",levels:Array.from({length:25},(N,T)=>T/24),segments:32,axis:"tail centerline",weights:xe,materials:[x,x,U],region:(N,T)=>Math.sin(T)<0?2:1,sample:(N,T)=>{let L=te.getPoint(N),b=te.getTangent(N),F=new I(-b.y,b.x,0).normalize();return L.addScaledVector(F,(.105-.02*N)*Math.sin(T)).addScaledVector(new I(0,0,1),(.095-.025*N)*Math.cos(T))}}),D({name:"indigo whale left biconvex fluke",weights:xe,frontZ:-.285,backZ:-.385,detail:3,materials:[S,x,P],points:[[712,941],[733,933],[753,949],[773,973],[792,985],[811,990],[816,1018],[808,1039],[785,1052],[761,1058],[737,1053],[716,1040],[700,1021],[690,1002],[695,978]]}),D({name:"indigo whale right biconvex fluke",weights:xe,frontZ:-.285,backZ:-.385,detail:3,materials:[S,x,P],points:[[811,990],[813,980],[815,970],[819,960],[824,950],[832,940],[843,930],[859,920],[889,910],[920,905],[933,900],[947,890],[958,883],[964,891],[967,906],[967,925],[965,946],[960,966],[954,985],[944,1005],[930,1022],[911,1038],[888,1050],[862,1057],[842,1057],[822,1049],[808,1039],[816,1018]]});let ce=-1.055,ne={};n.updateMatrixWorld(!0);for(let N of["left","right"]){let T=H[`${N}Foot`],L=$[N],b=T.matrixWorld.clone().invert(),F=[],B=L.geometry.attributes.position,K=1/0;for(let Ce=0;Ce<B.count;Ce++){let Ie=new I().fromBufferAttribute(B,Ce).applyMatrix4(L.bindMatrix).applyMatrix4(b);F.push(Ie),K=Math.min(K,Ie.y)}let X=new I,Y=0;for(let Ce of F)Ce.y<=K+1e-7&&(X.add(Ce),Y++);X.multiplyScalar(1/Y);let se=X.clone().applyMatrix4(T.matrixWorld),he=ue[`${N}LowerLeg`].clone(),_e=ue[`${N}Foot`].clone();ne[N]={sole:X,bindSole:se,minimum:K,upperVector:he,lowerVector:_e,upperLength:he.length(),lowerLength:_e.length()},L.userData.soleLocal=X.toArray(),L.userData.soleLocalMinimumY=K}function Ne(N,T){n.updateMatrix();let L=n.matrix.clone().invert(),b=n.quaternion.clone().invert(),F=new I(0,0,1).applyQuaternion(b),B={enabled:!0,groundY:ce,pelvisOffset:-.012,feet:{}};q.position.y=ue.hips.y+B.pelvisOffset;for(let[X,Y]of[["left",0],["right",Math.PI]]){let se=ne[X],he=H[`${X}UpperLeg`],_e=H[`${X}LowerLeg`],Ce=H[`${X}Foot`],Ie=N*5.4+Y,pe=Math.max(0,Math.sin(Ie)),Pe=Math.pow(pe,1.6)*.115*T,We=pe*pe*.055*T,Ve=se.bindSole.clone();Ve.y=ce+Pe,Ve.z+=We;let Qe=q.position.clone().add(he.position),st=Ve.clone().applyMatrix4(L).sub(se.sole.clone().applyQuaternion(b)),vt=Iu({hip:Qe,target:st,upperLength:se.upperLength,lowerLength:se.lowerLength,pole:F}),{knee:ct,ankle:lt,kneePole:ft,requestedDistance:Dt,distance:Lt,clamped:gn}=vt,Rn=new et().setFromUnitVectors(se.upperVector.clone().normalize(),ct.clone().sub(Qe).normalize()),Ui=new et().setFromUnitVectors(se.lowerVector.clone().normalize(),lt.clone().sub(ct).normalize());he.quaternion.copy(Rn),_e.quaternion.copy(Rn).invert().multiply(Ui),Ce.quaternion.copy(Ui).invert().multiply(b),B.feet[X]={support:Pe<1e-7,swingWeight:pe*T,lift:Pe,requestedDistance:Dt,reachableDistance:Lt,clamped:gn,lengths:[se.upperLength,se.lowerLength],requestedSole:Ve.toArray(),clampedAnkle:lt.toArray(),kneePoleForward:ft.dot(F),soleLocal:se.sole.toArray()}}n.updateMatrixWorld(!0);let K=i.matrixWorld.clone().invert();for(let X of["left","right"]){let Y=H[`${X}Foot`],se=ne[X],he=B.feet[X],_e=se.sole.clone().applyMatrix4(Y.matrixWorld).applyMatrix4(K),Ce=new I(0,1,0).transformDirection(Y.matrixWorld).transformDirection(K);he.actualSole=_e.toArray(),he.soleClearance=_e.y-ce,he.footLevelError=Ce.distanceTo(new I(0,1,0))}n.userData.grounding=B}function fe(N,T){if(T<=1e-8){n.userData.waveArm={enabled:!1,weight:0};return}let L=H.leftUpperArm,b=H.leftForeArm,F=H.leftHand,B=L.position.clone(),K=L.quaternion.clone(),X=K.clone().multiply(b.quaternion),Y=X.clone().multiply(F.quaternion),se=b.position.clone().applyQuaternion(K).add(B),he=F.position.clone().applyQuaternion(X).add(se),_e=n.matrixWorld.clone().invert().multiply(ae.matrixWorld),Ce=_e.clone().invert(),Ie=new I(-.69,.26,.17).applyMatrix4(Ce),pe=new I(-.78,.78,.22).applyMatrix4(Ce),Pe=a(0,.84,T),We=a(.84,1,T),Ve=T<.3?he.clone().lerp(Ie,a(0,.3,T)):Ie.clone().lerp(pe,a(.3,.84,T)),Qe=he.clone().sub(B).normalize(),st=se.clone().sub(B);st.addScaledVector(Qe,-st.dot(Qe)),st.lengthSq()<1e-10&&st.set(-.2,-.2,-1),st.normalize();let vt=new I(-.7,-.5,.5).transformDirection(Ce),ct=new et().setFromUnitVectors(st,vt),lt=st.clone().applyQuaternion(new et().slerp(ct,Pe)),ft=ue.leftForeArm,Dt=ue.leftHand,Lt=Iu({hip:B,target:Ve,upperLength:ft.length(),lowerLength:Dt.length(),pole:lt}),gn=new et().setFromUnitVectors(ft.clone().normalize(),Lt.knee.clone().sub(B).normalize()),Rn=new et().setFromUnitVectors(Dt.clone().normalize(),Lt.ankle.clone().sub(Lt.knee).normalize());L.quaternion.copy(gn),b.quaternion.copy(gn).invert().multiply(Rn);let Ui=new et().setFromRotationMatrix(_e),Sr=new et().setFromEuler(new zt(-.08,.1,-2.05+We*Math.sin(N*5.8-.7)*.18,"YXZ"));Sr.premultiply(Ui.invert()),F.quaternion.copy(Rn).invert().multiply(Y.slerp(Sr,Pe)),n.updateMatrixWorld(!0);let br=F.getWorldPosition(new I).applyMatrix4(n.matrixWorld.clone().invert()),E=Ve.clone().applyMatrix4(_e);n.userData.waveArm={enabled:!0,weight:T,stage:T<.3?"prepare":T<.84?"raise":"wrist",requestedWrist:E.toArray(),actualWrist:br.toArray(),clamped:Lt.clamped,requestedDistance:Lt.requestedDistance,reachableDistance:Lt.distance,lengths:[ft.length(),Dt.length()],targetError:br.distanceTo(E)}}let De=!1,Le=0,le=0;function ve(N,T,L={}){let b=Number.isFinite(T)?T:0,F=r(Number(N)||0,0,.05),B=De&&F>0?1-Math.exp(-F*9):1,K=Number.isFinite(L.wave)?r(L.wave,0,1):L.action==="wave"?1:0,X=Number.isFinite(L.walk)?r(L.walk,0,1):L.action==="walk"?1:0;Le=Number.isFinite(L.wave)?K:o(Le,K,B),le=Number.isFinite(L.walk)?X:o(le,X,B),De=!0;let Y=L.mode==="idle",se=Y?Math.sin(b*1.7):0;n.rotation.y=-r(Number(L.yaw)||0,-.44,.44)*.1;let he=L.grounded!==!1;n.position.y=he?0:se*.003;for(let[Ie,pe]of Object.entries(H))pe.rotation.set(0,0,0),pe.position.copy(ue[Ie]),pe.scale.set(1,1,1);H.spine.rotation.z=se*.003,H.chest.rotation.x=se*.006,H.spine.scale.set(1,1,1);let _e=b*5.4;for(let[Ie,pe]of[["left",-1],["right",1]]){let Pe=_e+(Ie==="left"?0:Math.PI),We=Math.sin(Pe),Ve=H[`${Ie}UpperArm`],Qe=H[`${Ie}ForeArm`],st=H[`${Ie}Hand`];Ve.rotation.x=-We*.13*le,Ve.rotation.z=pe*(.012+se*.007)*(1-le),Qe.rotation.z=pe*.015;let vt=H[`${Ie}UpperLeg`],ct=H[`${Ie}LowerLeg`],lt=H[`${Ie}Foot`];vt.rotation.x=We*.32*le,ct.rotation.x=Math.max(0,-We)*.4*le,lt.rotation.x=-vt.rotation.x*.34-ct.rotation.x*.55,lt.rotation.z=pe*.015}let Ce=Y?Math.sin(b*1.35)*.018:0;H.skirtLeft.rotation.z=-Ce-Math.sin(_e)*.025*le,H.skirtRight.rotation.z=Ce+Math.sin(_e)*.025*le,H.skirtFront.rotation.x=se*.009+Math.sin(_e*2)*.022*le,H.skirtBack.rotation.x=-se*.007-Math.sin(_e*2+.5)*.019*le,H.tailBase.rotation.y=(Y?Math.sin(b*1.35)*.055:0)+Math.sin(_e)*.035*le,H.tailBase.rotation.z=Y?Math.sin(b*1.1)*.017:0,H.tailMid.rotation.y=Y?Math.sin(b*1.35-.5)*.085:0,H.tailTip.rotation.z=Y?Math.sin(b*1.35-1)*.025:0,he?Ne(b,le):(n.userData.grounding={enabled:!1,groundY:ce},n.updateMatrixWorld(!0)),fe(b,Le)}let ke={version:2,scope:"Full-body continuous cross-section volume and skeletal study; side/back designs are inferred",source:"production/v1/neutral-front.png",sourceSize:[l,c],garmentIsAuxiliary:!0,geometry:"Shared indexed 360-degree bodice/skirt, limb-axis sleeves, rounded flat-sole shoes, tubular tail stem and thin-edge biconvex flukes; all parts are SkinnedMesh",frontProjection:"Preserve front XY within fitted source contours; original UV is used only on forward surfaces. Side/back materials are explicitly inferred.",inferredSurfaces:["Back and side bodice fabric","Circumferential skirt lining and white rear hem","Back of puff sleeves and cuff rings","Shoe heels, soles and side leather","Whale tail stem and rear fin colors"],boneCount:W.length,meshCount:be.length,sourceMapping:{x:"(px-580)/260",y:".20+(835-py)/260; lower legs stretched by 1.18"},landmarks:{collar:.7,waist:.2,hem:-.49,feet:-1.055},actionInputs:["wave and walk continuous weights [0,1]","action idle/wave/walk fallback","yaw radians, mode idle/manual"],grounding:{default:!0,groundY:ce,method:"Constant-length two-bone IK with bind-vertex-derived sole reference; level feet and forward knee pole",pelvisOffset:-.012,diagnostics:"root.userData.grounding"},wave:{method:"Fixed shoulder attachment and constant-length two-bone arm IK; prepare, raise, then wrist rotation",raisedWrist:[-.78,.78,.22],diagnostics:"root.userData.waveArm"},limitations:["Front auxiliary garment is painted; side and back are authored solid colors","Walk is an in-place step with local foot IK; collisions and travel controller remain separate","Shoulder and cloth weights are a visual study, not a validated physical simulation","Tail palette is muted separately from the brighter auxiliary drawing"],jointKeys:Object.keys(H)};return ve(0,0,{mode:"manual",action:"idle"}),{root:n,bones:H,update:ve,metadata:ke}}var Mr=(i,e=0)=>Number.isFinite(Number(i))?Number(i):e,wa=i=>mt.clamp(Mr(i),0,1);function Du(){let i={happy:0,sad:0,wave:0,walk:0},e=!1;return{update(t,n,s={}){let r=mt.clamp(Mr(t),0,.05),o=Mr(n),a=s.mode==="idle",l={happy:s.happy===void 0?s.mood==="happy"?1:0:wa(s.happy),sad:s.sad===void 0?s.mood==="sad"?1:0:wa(s.sad),wave:s.action==="wave"?1:0,walk:s.action==="walk"?1:0};for(let g of Object.keys(i)){let _=g==="wave"?5.5:g==="walk"?4.5:8,m=r>0&&e?1-Math.exp(-_*r):1;i[g]+=(l[g]-i[g])*m}e=!0;let c=i.wave,h=mt.clamp(Mr(s.gazeX)+(a?Math.sin(o*.71)*.1:0)+c*.035,-1,1),u=mt.clamp(Mr(s.gazeY)+(a?Math.sin(o*.53)*.055:0)+c*.03,-1,1),f=(o+2.6)%4.9,p=a&&f<.22?Math.sin(Math.PI*f/.22)**2:0;return{...s,...i,gazeX:h,gazeY:u,blink:Math.max(wa(s.blink),p),talking:wa(s.talk??s.talking),headYawOffset:a?Math.sin(o*.47)*.026:0,headPitchOffset:a?Math.sin(o*.63+.4)*.009-c*.014:0,headRoll:a?Math.sin(o*.39)*.006:0}},snapshot:()=>({...i})}}function Lu({root:i,bones:e}={}){if(!i?.isObject3D||!e||typeof e!="object")throw new TypeError("Secondary motion requires root and the painted body bones");let t=1/120,n=6,s=t*n,r=1e-10,o=.65,a=.25,l=Math.PI*.6,c=mt.clamp,h=T=>Number.isFinite(T.x)&&Number.isFinite(T.y)&&Number.isFinite(T.z),u=T=>h(T)&&Number.isFinite(T.w),f=T=>T?.isVector3?T.clone():Array.isArray(T)?new I(...T):null,p=["tailBase","tailMid","tailTip","skirtLeft","skirtRight","skirtFront","skirtBack"];for(let T of p)if(!e[T]?.isBone)throw new TypeError(`Missing secondary bone: ${T}`);if(e.tailMid.parent!==e.tailBase||e.tailTip.parent!==e.tailMid)throw new Error("tailBase \u2192 tailMid \u2192 tailTip must be an actual bone chain");i.updateWorldMatrix(!0,!0);let g=new I(0,1,0),_=new I(1,0,0),m=new I,d=new I,M=new I,v=new I,x=new I,P=new I,A=new I,C=new I,O=new I,w=new I,S=new I,U=new I,W=new I,J=new I,H=new ot,z=new et,q=new et,ae=new I,Z=new et,ee=new I,re=new I,ue=new et,ge=new I,ie=new I,Se=new I,me={tailBase:{kind:"tail",axis:e.tailMid.position,stiffness:195,damping:11,angle:.22,radius:.035,gravity:.055},tailMid:{kind:"tail",axis:e.tailTip.position,stiffness:165,damping:10,angle:.34,radius:.045,gravity:.065},tailTip:{kind:"tail",axis:e.tailTip.position.clone().normalize().multiplyScalar(.2),stiffness:145,damping:10,angle:.4,radius:.055,gravity:.07},skirtLeft:{kind:"skirt",axis:new I(-.12,-.58,0),stiffness:265,damping:14,angle:.24,radius:.02,gravity:.13},skirtRight:{kind:"skirt",axis:new I(.12,-.58,0),stiffness:265,damping:14,angle:.24,radius:.02,gravity:.13},skirtFront:{kind:"skirt",axis:new I(0,-.58,.12),stiffness:285,damping:15,angle:.22,radius:.02,gravity:.13},skirtBack:{kind:"skirt",axis:new I(0,-.58,-.12),stiffness:285,damping:15,angle:.22,radius:.02,gravity:.13}},k=p.map(T=>{let L=e[T],b=me[T],F=f(L.userData.secondaryAxis)||b.axis.clone();if(!h(F)||F.lengthSq()<r)throw new Error(`Zero or invalid secondary axis: ${T}`);let B=Number(L.userData.secondaryLimit),K=Number(L.userData.secondaryRadius);return{key:T,bone:L,axis:F,kind:b.kind,stiffness:b.stiffness,damping:b.damping,angle:Number.isFinite(B)?c(B,.001,.8):b.angle,radius:Number.isFinite(K)?c(K,0,.2):b.radius,gravity:b.gravity,target:L.quaternion.clone(),applied:L.quaternion.clone(),delta:new et,current:new I,previous:new I,initialPosition:L.position.clone(),initialScale:L.scale.clone(),length:0,actualLength:0,deflection:0,penetration:0}}),oe=[],xe=e.hips||e.pelvis,Fe=e.chest||e.spine;xe&&oe.push({name:"hips",type:"sphere",bone:xe,offset:new I(0,-.08,0),radius:.255}),xe&&Fe&&oe.push({name:"body",type:"capsule",startBone:xe,endBone:Fe,startOffset:new I(0,.06,0),endOffset:new I,radius:.19});for(let T of["left","right"]){let L=e[`${T}UpperLeg`],b=e[`${T}LowerLeg`],F=e[`${T}Foot`];L&&b&&oe.push({name:`${T} thigh`,type:"capsule",startBone:L,endBone:b,startOffset:new I,endOffset:new I,radius:.095}),b&&F&&oe.push({name:`${T} shin`,type:"capsule",startBone:b,endBone:F,startOffset:new I,endOffset:new I,radius:.078})}let be=!1,Be=0,Ye=1,D=0,it="initial",ye=0,Te=0,Ae=0,tt=!1,we=[],Ze=[],gt={type:"painted-tail-and-skirt-secondary-motion",method:"fixed-step damped world-space Verlet with a moving animated spring target",fixedStep:t,maxSubsteps:n,maxFrameSeconds:s,gravity:[0,-9.81,0],controlledBones:p,input:"secondaryStrength [0,1], default 1; body animation runs first; dt 0 freezes dynamics",overrides:"bone.userData.secondaryAxis (local tip vector), secondaryLimit (radians), secondaryRadius",resetConditions:{rootTeleportDistance:o,rootTeleportAngle:l,longFrameSeconds:a},scope:"Seven bone-tip particles and sphere/capsule tip collisions; not full mesh cloth, rigid bodies or self collision",limitations:["Fixed lengths and angle limits take precedence over impossible collider contacts.","Nonuniform ancestor scale suspends physics.","Tail roots are anchored by the primary skeleton; no root translation is introduced."]};function dt(){i.matrixWorld.decompose(ae,Z,ee)}function R(){re.copy(ae),ue.copy(Z),ge.copy(ee)}function y(){let T=!1;for(let L of k){if(!u(L.bone.quaternion))throw new Error(`Invalid target quaternion: ${L.key}`);(!be||L.bone.quaternion.angleTo(L.applied)>1e-7)&&(T=T||L.target.angleTo(L.bone.quaternion)>1e-7,L.target.copy(L.bone.quaternion).normalize()),L.bone.quaternion.copy(L.target)}return i.updateWorldMatrix(!0,!0),T}function $(T,L){return L.copy(T.axis).multiply(T.bone.scale).applyQuaternion(T.target).add(T.bone.position).applyMatrix4(T.bone.parent.matrixWorld)}function te(T,L=!0){if(L)for(let b of k)b.bone.quaternion.copy(b.target),b.delta.identity(),b.applied.copy(b.target);i.updateWorldMatrix(!0,!0);for(let b of k)b.current.copy(b.axis).applyMatrix4(b.bone.matrixWorld),b.previous.copy(b.current);Be=0,dt(),R(),be=!0,it=T,T!=="initial"&&D++}function ce(){return oe.map(T=>{(T.bone||T.startBone).getWorldScale(ie);let b=T.radius*Math.max(Math.abs(ie.x),Math.abs(ie.y),Math.abs(ie.z));return T.type==="sphere"?{name:T.name,type:T.type,center:T.bone.localToWorld(T.offset.clone()),radius:b}:{name:T.name,type:T.type,start:T.startBone.localToWorld(T.startOffset.clone()),end:T.endBone.localToWorld(T.endOffset.clone()),radius:b}})}function ne(T,L,b){if(T.type==="sphere")return b.copy(T.center);S.copy(T.end).sub(T.start);let F=S.lengthSq()<r?0:c(U.copy(L).sub(T.start).dot(S)/S.lengthSq(),0,1);return b.copy(T.start).addScaledVector(S,F)}function Ne(T,L,b){A.copy(T).sub(m),!h(A)||A.lengthSq()<r?A.copy(M):A.normalize();let F=Math.acos(c(A.dot(M),-1,1));F>b&&(z.setFromUnitVectors(M,A),q.identity().slerp(z,b/F),A.copy(M).applyQuaternion(q).normalize()),T.copy(m).addScaledVector(A,L)}function fe(T,L,b,F){ne(b,T,w);let B=b.radius+F;if(T.distanceToSquared(w)>=B*B-1e-12)return;C.copy(w).sub(m);let K=C.length();if(K<r)return;C.divideScalar(K);let X=(K*K+L*L-B*B)/(2*K*L);X<-1||X>=1||(A.copy(T).sub(m).normalize(),O.copy(A).addScaledVector(C,-A.dot(C)),O.lengthSq()<r&&O.copy(M).addScaledVector(C,-M.dot(C)),O.lengthSq()<r&&O.crossVectors(C,Math.abs(C.y)<.9?g:_),O.normalize(),T.copy(m).addScaledVector(C,L*X).addScaledVector(O,L*Math.sqrt(Math.max(0,1-X*X))))}function De(T,L){H.copy(T.bone.parent.matrixWorld).invert(),W.copy(L).applyMatrix4(H).sub(T.bone.position).normalize(),J.copy(T.axis).multiply(T.bone.scale).applyQuaternion(T.target).normalize(),z.setFromUnitVectors(J,W),T.bone.quaternion.copy(z).multiply(T.target).normalize(),T.applied.copy(T.bone.quaternion),T.delta.copy(z),T.bone.updateMatrixWorld(!0),T.current.copy(T.axis).applyMatrix4(T.bone.matrixWorld)}function Le(T){for(let L of k){L.bone.getWorldPosition(m),$(L,d),M.copy(d).sub(m);let b=M.length();if(!Number.isFinite(b)||b<r)throw new Error(`Invalid animated segment: ${L.key}`);M.divideScalar(b),x.copy(L.current).sub(L.previous).multiplyScalar(Math.exp(-L.damping*t)),x.clampLength(0,Math.min(b*.22,.045)),P.copy(d).sub(L.current).multiplyScalar(L.stiffness),P.y-=9.81*L.gravity*T,v.copy(L.current).add(x).addScaledVector(P,t*t),L.bone.getWorldScale(ie);let F=L.radius*Math.abs(ie.x),B=L.angle*T;for(let K=0;K<10;K++){Ne(v,b,B);for(let X of we)fe(v,b,X,F)}Ne(v,b,B),L.previous.copy(L.current),De(L,v)}}function le(T){Ze=[];for(let L of k){L.bone.getWorldPosition(m),$(L,d),Se.copy(L.axis).applyMatrix4(L.bone.matrixWorld),L.length=m.distanceTo(d),L.actualLength=m.distanceTo(Se),L.deflection=L.target.angleTo(L.bone.quaternion),L.penetration=0,L.bone.getWorldScale(ie);let b=L.radius*Math.abs(ie.x);if(T>0&&!tt)for(let F of we){ne(F,Se,w);let B=Math.max(0,F.radius+b-Se.distanceTo(w));L.penetration=Math.max(L.penetration,B),B>1e-5&&Ze.push({bone:L.key,collider:F.name,penetration:B,reason:"contact unresolved within fixed-length and joint-angle limits"})}}}function ve(){y(),te("explicit-reset"),we=ce(),le(Ye)}function ke(T,L,b={}){let F=y();dt();let B=Number(b.secondaryStrength);B=Number.isFinite(B)?c(B,0,1):1;let K=b.paused?0:Number(T),X=Number.isFinite(K)?Math.max(0,K):0,se=be&&(ae.distanceTo(re)>1e-8||Z.angleTo(ue)>1e-7||ee.distanceTo(ge)>1e-8)||F;ye=0,tt=!1;for(let he of k){he.bone.parent.getWorldScale(ie);let _e=Math.max(Math.abs(ie.x),Math.abs(ie.y),Math.abs(ie.z));(!h(ie)||_e<r||Math.max(Math.abs(Math.abs(ie.x)-Math.abs(ie.y)),Math.abs(Math.abs(ie.x)-Math.abs(ie.z)))>_e*1e-5)&&(tt=!0)}if(be?ae.distanceTo(re)>o||Z.angleTo(ue)>l||ee.distanceTo(ge)>1e-5?(te("teleport-or-scale"),se=!1):X>a&&(te("long-frame"),se=!1):(te("initial"),se=!1),B===0||tt){te(B===0?"disabled":"nonuniform-scale"),Ye=B,we=ce(),le(B);return}if(Ye===0&&te("enabled"),B<Ye&&Ye>0){for(let he of k)he.delta.slerp(new et,1-B/Ye);se=!0}if(X===0){for(let he of k)he.bone.quaternion.copy(he.delta).multiply(he.target).normalize(),he.applied.copy(he.bone.quaternion),he.bone.updateMatrixWorld(!0);se&&te("paused-pose-edit",!1),we=ce(),le(B),R(),Ye=B;return}for(we=ce(),Be+=Math.min(X,s),Ae+=Math.max(0,X-s);Be+1e-12>=t&&ye<n;)Le(B),Be=Math.max(0,Be-t),ye++,Te++;if(ye===0)for(let he of k)he.bone.quaternion.copy(he.delta).multiply(he.target).normalize(),he.applied.copy(he.bone.quaternion),he.bone.updateMatrixWorld(!0);i.updateWorldMatrix(!0,!0),le(B),dt(),R(),Ye=B}function N(){return{type:gt.type,fixedStep:t,substeps:ye,totalSteps:Te,simulatedSeconds:Te*t,accumulator:Be,droppedSeconds:Ae,strength:Ye,suspended:tt,resetCount:D,lastResetReason:it,finite:k.every(T=>h(T.current)&&h(T.previous)&&u(T.bone.quaternion)),maxLengthError:Math.max(...k.map(T=>Math.abs(T.actualLength-T.length))),maxPenetration:Math.max(...k.map(T=>T.penetration)),maxDeflection:Math.max(...k.map(T=>T.deflection)),limitations:Ze.map(T=>({...T})),particles:k.map(T=>({name:T.key,kind:T.kind,current:T.current.toArray(),previous:T.previous.toArray(),target:T.target.toArray(),applied:T.applied.toArray(),localAnchor:T.bone.position.toArray(),localAxis:T.axis.toArray(),length:T.length,actualLength:T.actualLength,deflection:T.deflection,angleLimit:T.angle*Ye,radius:T.radius,penetration:T.penetration})),colliders:we.map(T=>({...T,center:T.center?.toArray(),start:T.start?.toArray(),end:T.end?.toArray()}))}}return y(),te("initial"),we=ce(),le(1),{update:ke,reset:ve,metadata:gt,snapshot:N}}var Ta=mt.degToRad,Aa=(i,e=0)=>Number.isFinite(Number(i))?Number(i):e,Li=mt.clamp;function Uu(i,{garmentTexture:e,turnaroundTexture:t}={}){if(!i?.isTexture)throw new TypeError("Original reference texture is required");let n=new Set,s=new Bt;s.name="dafeiyu-animation-look-study";let r=new Pn;r.name="head-control",r.position.y=1.1,r.rotation.order="YXZ",s.add(r);let o=Pu({parent:s,resources:n,garmentTexture:e});s.updateMatrixWorld(!0),o.bones.chest.attach(r);let a=vu({head:r,resources:n,texture:i,sourceWidth:1920,sourceHeight:1080}),l=Cu({head:r,resources:n,texture:i,garmentTexture:e,turnaroundTexture:t,sourceWidth:1920,sourceHeight:1080}),c=Du(),h=Lu({root:s,bones:o.bones}),u=new et,f=new et,p=new et,g=new zt(0,0,0,"YXZ"),_=new zt(0,0,0,"YXZ"),m=!1,d=!1,M=0,v=0,x=0,P=0;function A(w,S,U={}){if(m)return;let W=Li(Aa(w),0,.05),J=Aa(S),H=U.mode==="idle",z=c.update(W,J,U),q=Li(Aa(U.yaw)+z.headYawOffset,-Ta(25),Ta(25)),ae=Li(Aa(U.pitch)+z.headPitchOffset,-Ta(8),Ta(8));if(W===0||!d)M=q,v=ae,x=P=0;else{let ue=Math.ceil(W*120),ge=W/ue;for(let ie=0;ie<ue;ie++)x=Li(x+Li((q-M)*140-x*24,-14,14)*ge,-2,2),P=Li(P+Li((ae-v)*140-P*24,-10,10)*ge,-1.1,1.1),M+=x*ge,v+=P*ge}d=!0;let{blink:Z,talking:ee}=z,re={...z,yaw:M,pitch:v,blink:Z,talk:ee,talking:ee};o.update(W,J,re),s.updateMatrixWorld(!0),s.getWorldQuaternion(p),r.parent.getWorldQuaternion(f),u.setFromEuler(g.set(v,M,z.headRoll)),u.premultiply(p),r.quaternion.copy(f.invert().multiply(u)),a.update(W,J,re),s.updateMatrixWorld(!0),h.update(W,J,re),l.update(W,J,re),r.getWorldQuaternion(u),_.setFromQuaternion(p.invert().multiply(u),"YXZ"),s.userData.secondaryMotion=h.snapshot(),s.userData.appliedPose={yaw:_.y,pitch:_.x,blink:Z,talking:ee,gazeX:re.gazeX,gazeY:re.gazeY,mood:re.mood,mode:U.mode,wave:re.wave,walk:re.walk,happy:re.happy,sad:re.sad},O.bounds=U.framing==="full"?{min:[-1.18,-1.12,-.65],max:[1.57,2.25,.7]}:{min:[-1.14,.24,-.65],max:[1.14,2.25,.65]}}function C(){if(!m){m=!0,a.dispose(),s.removeFromParent();for(let w of n)w.dispose();n.clear()}}let O={version:2,scope:"Front painted character and continuous animation study; not a finished avatar",fullBody:!0,bounds:{min:[-1.14,.24,-.65],max:[1.14,2.25,.65]},source:"references/video-covers/BV1g2JX6HEHX.jpg",geometry:"Curved face with real eye/mouth holes and closed thick hair panels",limitations:["Supported head yaw \xB125\xB0, pitch \xB18\xB0","Cropped crown and hidden head surfaces are inferred","Body is a front painted skeletal study; ground contacts and full interaction remain unfinished"],face:a.metadata,hair:l.metadata,bust:o.metadata,secondary:h.metadata};return A(0,0,{mode:"manual",mood:"neutral"}),{root:s,head:r,bones:o.bones,update:A,dispose:C,metadata:O,getGrounding:()=>o.root.userData.grounding,getSecondaryState:()=>h.snapshot()}}var Ca=Object.freeze([{name:"thumb",base:[397.5,880],tip:[415.7,884.8],fractions:[0,.42,.72],maxFlex:[35,65,70]},{name:"index",base:[393.3,884.4],tip:[414,896.2],fractions:[0,.42,.72],maxFlex:[70,95,65]},{name:"middle",base:[389,885.5],tip:[397.4,906.8],fractions:[0,.42,.72],maxFlex:[75,100,70]},{name:"ring",base:[385.3,884.4],tip:[377.7,906],fractions:[0,.42,.72],maxFlex:[75,100,70]},{name:"little",base:[382.7,881.4],tip:[365.8,895],fractions:[0,.42,.72],maxFlex:[70,95,65]}]),Ra=(i,e=0,t=1)=>Math.max(e,Math.min(t,i)),ol=i=>(i=Ra(i),i*i*(3-2*i));function f_(i){return i<=1003?.2+(835-i)/260:.2+-168/260+(1003-i)/260*1.18}function Fu(i,e,t,n){let s=e==="left"?t:1156-t;return new I((s-580)/260,f_(n),(.22+.135)/2).applyMatrix4(i.bindMatrix)}function p_(i){if(i<.36)return[1,0,0];if(i<.49){let e=ol((i-.36)/.13);return[1-e,e,0]}if(i<.66)return[0,1,0];if(i<.8){let e=ol((i-.66)/.14);return[0,1-e,e]}return[0,0,1]}function m_(i,e){let t=null;for(let n of Ca){let s=n.tip[0]-n.base[0],r=n.tip[1]-n.base[1],o=Math.hypot(s,r),a=((i-n.base[0])*s+(e-n.base[1])*r)/(o*o);if(a<0||a>1.25)continue;let l=Math.abs((i-n.base[0])*r-(e-n.base[1])*s)/o,c=.18*o+1.15,h=ol((a-.025)/.29)*Math.exp(-Math.pow(l/c,4));(!t||h>t.strength)&&(t={digit:n,t:a,strength:h})}return t}function Nu({root:i,bones:e}){i.updateMatrixWorld(!0);let t={},n=[];if(i.traverse(_=>{_.isSkinnedMesh&&n.push(_);for(let m of["left","right"])_.name===`${m} traced open hand and fingers`&&(t[m]=_)}),!t.left||!t.right)throw new Error("Selected source hands are required");let s=t.left.skeleton;if(t.right.skeleton!==s)throw new Error("Source body must have its shared skeleton");let r=[...s.bones],o=s.boneInverses.map(_=>_.clone()),a=new Map,l={},c=[],h=new Map;for(let _ of["left","right"]){let m=t[_],d=e[`${_}Hand`],M=r.indexOf(d);if(M<0)throw new Error("Missing real wrist bone");let v=s.boneInverses[M].clone().invert(),x={mesh:m,wrist:d,wristIndex:M,digits:{}};l[_]=x;for(let S of Ca){let U=Fu(m,_,...S.base),W=Fu(m,_,...S.tip),J=W.clone().sub(U).normalize(),H=new I(0,0,1).transformDirection(m.bindMatrix),z=J.clone().cross(H).normalize();H.copy(z).cross(J).normalize();let q=[],ae=[],Z=[],ee=[],re=[],ue=d,ge=v;for(let ie=0;ie<3;ie++){let Se=new ot().makeBasis(z,J,H).setPosition(U.clone().lerp(W,S.fractions[ie])),me=ge.clone().invert().multiply(Se),k=new Pn;k.name=`${_} ${S.name} joint ${ie+1}`,me.decompose(k.position,k.quaternion,k.scale),k.updateMatrix(),ue.add(k),ie===0&&c.push(k),k.userData.selectedAppearanceFinger={side:_,digit:S.name,phalanx:ie+1},q.push(k),ae.push(r.length),Z.push(k.quaternion.clone()),ee.push(Se.clone()),r.push(k),o.push(Se.clone().invert()),re.push(U.distanceTo(W)*((S.fractions[ie+1]??1)-S.fractions[ie])),ue=k,ge=Se}x.digits[S.name]={spec:S,joints:q,indices:ae,restQuaternions:Z,bindMatrices:ee,lengths:re}}let P=m.geometry;h.set(m,P);let A=P.clone(),C=A.getAttribute("position"),O=new Uint16Array(C.count*4),w=new Float32Array(C.count*4);for(let S=0;S<C.count;S++){let U=C.getX(S)*260+580,W=_==="left"?U:1156-U,J=835-(C.getY(S)-.2)*260,H=m_(W,J),z=H?Ra(H.strength):0,q=[[M,1-z]];if(H&&z>1e-7){let Z=x.digits[H.digit.name],ee=p_(H.t);q.push(...ee.map((re,ue)=>[Z.indices[ue],re*z]))}q=q.filter(([,Z])=>Z>1e-8).sort((Z,ee)=>ee[1]-Z[1]).slice(0,4);let ae=q.reduce((Z,[,ee])=>Z+ee,0);for(let Z=0;Z<4;Z++)O[S*4+Z]=q[Z]?.[0]??M,w[S*4+Z]=(q[Z]?.[1]??0)/ae}A.setAttribute("skinIndex",new Wn(O,4)),A.setAttribute("skinWeight",new Je(w,4)),m.geometry=A,a.set(_,Float32Array.from(C.array))}let u=new vi(r,o);for(let _ of n)_.skeleton===s&&(_.skeleton=u);i.updateMatrixWorld(!0),u.update();function f(_,m={}){let d=l[_];if(!d)throw new Error("Unknown hand");for(let M of Object.values(d.digits)){let v=Ra(Number(m[M.spec.name]??m.grip??0));for(let x=0;x<3;x++){let P=M.restQuaternions[x].clone();if(x===0&&M.spec.name==="thumb"){let A=Ra(Number(m.opposition??0)),C=_==="left"?-1:1;P.multiply(new et().setFromAxisAngle(new I(0,0,1),C*.55*A)),P.multiply(new et().setFromAxisAngle(new I(0,1,0),C*.55*A))}P.multiply(new et().setFromAxisAngle(new I(1,0,0),mt.degToRad(M.spec.maxFlex[x])*v)),M.joints[x].quaternion.copy(P)}}i.updateMatrixWorld(!0),u.update()}function p(){return{schema:"dafeiyu.source-finger-rig.v1",sourceBodyBones:s.bones.length,bodyBones:u.bones.length,addedBones:u.bones.length-s.bones.length,scope:"Original closed five-digit geometry and source UV/materials are retained. Additional joints/weights only. This does not certify anatomical final quality, contact, self-collision or force-closure grasping.",coordinates:"Original study bind units, Y up, +Z front. Not a calibrated physical metre scale.",hands:Object.fromEntries(Object.entries(l).map(([_,m])=>[_,{wrist:m.wrist.name,digits:Object.fromEntries(Object.entries(m.digits).map(([d,M])=>[d,{bones:M.joints.map(v=>v.name),indices:M.indices,bindMatrices:M.bindMatrices.map(v=>v.toArray()),lengths:M.lengths,maxFlexDegrees:M.spec.maxFlex,restLocalQuaternions:M.restQuaternions.map(v=>v.toArray())}]))}]))}}function g(){for(let _ of n)_.skeleton===u&&(_.skeleton=s);for(let[_,m]of h)_.geometry.dispose(),_.geometry=m;for(let _ of c)_.removeFromParent();u.dispose(),i.updateMatrixWorld(!0)}return{root:i,skeleton:u,oldSkeleton:s,hands:t,digitMap:l,setPose:f,metadata:p,dispose:g}}var Ou=document.getElementById("status");try{let h=function(){let u=document.getElementById("side").value;n.root.traverse(d=>{d.isMesh&&(d.visible=d===s.hands[u])});let f=Number(document.getElementById("grip").value),p={grip:f,opposition:Number(document.getElementById("opposition").value)};for(let[d,M]of Object.entries(l))p[d]=Math.min(1,f+Number(M.value));s.setPose(u,p);let g=mt.degToRad(Number(document.getElementById("view").value)),_=c[u];o.position.copy(_).add(new I(2*Math.sin(g),0,2*Math.cos(g))),o.lookAt(_),a.render(r,o),Ou.textContent="\u539F\u7F51\u683C\u4E0A\u7684\u6307\u9AA8\u53D8\u5F62\uFF1B\u4ECD\u9700\u68C0\u67E5\u5173\u8282\u5904\u5F62\u6001\u3001\u76AE\u80A4\u8936\u76B1\u4E0E\u771F\u5B9E\u63A5\u89E6\u3002";let m=document.getElementById("export");m.href=a.domElement.toDataURL("image/png"),m.hidden=!1,document.body.dataset.pose=JSON.stringify({side:u,values:p,cameraDegrees:Number(document.getElementById("view").value)})},i=new rr,e="../appearance-baseline-20261027/assets/",t=await Promise.all(["BV1g2JX6HEHX.jpg","neutral-front.png","turnaround-auxiliary-v2.png"].map(u=>i.loadAsync(e+u)));for(let u of t)u.colorSpace=Ut,u.anisotropy=4;let n=Uu(t[0],{garmentTexture:t[1],turnaroundTexture:t[2]});n.update(0,0,{mode:"manual",mood:"neutral",framing:"full"});let s=Nu(n),r=new Ws;r.add(n.root);let o=new as(-.24*4/3,.24*4/3,.24,-.24,.01,20),a=new _a({alpha:!0,antialias:!0,preserveDrawingBuffer:!0});a.setSize(640,480,!1),a.setPixelRatio(1),a.outputColorSpace=Ut,a.toneMapping=wn,a.setClearColor(0,0),document.getElementById("stage").append(a.domElement);let l={};for(let[u,f]of Ca.entries()){let p=document.createElement("label");p.textContent=["\u62C7\u6307","\u98DF\u6307","\u4E2D\u6307","\u65E0\u540D\u6307","\u5C0F\u6307"][u];let g=document.createElement("input");g.type="range",g.min=0,g.max=1,g.step=.01,g.value=0,g.id=f.name,p.append(g),document.getElementById("digits").append(p),l[f.name]=g}let c={};for(let u of["left","right"]){let f=s.hands[u];n.root.updateMatrixWorld(!0),f.skeleton.update();let p=new bn;for(let g=0;g<f.geometry.attributes.position.count;g++)p.expandByPoint(f.applyBoneTransform(g,new I().fromBufferAttribute(f.geometry.attributes.position,g)).applyMatrix4(f.matrixWorld));c[u]=p.getCenter(new I)}document.querySelectorAll("input,select").forEach(u=>u.addEventListener("input",h)),h(),window.addEventListener("pagehide",()=>{s.dispose(),n.dispose(),t.forEach(u=>u.dispose()),a.dispose(),a.forceContextLoss()},{once:!0})}catch(i){Ou.textContent="\u624B\u90E8\u7814\u7A76\u52A0\u8F7D\u5931\u8D25\uFF1A"+i.message}
