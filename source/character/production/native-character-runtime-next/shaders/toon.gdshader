shader_type spatial;
render_mode specular_disabled, cull_back;
uniform vec4 base_color : source_color = vec4(0.15, 0.35, 0.62, 1.0);
uniform float shadow_threshold = 0.35;
uniform float highlight_threshold = 0.76;

void fragment() {
	ALBEDO = base_color.rgb;
	ROUGHNESS = 1.0;
}

void light() {
	float incidence = max(dot(NORMAL, LIGHT), 0.0);
	float band = 0.20 + 0.45 * step(shadow_threshold, incidence) + 0.35 * step(highlight_threshold, incidence);
	DIFFUSE_LIGHT += ALBEDO * LIGHT_COLOR * ATTENUATION * band;
}
