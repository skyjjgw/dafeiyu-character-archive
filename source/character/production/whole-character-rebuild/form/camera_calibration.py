import math, json
R=.65
D=(1021-1003)*1.18/260+(1003-940)/260
print(json.dumps({'measured_world_difference':D,'required_angle_deg_by_depth':{str(r):math.degrees(math.asin(D/r)) for r in (.36,.60,.65,.68)},'projection_pixels_approx_r065':{str(a):260*R*math.sin(math.radians(a)) for a in (8,10,12,20,30)}},indent=2))
