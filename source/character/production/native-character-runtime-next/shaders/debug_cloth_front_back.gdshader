shader_type spatial;
render_mode unshaded,cull_disabled;
#include "res://shaders/cloth_deform.gdshaderinc"
void vertex() { deform_cloth(VERTEX,NORMAL,CUSTOM0,CUSTOM1); }
void fragment() { ALBEDO=FRONT_FACING?vec3(.06,.65,.50):vec3(1.0,.08,.08); }
