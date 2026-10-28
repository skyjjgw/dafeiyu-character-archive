shader_type spatial;
render_mode unshaded, cull_front;
#include "res://shaders/cloth_deform.gdshaderinc"
uniform float outline_width=.007;
void vertex() { deform_cloth(VERTEX,NORMAL,CUSTOM0,CUSTOM1); VERTEX+=NORMAL*outline_width; }
void fragment() { ALBEDO=vec3(.025,.035,.08); }
