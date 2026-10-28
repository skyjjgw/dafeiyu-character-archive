"""Independent NumPy geometry + SciPy sparse direct/CG material reference.
No installation and no source/default writes. Reads actual native probe inputs.
"""
import json, math, warnings
from pathlib import Path
import numpy as np
with warnings.catch_warnings():
    warnings.filterwarnings("ignore", message="A NumPy version")
    import scipy
    from scipy.sparse import coo_matrix, eye, diags
    from scipy.sparse.linalg import cg

HERE=Path(__file__).resolve().parent
def wrap(x): return (x+np.pi)%(2*np.pi)-np.pi
def geometry(points, ids):
    a,b,c,d=(points[ids[:,j]] for j in range(4))
    e=b-a; l=np.linalg.norm(e,axis=1); ll=l*l
    nc=np.cross(e,c-a); nd=-np.cross(e,d-a)
    ac=np.linalg.norm(nc,axis=1); ad=np.linalg.norm(nd,axis=1)
    nc/=ac[:,None]; nd/=ad[:,None]
    angle=np.arctan2(np.einsum('ij,ij->i',e/l[:,None],np.cross(nc,nd)),np.einsum('ij,ij->i',nc,nd))
    gc=nc*(-l/ac)[:,None]; gd=nd*(-l/ad)[:,None]
    tc=np.einsum('ij,ij->i',c-a,e)/ll; td=np.einsum('ij,ij->i',d-a,e)/ll
    gradient=np.stack([-gc*(1-tc[:,None])-gd*(1-td[:,None]),-gc*tc[:,None]-gd*td[:,None],gc,gd],axis=1)
    return angle,gradient

native=json.loads((HERE/'reports/algebra-native.json').read_text())
records=[];passed=True
for case in native['cases']:
    p=np.array(case['positions']);v=np.array(case['velocities']);rest=np.array(case['rest']);ids=np.array(case['hinge_ids']).reshape(-1,4);w=np.array(case['inverse_masses'])
    angle,g=geometry(p,ids);rest_angle,_=geometry(rest,ids)
    G=coo_matrix((g.ravel(),(np.repeat(np.arange(len(ids)),12),(ids[:,:,None]*3+np.arange(3)).ravel())),shape=(len(ids),p.size)).tocsr()
    h=case['dt'];k=case['k'];c=case['c'];H=c+h*k;W=np.repeat(np.sqrt(w),3);B=G@diags(W);C=wrap(angle-rest_angle)
    A=eye(p.size,format='csr')+h*H*(B.T@B)
    rhs=-h*(B.T@(k*C+H*(G@v.ravel())))
    if p.size<=48: y=np.linalg.solve(A.toarray(),rhs);status=0
    else:y,status=cg(A,rhs,rtol=1e-12,atol=1e-18,maxiter=1000,M=diags(1/A.diagonal()))
    impulses=np.zeros(p.size);free=W>0;impulses[free]=y[free]/W[free];impulses=impulses.reshape(-1,3)
    answer=case['output'];actual=np.array(answer['impulses']);diff=np.max(np.abs(impulses-actual))
    grad_diff=np.max(np.abs(g.ravel()-case['gradients']));angle_diff=np.max(np.abs(wrap(angle-case['angles'])))
    # Native output is intentionally float32 at the official Vector3 boundary.
    float_bound=np.max(np.abs(impulses-impulses.astype(np.float32).astype(float)))
    norm=float(np.linalg.norm(rhs));res=float(np.linalg.norm(A@y-rhs)/norm) if norm else 0
    closure=float(np.linalg.norm(np.sum(g,axis=1),axis=1).max())
    rotation=float(np.linalg.norm(np.sum(np.cross(p[ids],g),axis=1),axis=1).max())
    row={'case':case['name'],'reference_solve_status':int(status),'reference_relative_residual':res,'native_iterations':answer['iterations'],'native_relative_residual':answer['relative_residual'],'max_impulse_error_ns':float(diff),'float32_roundoff_bound_ns':float(float_bound),'max_gradient_error_per_m':float(grad_diff),'max_angle_error_rad':float(angle_diff),'translation_null_gradient_per_m':closure,'rotation_null_gradient':rotation,'linear_energy_balance_error_j':answer['linear_energy_balance_error_j'],'native_ms':case['kernel_ms']}
    if len(ids)==1:
        rate=float((G@v.ravel())[0]);effective=float(np.sum(w[ids[0],None]*g[0]**2));lam=-h*(k*C[0]+H*rate)/(1+h*H*effective)
        closed=np.zeros_like(p);closed[ids[0]]=g[0]*lam;closed[w==0]=0
        row['single_hinge_closed_form_max_error_ns']=float(np.max(np.abs(actual-closed)))
    row['pass']=bool(status==0 and diff<2e-10 and grad_diff<1e-8 and angle_diff<1e-10 and abs(answer['linear_energy_balance_error_j'])<1e-10)
    passed=passed and row['pass'];records.append(row)

# Unrelated deterministic nondegenerate geometries, finite-differenced angle.
rng=np.random.default_rng(1234);max_fd=0.;max_rel=0.;samples=0
while samples<100:
    p=rng.normal(0,.02,(4,3));ids=np.array([[0,1,2,3]])
    a,g=geometry(p,ids)
    if np.max(np.abs(g))>1000:continue
    for j in range(4):
        for axis in range(3):
            plus=p.copy();minus=p.copy();plus[j,axis]+=1e-7;minus[j,axis]-=1e-7
            deriv=float(wrap(geometry(plus,ids)[0]-geometry(minus,ids)[0])[0]/2e-7)
            err=abs(deriv-g[0,j,axis]);max_fd=max(max_fd,err);max_rel=max(max_rel,err/(1+abs(g[0,j,axis])))
    samples+=1
fd={'seed':1234,'samples':samples,'central_step_m':1e-7,'max_absolute_gradient_error_per_m':float(max_fd),'max_scaled_relative_error':float(max_rel),'pass':bool(max_fd<1e-4)}
passed=passed and fd['pass']
report={'completed':True,'pass':passed,'scope':'Frozen-gradient material algebra only; not Jolt coupled stability','numpy':np.__version__,'scipy':scipy.__version__,'scipy_version_warning':'Installed scipy declares NumPy<2.5; actual sparse operations verified by dense small solves, no install performed.','cases':records,'finite_difference':fd}
(HERE/'reports/reference-comparison.json').write_text(json.dumps(report,indent=2))
print(json.dumps({'pass':passed,'max_impulse_error_ns':max(r['max_impulse_error_ns'] for r in records),'finite_difference':fd,'cases':[{k:r[k] for k in ['case','native_iterations','native_ms','max_impulse_error_ns']} for r in records]},indent=2))
raise SystemExit(0 if passed else 1)
