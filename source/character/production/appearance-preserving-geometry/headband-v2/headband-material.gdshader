shader_type spatial;
render_mode unshaded, cull_back;
uniform sampler2D source_texture : source_color, filter_linear_mipmap_anisotropic, repeat_disable;
uniform bool texture_is_linear = false;
uniform bool exact_float_palette = true;
uniform bool diagnostic_solid = false;
varying vec3 source_palette;
varying vec3 source_world_normal;
varying float source_paint_weight;
vec3 to_linear(vec3 c){return mix(c/12.92,pow((c+0.055)/1.055,vec3(2.4)),step(vec3(0.04045),c));}
vec3 to_display(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
void vertex(){source_palette=exact_float_palette?CUSTOM0.rgb:COLOR.rgb;source_paint_weight=UV2.x;source_world_normal=normalize(MODEL_NORMAL_MATRIX*NORMAL);}
void fragment(){
 vec3 normal_world=normalize(source_world_normal);
 float shade=0.86+0.14*max(0.0,dot(normal_world,normalize(vec3(-3.0,6.0,5.0))));
 vec3 sampled=texture(source_texture,vec2(UV.x,1.0-UV.y)).rgb;
 vec3 source=texture_is_linear?sampled:(OUTPUT_IS_SRGB?to_linear(sampled):sampled);
 float high=max(source.r,max(source.g,source.b));float low=min(source.r,min(source.g,source.b));
 float trust=1.0-smoothstep(0.18,0.42,(high-low)/(high+0.025));
 vec3 color=mix(source_palette*shade,source,diagnostic_solid?0.0:source_paint_weight*trust);
 ALBEDO=OUTPUT_IS_SRGB?to_display(color):color;
}
