"""Independent NumPy force check on exact float32 actual Godot inputs."""
from pathlib import Path
import hashlib,json
import numpy as np
ROOT=Path(__file__).resolve().parent
component=json.loads((ROOT/'assets/component.json').read_text(encoding='utf-8'))
binary=(ROOT/'assets/component.bin').read_bytes()
assert hashlib.sha256(binary).hexdigest()==component['binary']['sha256']
native=json.loads((ROOT/'reports/native-material-interface.json').read_text(encoding='utf-8'))
def packed(key):
 row=component['arrays'][key]
 return np.frombuffer(binary,dtype={'float32':'<f4','uint32':'<u4','uint16':'<u2'}[row['type']],count=row['count']*row['itemSize'],offset=row['offset'])
def geometry(p):
 a,b,c,d=p;e=b-a;length=np.linalg.norm(e);nc=np.cross(e,c-a);nd=-np.cross(e,d-a);ac=np.linalg.norm(nc);ad=np.linalg.norm(nd)
 if min(length,ac,ad)<1e-7:raise ValueError('degenerate actual garment hinge')
 nc/=ac;nd/=ad;angle=np.arctan2(np.dot(e/length,np.cross(nc,nd)),np.dot(nc,nd));gc=-length/ac*nc;gd=-length/ad*nd;tc=np.dot(c-a,e)/length**2;td=np.dot(d-a,e)/length**2
 return angle,np.stack([-(1-tc)*gc-(1-td)*gd,-tc*gc-td*gd,gc,gd])
def hinges(triangles):
 edges={}
 for tri in triangles:
  for i in range(3):
   a,b=sorted((int(tri[i]),int(tri[(i+1)%3])));edges.setdefault((a,b),[]).append(int(tri[(i+2)%3]))
 assert all(len(v)<=2 for v in edges.values())
 return [(a,b,v[0],v[1]) for (a,b),v in sorted(edges.items()) if len(v)==2]
records=[]
for layer in component['layers']:
 row=next(v for v in native['layers'] if v['layer']==layer['id'])
 rest=np.fromfile(ROOT/'reports'/row['probe_files']['rest'],dtype='<f4').reshape(-1,3).astype(np.float64)
 current=np.fromfile(ROOT/'reports'/row['probe_files']['rigid'],dtype='<f4').reshape(-1,3).astype(np.float64)
 actual=np.fromfile(ROOT/'reports'/row['probe_files']['rigid_forces'],dtype='<f4').reshape(-1,3).astype(np.float64)
 ids=hinges(packed(layer['solver']['triangles']).reshape(-1,3));expected=np.zeros_like(rest)
 for quad in ids:
  neutral=geometry(rest[list(quad)]);angle,gradient=geometry(current[list(quad)]);difference=(angle-neutral[0]+np.pi)%(2*np.pi)-np.pi
  force=-np.clip(.0006*difference,-.0015,.0015)*gradient
  for i,point in enumerate(quad):expected[point]+=force[i]
 error=float(np.max(np.abs(expected-actual)));maximum=float(np.linalg.norm(expected,axis=1).max())
 records.append({'layer':layer['id'],'hinges':len(ids),'maximumForceComponentDifferenceN':error,'expectedQuantizedRigidMaximumNodalForceN':maximum,'actualMaximumNodalForceN':row['rigid_max_nodal_force_N'],'passed':error<1e-9,'meaning':'Exact float32 transformed input changes angles slightly; nonzero residual is explained by that actual geometry, not an assumed exact rigid pose.'})
report={'schema':'dafeiyu.garment-independent-actual-material-reference.v1','binarySha256':component['binary']['sha256'],'layers':records,'passed':all(v['passed'] for v in records),'physicsPass':False,'visualPass':False,'scope':'Double NumPy analytical dihedral force evaluated independently on actual Godot float32 rest/current arrays. No simulation or animation frames.'}
(ROOT/'reports/native-material-reference.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
print(json.dumps(report,indent=2));assert report['passed']
