shader_type spatial;
render_mode specular_disabled, cull_disabled;
#include "res://shaders/cloth_deform.gdshaderinc"
uniform vec4 base_linear=vec4(.1,.15,.25,1);
uniform float vertex_color_weight=0.0;
vec3 linear_to_display(vec3 color) { return mix(color*12.92,1.055*pow(max(color,vec3(0)),vec3(1.0/2.4))-.055,step(vec3(.0031308),color)); }
void vertex() { deform_cloth(VERTEX,NORMAL,CUSTOM0,CUSTOM1); }
void fragment() {
	vec3 color=base_linear.rgb*mix(vec3(1),COLOR.rgb,vertex_color_weight);
	ALBEDO=OUTPUT_IS_SRGB?linear_to_display(color):color;
	ROUGHNESS=1.0; SPECULAR=0.0; EMISSION=ALBEDO*.12;
}
void light() {
	float n=max(dot(NORMAL,LIGHT),0.0);
	float bands=.26+.45*step(.28,n)+.29*step(.72,n);
	DIFFUSE_LIGHT+=LIGHT_COLOR*ATTENUATION*bands/PI;
}
