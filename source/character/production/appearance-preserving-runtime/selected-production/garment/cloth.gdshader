shader_type spatial;
render_mode unshaded,cull_back;
uniform sampler2D low_positions:filter_nearest,repeat_disable;
uniform sampler2D source_texture:filter_linear_mipmap_anisotropic,repeat_disable;
uniform bool painted=false;
uniform vec3 side_navy;
uniform vec3 side_cream;
varying vec4 linear_color;
varying float side_blend;
varying float hem_t;
vec3 display(vec3 c){return mix(c*12.92,1.055*pow(max(c,vec3(0.0)),vec3(1.0/2.4))-0.055,step(vec3(0.0031308),c));}
vec3 point(float index){return texelFetch(low_positions,ivec2(int(index+.5),0),0).xyz;}
void vertex(){
 vec3 a=point(CUSTOM1.x),b=point(CUSTOM1.y),c=point(CUSTOM1.z);
 vec3 normal=normalize(cross(b-a,c-a));
 VERTEX=a*CUSTOM2.x+b*CUSTOM2.y+c*CUSTOM2.z+normal*CUSTOM1.w;
 NORMAL=normal;linear_color=CUSTOM0;side_blend=CUSTOM2.w;hem_t=UV2.x;
}
void fragment(){
 vec3 color=linear_color.rgb;
 if(painted){color*=texture(source_texture,vec2(UV.x,1.0-UV.y)).rgb;}
 color=mix(color,mix(side_navy,side_cream,smoothstep(.85,.88,hem_t)),side_blend);
 ALBEDO=OUTPUT_IS_SRGB?display(color):color;
}
