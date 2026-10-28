extends SceneTree

var bodies:Array=[]
var tick=0
var initial:PackedVector3Array
const DT=1.0/240.0
const IMPULSE=Vector3(.0001,0,0)

func _initialize()->void:call_deferred("run")

func run()->void:
	for active in [false,true]:
		var arrays=[];arrays.resize(Mesh.ARRAY_MAX);arrays[Mesh.ARRAY_VERTEX]=PackedVector3Array([Vector3(0,1,0),Vector3(.1,1,0),Vector3(.1,1,.1),Vector3(0,1,.1)]);arrays[Mesh.ARRAY_INDEX]=PackedInt32Array([0,1,2,0,2,3]);var mesh=ArrayMesh.new();mesh.add_surface_from_arrays(Mesh.PRIMITIVE_TRIANGLES,arrays)
		var body=SoftBody3D.new();body.mesh=mesh;body.total_mass=.008;body.linear_stiffness=0;body.damping_coefficient=0;body.simulation_precision=8;body.collision_layer=0;body.collision_mask=0;body.visible=false;root.add_child(body);bodies.append(body)
	physics_frame.connect(step)

func step()->void:
	if tick==0:
		initial=PackedVector3Array([bodies[0].get_point_transform(2),bodies[1].get_point_transform(2)])
		bodies[1].apply_impulse(2,IMPULSE)
	elif tick==1:
		var actual:Vector3=(bodies[1].get_point_transform(2)-initial[1])-(bodies[0].get_point_transform(2)-initial[0]);var expected=DT*(4.0/.008)*IMPULSE;var err=actual.distance_to(expected)
		var unaffected=(bodies[1].get_point_transform(3)-bodies[0].get_point_transform(3)).length()
		var pass_check=err<1e-7 and unaffected<1e-7
		load("res://probe_data.gd").write_report("res://../reports/impulse-calibration.json",{"completed":true,"pass":pass_check,"backend":"Godot 4.7.2 Jolt","canonical_first_encounter_mapping":true,"mass_per_point_kg":.008/4,"inverse_mass_per_kg":4.0/.008,"dt_s":DT,"J_ns":[IMPULSE.x,IMPULSE.y,IMPULSE.z],"expected_relative_displacement_m":[expected.x,expected.y,expected.z],"measured_relative_displacement_m":[actual.x,actual.y,actual.z],"error_m":err,"unaffected_vertex_difference_m":unaffected,"gravity":"Equal control removes common gravity; damping/membrane/contact disabled","free_positions_written":false})
		print("IMPULSE_CALIBRATION ",pass_check," error=",err);physics_frame.disconnect(step)
		for body in bodies:body.queue_free()
		quit(0 if pass_check else 1)
	tick+=1
