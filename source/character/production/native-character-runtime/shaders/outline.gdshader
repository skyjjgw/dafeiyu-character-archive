shader_type spatial;
render_mode unshaded, cull_front;
uniform float outline_width = 0.012;
uniform vec4 outline_color : source_color = vec4(0.025, 0.035, 0.08, 1.0);

void vertex() { VERTEX += NORMAL * outline_width; }
void fragment() { ALBEDO = outline_color.rgb; }
