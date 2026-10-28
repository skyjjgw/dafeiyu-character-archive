from pathlib import Path
import json, hashlib, math
ROOT=Path(__file__).resolve().parent
BASE=ROOT.parent.parent
OUT=ROOT/'reports'
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def quant(a,q): return sorted(a)[int(q*(len(a)-1))]
def metrics(a): return {"mean":sum(a)/len(a),"p95":quant(a,.95),"max":max(a),"count":len(a)}
summary={"scope":"CPU only bounded no-contact compute/numerical diagnostic; not full cloth acceptance", "physical_material_equivalence":False,"default_promotion":False,"render_fps_measured":False,"full_frame_realtime_established":False,"free_positions_written":False,"impulses_capped":False,"gpu_enabled":False,"mass_calibration":{},"runs":[]}
cal=json.loads((OUT/'lod-mass-calibration.json').read_text());summary['mass_calibration']={"pass":cal['pass'],"trials":[{k:v for k,v in t.items() if k!='per_point'} for t in cal['trials']]}
for seconds in [1,4]:
 r=json.loads((OUT/f'lod-jolt-240hz-{seconds}s.json').read_text())
 assert r['completed'] and len(r['trials'])==4
 row={k:r[k] for k in ['dt_s','wall_seconds','simulated_seconds']};row['wall_per_simulated_second']=r['wall_seconds']/r['simulated_seconds'];row['trials']=[]
 for t in r['trials']:
  assert len(t['per_tick'])==seconds*240+1 and t['sample_count']==seconds*240+1
  assert t['bounded_diagnostic_pass']
  out={k:t[k] for k in ['name','fixture','bounded_diagnostic_pass','min_edge_ratio','max_edge_ratio','max_pin_error_m','max_displacement_m','max_iterations','max_relative_residual','material_time_ms','max_impulse_ns','max_delta_velocity_mps']}
  out['absolute_edge_minmax_m']=[min(x['edge_length_m'][0] for x in t['per_tick']),max(x['edge_length_m'][1] for x in t['per_tick'])];row['trials'].append(out)
 mats=[t for t in r['trials'] if t['material']]
 pairs=[sum(t['per_tick'][i]['material']['kernel_ms'] for t in mats) for i in range(seconds*240)]
 row['combined_material_ms']=metrics(pairs);row['combined_material_under_240hz_4_1667ms_budget_all_samples']=max(pairs)<1000/240
 summary['runs'].append(row)
old=json.loads((BASE/'garment-implicit-kernel/reports/jolt-240hz-4s.json').read_text())
oldmean=sum(t['material_time_ms']['mean'] for t in old['trials'] if t['name'] in ['outer_implicit','lining_implicit'])
summary['old_3104_reference']={"file":"../../garment-implicit-kernel/reports/jolt-240hz-4s.json","combined_material_mean_ms":oldmean,"reference_includes_extra_grid_and_different_point_masses":True,"same_uniform_hinge_k_c_and_total_layer_mass_but_not_calibrated_physical_equivalence":True,"new_4s_mean_ms":summary['runs'][-1]['combined_material_ms']['mean'],"observed_material_mean_ratio_old_over_new":oldmean/summary['runs'][-1]['combined_material_ms']['mean']}
summary['artifact_identity']={}
for label,p in {'source_frozen_dll':BASE/'garment-implicit-kernel/component/bin/selected_implicit_cloth.windows.release.x86_64.dll','copied_dll':ROOT/'project/bin/selected_implicit_cloth.windows.release.x86_64.dll','low_lod_json':ROOT.parent/'assets/component.json','low_lod_bin':ROOT.parent/'assets/component.bin','godot_exe':ROOT.parents[3]/'tools/godot/4.7.2-stable/Godot_v4.7.2-stable_win64.exe'}.items():
 summary['artifact_identity'][label]={"path":str(p),"sha256":sha(p)}
assert summary['artifact_identity']['source_frozen_dll']['sha256']==summary['artifact_identity']['copied_dll']['sha256']
(OUT/'summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps({"mass_calibration_pass":cal['pass'],"runs":[{k:v for k,v in r.items() if k!='trials'} for r in summary['runs']],"observed_material_mean_ratio_old_over_new":summary['old_3104_reference']['observed_material_mean_ratio_old_over_new']},indent=2))
