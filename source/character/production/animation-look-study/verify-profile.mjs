import assert from 'node:assert/strict';
import {createFaceProfileVolume,faceDepthProfile,PROFILE_SIDE_REFERENCE} from './profile-volume.js';

// A standalone silhouette fixture verifies depth functions and seams without
// mutating or importing the installed face/hair/character factories.
const widthAt=y=>.59*Math.sqrt(Math.max(0,1-Math.pow((y-.129)/.511,2)));
const centerAt=y=>.023*Math.max(0,Math.min(1,-y/.382));
const volume=createFaceProfileVolume({halfWidthAt:widthAt,centerAt});
let maxSeamError=0,minThickness=Infinity;
for(let row=0;row<=1024;row++) {
  const y=-.382+1.022*row/1024,w=widthAt(y),c=centerAt(y),seam=volume.boundaryZ(y);
  for(const sign of[-1,1]) {
    const x=c+sign*w;
    maxSeamError=Math.max(maxSeamError,Math.abs(volume.frontZ(x,y)-seam),Math.abs(volume.backZ(x,y)-seam));
  }
  for(let i=0;i<=64;i++) {
    const x=c+w*(i/32-1),front=volume.frontZ(x,y),back=volume.backZ(x,y);
    assert(Number.isFinite(front)&&Number.isFinite(back));
    minThickness=Math.min(minThickness,front-back);
    assert(front>=back-1e-8,'closed face has nonnegative front/back thickness');
  }
}
assert(maxSeamError<1e-7,`shared front/back boundary: ${maxSeamError}`);
assert.equal(volume.boundaryZ(-.382),.324,'chin no longer returns to the skull center plane');
assert.equal(volume.boundaryZ(.64),.015);
assert(Math.abs(faceDepthProfile(-.076)-.515)<1e-12);
assert(Math.abs(faceDepthProfile(-.204)-.484)<1e-12);
for(const y of[-.38,-.331,-.267,-.204,-.14,-.076,.083,.242,.36,.5,.6]) {
  const d0=(faceDepthProfile(y)-faceDepthProfile(y-1e-6))/1e-6,d1=(faceDepthProfile(y+1e-6)-faceDepthProfile(y))/1e-6;
  assert(Math.abs(d0-d1)<.002,'profile is C1, including nasal extrema');
}
for(const strength of[0,.5,1]) {
  const variant=createFaceProfileVolume({halfWidthAt:widthAt,centerAt,strength,noseProjection:.02,lipProjection:-.01,chinProjection:.025});
  assert(Number.isFinite(variant.frontZ(.04,-.08)));
  assert(Math.abs(variant.frontZ(centerAt(-.382),-.382)-variant.backZ(centerAt(-.382),-.382))<1e-8,'closing cap remains closed while tuning');
}
assert.equal(volume.metadata.installed,false);assert.equal(volume.metadata.validatedAt90Degrees,false);
console.log(JSON.stringify({passed:true,sourceSize:PROFILE_SIDE_REFERENCE.size,maxSeamError,minThickness,
  chinZ:volume.boundaryZ(-.382),noseTipZ:faceDepthProfile(-.076),lipZ:faceDepthProfile(-.204),
  installed:false,rendered90DegreeQA:false,scope:'Z-only optional face shell; keeps existing X/Y and UV untouched'},null,2));
