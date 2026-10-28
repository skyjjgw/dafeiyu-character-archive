extends RigidBody3D

var floor_contacts:=0

func _ready() -> void:
	name="DynamicCeramicCup"
	mass=.22
	continuous_cd=true
	collision_layer=2
	collision_mask=1|4|8
	contact_monitor=true
	max_contacts_reported=12
	var physical:=PhysicsMaterial.new()
	physical.friction=.75
	physical.bounce=.03
	physics_material_override=physical
	var mesh:=ArrayMesh.new()
	var tool:=SurfaceTool.new()
	tool.begin(Mesh.PRIMITIVE_TRIANGLES)
	var segments:=48
	for i in segments:
		var a: float=TAU*i/segments
		var b: float=TAU*(i+1)/segments
		var oa:=Vector3(cos(a)*.092,.012,sin(a)*.092)
		var ob:=Vector3(cos(b)*.092,.012,sin(b)*.092)
		var ta:=Vector3(oa.x,.20,oa.z)
		var tb:=Vector3(ob.x,.20,ob.z)
		var ia:=Vector3(cos(a)*.080,.018,sin(a)*.080)
		var ib:=Vector3(cos(b)*.080,.018,sin(b)*.080)
		var ita:=Vector3(ia.x,.20,ia.z)
		var itb:=Vector3(ib.x,.20,ib.z)
		for triangle in [[oa,ta,ob],[ob,ta,tb],[ia,ib,ita],[ib,itb,ita],[ta,ita,tb],[tb,ita,itb],[Vector3(0,.012,0),ob,oa],[Vector3(0,.018,0),ia,ib]]:
			for point in triangle: tool.add_vertex(point)
	tool.generate_normals()
	tool.commit(mesh)
	var visual:=MeshInstance3D.new()
	visual.mesh=mesh
	var material:=StandardMaterial3D.new()
	material.albedo_color=Color(.77,.82,.84)
	material.roughness=.45
	visual.material_override=material
	add_child(visual)
	var handle:=MeshInstance3D.new()
	var torus:=TorusMesh.new()
	torus.inner_radius=.032
	torus.outer_radius=.052
	torus.rings=24
	torus.ring_segments=12
	handle.mesh=torus
	handle.material_override=material
	handle.position=Vector3(-.108,.112,0)
	handle.rotation.x=PI/2
	add_child(handle)
	for i in 12:
		var angle: float=TAU*i/12
		var shape:=BoxShape3D.new()
		shape.size=Vector3(.052,.184,.013)
		add_shape(shape,Vector3(cos(angle)*.086,.108,sin(angle)*.086),-angle-PI/2)
	var base:=CylinderShape3D.new()
	base.radius=.091
	base.height=.012
	add_shape(base,Vector3(0,.006,0))
	for offset in [Vector3(-.144,.112,0),Vector3(-.111,.153,0),Vector3(-.111,.071,0)]:
		var shape:=BoxShape3D.new()
		shape.size=Vector3(.025,.045,.025) if offset.x<-.13 else Vector3(.07,.022,.025)
		add_shape(shape,offset)
	body_entered.connect(func(body):
		if body is StaticBody3D: floor_contacts+=1)

func add_shape(shape: Shape3D,point: Vector3,yaw: float=0.0) -> void:
	var node:=CollisionShape3D.new()
	node.shape=shape
	node.position=point
	node.rotation.y=yaw
	add_child(node)

func grip_world() -> Vector3:
	return to_global(Vector3(-.14,.112,0))

func snapshot() -> Dictionary:
	return {"mass":mass,"position":[global_position.x,global_position.y,global_position.z],"velocity":[linear_velocity.x,linear_velocity.y,linear_velocity.z],"static_contacts":floor_contacts,"hollow_compound_collision":true}
