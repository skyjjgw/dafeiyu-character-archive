shader_type spatial;
render_mode unshaded, cull_back;
uniform vec4 base_linear = vec4(.58,.49,.40,1);
uniform bool is_skin = true;
uniform float vertex_color_weight = 0.0;
uniform vec3 skin_calibration_gain = vec3(1.0);
varying vec3 normal_world;
vec3 linear_to_display(vec3 value) {
	return mix(value*12.92,1.055*pow(max(value,vec3(0)),vec3(1.0/2.4))-.055,step(vec3(.0031308),value));
}
void vertex() { normal_world = normalize(MODEL_NORMAL_MATRIX * NORMAL); }
void fragment() {
	vec3 value = base_linear.rgb * mix(vec3(1),COLOR.rgb,vertex_color_weight);
	float facing = dot(normalize(normal_world),normalize(vec3(-.40,.65,.70)));
	float shade = .89 + .08*smoothstep(-.30,.20,facing) + .03*smoothstep(.35,.85,facing);
	ALBEDO = (OUTPUT_IS_SRGB ? linear_to_display(value) : value) * shade * skin_calibration_gain;
}
