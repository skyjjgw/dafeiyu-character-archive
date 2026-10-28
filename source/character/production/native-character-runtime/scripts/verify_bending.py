"""Numerical check of the objective signed-dihedral force gradient used by Jolt cloth."""
import json
from pathlib import Path
import numpy as np

def hinge(p):
    a,b,c,d=p
    e=b-a
    length=np.linalg.norm(e)
    cross_c=np.cross(e,c-a)
    cross_d=-np.cross(e,d-a)
    nc=cross_c/np.linalg.norm(cross_c)
    nd=cross_d/np.linalg.norm(cross_d)
    angle=np.arctan2(np.dot(e/length,np.cross(nc,nd)),np.dot(nc,nd))
    gc=-length/np.linalg.norm(cross_c)*nc
    gd=-length/np.linalg.norm(cross_d)*nd
    tc=np.dot(c-a,e)/length**2
    td=np.dot(d-a,e)/length**2
    ga=-(1-tc)*gc-(1-td)*gd
    gb=-tc*gc-td*gd
    return angle,np.stack([ga,gb,gc,gd])

rng=np.random.default_rng(2747)
max_error=max_force=max_torque=0.0
for _ in range(300):
    p=np.array([[0.,0.,0.],[1.,0.,0.],[.4,1.,.1],[.3,-1.,-.2]])+rng.normal(0,.07,(4,3))
    theta,g=hinge(p)
    numerical=np.zeros((4,3))
    for i in range(4):
        for j in range(3):
            q=p.copy();q[i,j]+=1e-6
            r=p.copy();r[i,j]-=1e-6
            numerical[i,j]=(hinge(q)[0]-hinge(r)[0])/2e-6
    max_error=max(max_error,float(np.max(np.abs(g-numerical))))
    max_force=max(max_force,float(np.linalg.norm(g.sum(axis=0))))
    max_torque=max(max_torque,float(np.linalg.norm(np.cross(p,g).sum(axis=0))))
report={"cases":300,"max_gradient_error":max_error,"max_net_force":max_force,"max_net_torque":max_torque,"passed":max_error<1e-6 and max_force<1e-10 and max_torque<1e-10}
Path(__file__).resolve().parents[1].joinpath('reports/bending-gradient.json').write_text(json.dumps(report,indent=2))
print(json.dumps(report))
raise SystemExit(0 if report['passed'] else 1)
