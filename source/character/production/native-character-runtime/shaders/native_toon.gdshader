shader_type spatial;
render_mode specular_disabled, cull_back;
uniform vec4 base_linear = vec4(0.35, 0.45, 0.65, 1.0);
uniform float vertex_color_weight = 0.0;
uniform bool is_skin = false;
uniform vec3 skin_calibration_gain = vec3(1.0);
vec3 linear_to_display(vec3 color) {
	return mix(color * 12.92, 1.055 * pow(max(color,vec3(0.0)), vec3(1.0/2.4)) - 0.055, step(vec3(0.0031308),color));
}
void fragment() {
	vec3 color = base_linear.rgb * mix(vec3(1.0), COLOR.rgb, vertex_color_weight);
	ALBEDO = OUTPUT_IS_SRGB ? linear_to_display(color) : color;
	if (is_skin) ALBEDO *= skin_calibration_gain;
	ROUGHNESS = 1.0;
	SPECULAR = 0.0;
	EMISSION = ALBEDO * (is_skin ? 0.60 : 0.12);
}
void light() {
	float n = max(dot(NORMAL, LIGHT), 0.0);
	float bands = 0.26 + 0.45 * step(0.28, n) + 0.29 * step(0.72, n);
	if (is_skin) bands = 0.65 + 0.17 * step(0.28,n) + 0.18 * step(0.72,n);
	float attenuation = is_skin ? mix(1.0,ATTENUATION,0.20) : ATTENUATION;
	DIFFUSE_LIGHT += LIGHT_COLOR * attenuation * bands * (is_skin ? 0.35 : 1.0) / PI;
}
