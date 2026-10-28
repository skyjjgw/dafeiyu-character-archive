import json
from pathlib import Path
import numpy as np

HERE=Path(__file__).resolve().parent
native=json.loads((HERE/'reports/algebra-native.json').read_text())
def geometry(p,ids):
    a,b,c,d=(p[ids[:,j]] for j in range(4));e=b-a;l=np.linalg.norm(e,axis=1);nc=np.cross(e,c-a);nd=-np.cross(e,d-a)
    ac=np.linalg.norm(nc,axis=1);ad=np.linalg.norm(nd,axis=1);nc/=ac[:,None];nd/=ad[:,None]
    gc=nc*(-l/ac)[:,None];gd=nd*(-l/ad)[:,None];tc=np.sum((c-a)*e,axis=1)/l**2;td=np.sum((d-a)*e,axis=1)/l**2
    return np.stack([-gc*(1-tc[:,None])-gd*(1-td[:,None]),-gc*tc[:,None]-gd*td[:,None],gc,gd],axis=1)

records=[]
for case in native['cases']:
    if case['name'] not in ['outer','lining']:continue
    p=np.array(case['rest']);ids=np.array(case['hinge_ids']).reshape(-1,4);w=np.array(case['inverse_masses']);g=geometry(p,ids);b=g*np.sqrt(w[ids,None])
    def product(u):
        q=np.einsum('hja,hja->h',b,u[ids]);out=np.zeros_like(u);np.add.at(out,ids,(b*q[:,None,None]));return out
    rng=np.random.default_rng(1234);u=rng.normal(size=p.shape);u[w==0]=0;u/=np.linalg.norm(u)
    for _ in range(250):v=product(u);u=v/np.linalg.norm(v)
    v=product(u);eigen=float(np.sum(u*v));residual=float(np.linalg.norm(v-eigen*u)/eigen)
    h=case['dt'];k=case['k'];c=case['c'];indicator=h*h*k*eigen+2*h*c*eigen
    records.append({'layer':case['name'],'vertices':len(p),'hinges':len(ids),'free_point_mass_kg':float(1/w[w>0][0]),'uniform_mass_includes_pins_before_zeroing':True,'power_iteration_seed':1234,'power_iteration_steps':250,'rayleigh_eigenvalue_lower_bound_per_kg_m2':eigen,'relative_eigen_residual':residual,'semiimplicit_spring_plus_explicit_damping_necessary_condition':'h^2 k lambda + 2 h c lambda < 4','actual_indicator_lower_bound':indicator,'necessary_limit':4,'fails_even_from_lower_bound':bool(indicator>4),'h_omega':float(h*np.sqrt(k*eigen)),'h_c_lambda':float(h*c*eigen)})
out={'completed':True,'units':'World metres, kg, seconds; signed angle rad dimensionless','gradient_formula':'Verified finite difference in reference-comparison.json; old and new formula same first derivative','old_moment_cap':'0.0003 N*m per hinge; nodal force=moment*gradient (N), then hinges accumulate. This is not a nodal force cap.','old_energy_mismatch':'Old reported quadratic energy was uncapped while elastic+damping moment was capped; not an exact energy certificate.','records':records}
(HERE/'reports/stability-audit.json').write_text(json.dumps(out,indent=2));print(json.dumps(out,indent=2))
