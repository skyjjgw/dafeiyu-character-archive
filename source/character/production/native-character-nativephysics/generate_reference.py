"""Independent NumPy + finite-difference reference; never writes source assets."""
from pathlib import Path
import json,hashlib
import numpy as np
ROOT=Path(__file__).resolve().parent
def geometry(p):
 a,b,c,d=p;e=b-a;length=np.linalg.norm(e);nc=np.cross(e,c-a);nd=-np.cross(e,d-a);ac=np.linalg.norm(nc);ad=np.linalg.norm(nd)
 if min(length,ac,ad)<1e-7:return None
 nc/=ac;nd/=ad;angle=np.arctan2(np.dot(e/length,np.cross(nc,nd)),np.dot(nc,nd));gc=-length/ac*nc;gd=-length/ad*nd;tc=np.dot(c-a,e)/length**2;td=np.dot(d-a,e)/length**2
 return angle,np.stack([-(1-tc)*gc-(1-td)*gd,-tc*gc-td*gd,gc,gd])
def wrap(a):return (a+np.pi)%(2*np.pi)-np.pi
def f32(p):return np.array(p,dtype=np.float32).astype(np.float64)
def evaluate(rest,poses,ids,previous=None,k=.0006,c=.000025,limit=.0015,dt=1/60):
 forces=np.zeros_like(poses);energy=maximum=0.
 for indices in ids:
  old=geometry(rest[list(indices)]);current=geometry(poses[list(indices)])
  if old is None or current is None:continue
  angle=wrap(current[0]-old[0]);g=current[1];rate=0. if previous is None else np.sum(g*(poses[list(indices)]-previous[list(indices)])/dt);moment=np.clip(k*angle+c*rate,-limit,limit);f=-moment*g
  for i,index in enumerate(indices):forces[index]+=f[i]
  energy+=.5*k*angle*angle;maximum=max(maximum,float(np.max(np.linalg.norm(f,axis=1))))
 return {'forces':forces.tolist(),'energy':float(energy),'max_force':maximum,'max_nodal_force':float(np.max(np.linalg.norm(forces,axis=1)))}
def hinges(triangles):
 edges={}
 for triangle in triangles:
  for j in range(3):
   a,b=sorted([int(triangle[j]),int(triangle[(j+1)%3])]);edges.setdefault((a,b),[]).append(int(triangle[(j+2)%3]))
 assert all(len(v)<=2 for v in edges.values())
 return [(a,b,v[0],v[1])for(a,b),v in sorted(edges.items())if len(v)==2],sum(len(v)==1 for v in edges.values())
rng=np.random.default_rng(2747);cases=[];max_fd=max_net=max_torque=0.
for _ in range(300):
 rest=f32((np.array([[0.,0.,0.],[1.,0.,0.],[.4,1.,.1],[.3,-1.,-.2]])+rng.normal(0,.07,(4,3)))*.04)
 pose=f32(rest+rng.normal(0,.003,(4,3)));next_pose=f32(pose+rng.normal(0,.0004,(4,3)))
 first=evaluate(rest,pose,[(0,1,2,3)]);second=evaluate(rest,next_pose,[(0,1,2,3)],previous=pose)
 angle,g=geometry(pose);rest_angle=geometry(rest)[0];delta=wrap(angle-rest_angle)
 numerical=np.zeros((4,3));eps=1e-7
 for i in range(4):
  for j in range(3):
   a=pose.copy();b=pose.copy();a[i,j]+=eps;b[i,j]-=eps
   ea=.5*.0006*wrap(geometry(a)[0]-rest_angle)**2;eb=.5*.0006*wrap(geometry(b)[0]-rest_angle)**2;numerical[i,j]=-(ea-eb)/(2*eps)
 analytic=-.0006*delta*g
 max_fd=max(max_fd,float(np.max(np.abs(numerical-analytic))));max_net=max(max_net,float(np.linalg.norm(analytic.sum(axis=0))));max_torque=max(max_torque,float(np.linalg.norm(np.cross(pose,analytic).sum(axis=0))))
 cases.append({'rest':rest.tolist(),'pose':pose.tolist(),'next_pose':next_pose.tolist(),'first':first,'second':second})
path=ROOT/'project/fixtures/skirt-cage-schema2.json';source=json.loads(path.read_text(encoding='utf-8-sig'));rest=f32(source['vertices']);ids,boundary=hinges(source['triangles']);phase=np.arctan2(rest[:,2],rest[:,0]);t=(rest[:,1].max()-rest[:,1])/(rest[:,1].max()-rest[:,1].min())
poses=[]
for time in np.arange(20)/60:
 p=rest.copy();p[:,1]+=.012*np.sin(3*phase+time*5)*t;p[:,0]+=.007*np.cos(5*phase+time*3)*t*t;poses.append(f32(p))
fixture={'single_hinges':cases,'reference_gradient':{'cases':300,'finite_difference_energy_force_max_error':max_fd,'max_net_force_double':max_net,'max_net_torque_double':max_torque},'schema2':{'fixture_sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'schema':source['schema'],'vertices':len(rest),'triangles':len(source['triangles']),'actual_shared_edges':len(ids),'boundary_edges':boundary,'poses':[p.tolist()for p in poses],'first':evaluate(rest,poses[0],ids),'second':evaluate(rest,poses[1],ids,poses[0])}}
assert max_fd<1e-7 and max_net<1e-12 and max_torque<1e-12
out=ROOT/'project/fixtures/reference.json';out.write_text(json.dumps(fixture,separators=(',',':'))+'\n',encoding='utf-8')
print(json.dumps({'reference':fixture['reference_gradient'],'schema2':{k:v for k,v in fixture['schema2'].items()if k not in ['poses','first','second']},'bytes':out.stat().st_size}))
