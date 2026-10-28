shader_type spatial;
render_mode unshaded, cull_back;
uniform vec2 iris_center = vec2(0.25, 0.5);
uniform float iris_radius = 0.205;
void fragment() {
	float du = fract(UV.x - iris_center.x + 0.5) - 0.5;
	vec2 p = vec2(du * 2.0, UV.y - iris_center.y) / iris_radius;
	float r = length(p);
	vec3 white = vec3(0.86,0.89,0.90);
	vec3 upper = vec3(0.08,0.20,0.40);
	vec3 lower = vec3(0.36,0.66,0.82);
	vec3 iris = mix(upper, lower, smoothstep(-0.6,0.7,p.y));
	float glow = exp(-dot((p-vec2(0.04,0.55))*vec2(1.5,2.0),(p-vec2(0.04,0.55))*vec2(1.5,2.0))*3.0);
	iris = mix(iris,vec3(0.47,0.72,0.84),glow*0.44);
	iris = mix(iris, vec3(0.025,0.07,0.16), smoothstep(0.88,0.99,r));
	float pupil = 1.0-smoothstep(0.34,0.40,length(p/vec2(0.72,1.0)));
	iris = mix(iris,vec3(0.01,0.035,0.09),pupil);
	float glint = 1.0-smoothstep(0.18,0.205,length(p-vec2(-0.28,-0.40)));
	glint = max(glint, 1.0-smoothstep(0.065,0.08,length(p-vec2(0.31,0.20))));
	glint = max(glint, 1.0-smoothstep(0.045,0.06,length(p-vec2(0.42,-0.21))));
	glint = max(glint, 1.0-smoothstep(0.025,0.04,length(p-vec2(-0.52,0.11))));
	glint = max(glint, 1.0-smoothstep(0.020,0.032,length(p-vec2(-0.23,0.49))));
	iris = mix(iris,vec3(1.0),glint);
	ALBEDO = mix(iris,white,smoothstep(0.985,1.015,r));
}
