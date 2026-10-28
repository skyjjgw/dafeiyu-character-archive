shader_type spatial;
render_mode unshaded,cull_disabled;
void fragment() { ALBEDO=FRONT_FACING?vec3(.06,.65,.50):vec3(1.0,.08,.08); }
