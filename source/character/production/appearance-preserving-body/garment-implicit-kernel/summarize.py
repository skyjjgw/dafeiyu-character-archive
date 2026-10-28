import hashlib,json
from pathlib import Path
import numpy as np
HERE=Path(__file__).resolve().parent
def read(name):return json.loads((HERE/'reports'/name).read_text())
def file_info(path):
    p=HERE/path;data=p.read_bytes();return {'path':str(path).replace('\\','/'),'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
names=['jolt-240hz-4s.json','jolt-240hz-1s-k10.json','jolt-120hz-1s.json','jolt-480hz-1s.json','official-jolt-grid-240hz-4s.json']
experiments=[]
for name in names:
    report=read(name);trials=[]
    for t in report['trials']:
        trials.append({k:t[k] for k in ['name','fixture','min_edge_ratio','max_edge_ratio','max_pin_error_m','max_displacement_m','max_iterations','max_relative_residual','max_linear_balance_error_j','max_impulse_ns','max_delta_velocity_mps','material_time_ms','bounded_diagnostic_pass']})
    experiments.append({'report':name,'completed':report['completed'],'dt_s':report['dt_s'],'simulated_seconds':report['simulated_seconds'],'wall_seconds':report['wall_seconds'],'material_total_mean_ms':sum(t['material_time_ms']['mean'] for t in report['trials'] if t['material'] and t['fixture']['vertices']>1000),'trials':trials})
positions={}
for hz in [120,240,480]:
    report=read(f'jolt-{hz}hz-1s.json')
    positions[hz]={t['name']:np.array(t['samples'][-1]['positions']) for t in report['trials'] if t['name'] in ['outer_implicit','lining_implicit']}
convergence=[]
for a,b in [(120,240),(240,480)]:
    for layer in positions[a]:
        d=np.linalg.norm(positions[a][layer]-positions[b][layer],axis=1)
        convergence.append({'rates_hz':[a,b],'layer':layer,'final_time_s':1,'rms_position_difference_m':float(np.sqrt(np.mean(d*d))),'max_position_difference_m':float(d.max()),'timestep_convergence_accepted':False})
summary={'schema':'dafeiyu.implicit-cloth-research-summary.v1','status':'frozen_bounded_research_not_production','math_reference_pass':read('reference-comparison.json')['pass'],'impulse_calibration_pass':read('impulse-calibration.json')['pass'],'boundary_regression_pass':read('boundary-regression.json')['pass'],'experiments':experiments,'rate_comparison':convergence,'scope_limits':['Supplied whole-tick average velocity is not actual Jolt last-substep velocity','Frozen-gradient SPD model, not full nonlinear/contact energy proof','Uniform per-hinge k is not calibrated continuum fabric','240Hz full mesh material already exceeds total 4.17ms physics-tick budget','120Hz bounded strain diagnostic fails','Outer support/appearance not accepted','No self/interlayer or body-contact test in this kernel project'],'physical_acceptance':False,'visual_acceptance':False,'realtime_acceptance':False,'installed_default':False,'free_position_writes':False,'impulse_caps':False,'head_frozen_unchanged':True}
(HERE/'reports/summary.json').write_text(json.dumps(summary,indent=2))
files=['src/implicit_cloth.hpp','src/implicit_cloth.cpp','src/register_types.cpp','CMakeLists.txt','build.cmd','project/bin/selected_implicit_cloth.windows.release.x86_64.dll','project/selected_implicit_cloth.gdextension','component/selected_implicit_cloth.gdextension','component/bin/selected_implicit_cloth.windows.release.x86_64.dll','project/official-jolt-fixture.json','fixture_generator.cpp','LICENSE-JOLT','LICENSE-GODOT-CPP.md','README.md','HANDOFF.md','reports/reference-comparison.json','reports/stability-audit.json','reports/impulse-calibration.json','reports/boundary-regression.json','reports/component-load.json','reports/summary.json']+['reports/'+n for n in names]
delivery={'schema':'dafeiyu.implicit-cloth-research-delivery.v1','version':'0.1.0','status':'frozen_research_only','class_name':'SelectedImplicitClothBending','entry_symbol':'selected_implicit_cloth_library_init','files':[file_info(p) for p in files],'source_garment_json_sha256':'c01bed3bd202422e8ef28bb8b2e665e2f8c852ea3aa38f05bce38f42cf39319f','source_garment_bin_sha256':'c9a08f0e12196337ffac10783036f2d5473eb53d379abf76a9b09044f88cf5a3','head_dll_expected_sha256':'d25ce205577bd9f568808fdb8dc29c406ee1d5cc5375959c718e11f8459728f6','native_default_or_current_modified':False,'component_path':'component/selected_implicit_cloth.gdextension','physical_acceptance':False,'visual_acceptance':False,'realtime_acceptance':False}
(HERE/'reports/delivery.json').write_text(json.dumps(delivery,indent=2))
print(json.dumps({'dll':next(x for x in delivery['files'] if x['path'].endswith('.dll')),'material240_ms':experiments[0]['material_total_mean_ms'],'rate_comparison':convergence},indent=2))
