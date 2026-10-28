#include "face_kernel.hpp"
#include <algorithm>
#include <cmath>
#include <limits>
namespace godot {
namespace {constexpr double PI_S=3.141592653589793;constexpr double TAU_S=2*PI_S;}
int SelectedStructuralFaceKernel::grid_x(double x)const{return std::clamp(int(std::floor((x-cage_bounds[0])/(cage_bounds[2]-cage_bounds[0])*cage_grid)),0,cage_grid-1);}
int SelectedStructuralFaceKernel::grid_y(double y)const{return std::clamp(int(std::floor((y-cage_bounds[1])/(cage_bounds[3]-cage_bounds[1])*cage_grid)),0,cage_grid-1);}
double SelectedStructuralFaceKernel::target_front_z(double x,double y)const{
 const Section s=section(y);const double u=lateral(s,x),strength=target_strength,exponent=target_cheek;
 if(std::abs(u)==1)return mix(.015,s.v[2],strength);
 const double legacy=.015+s.v[8]*std::pow(std::max(0.,1-u*u),.25)+s.v[9]*std::exp(-std::pow((x-.02)/.075,2));
 const double curve=std::pow(std::max(0.,1-u*u),exponent),base=s.v[2]+(s.v[1]-s.v[2])*curve,axis=clamp(s.v[4],s.v[7]-s.v[6],s.v[7]+s.v[6]),au=lateral(s,axis),at=s.v[2]+(s.v[1]-s.v[2])*std::pow(std::max(0.,1-au*au),exponent),available=x>=axis?s.v[7]+s.v[6]-axis:axis-(s.v[7]-s.v[6]),q=available>1e-8?(x-axis)/available:0,kernel=std::exp(-std::pow((x-axis)/s.v[5],4))*std::sqrt(std::max(0.,1-q*q)),candidate=base+(s.v[0]-at)*kernel;
 return strength==1?candidate:mix(legacy,candidate,strength);
}
double SelectedStructuralFaceKernel::cage_depth(double x,double y)const{
 double z=-std::numeric_limits<double>::infinity();
 for(const int id:cage_cells[size_t(grid_y(y)*cage_grid+grid_x(x))]){
  const auto&t=cage_triangles[size_t(id)];const auto&p=t.p;
  const double u=((p[4]-p[7])*(x-p[6])+(p[6]-p[3])*(y-p[7]))/t.det,w=((p[7]-p[1])*(x-p[6])+(p[0]-p[6])*(y-p[7]))/t.det,q=1-u-w;
  if(u>=-1e-8&&w>=-1e-8&&q>=-1e-8)z=std::max(z,u*p[2]+w*p[5]+q*p[8]);
 }return z;
}
std::pair<double,double>SelectedStructuralFaceKernel::depth_v3(double x,double y)const{
 const XY key{x,y};const auto found=depth_cache.find(key);if(found!=depth_cache.end())return found->second;
 if(depth_cache.size()>200000)depth_cache.clear();
 const double old=front_z(x,y),target=target_front_z(x,y),delta=target-old,hair=cage_depth(x,y);
 double fraction=1;if(std::isfinite(hair)&&std::abs(delta)>1e-12)fraction=std::tanh(std::max(0.,std::abs(hair-old)-cage_padding)*cage_safety/std::abs(delta));
 const auto value=std::make_pair(old+delta*fraction,fraction);depth_cache.emplace(key,value);return value;
}
SelectedStructuralFaceKernel::V3 SelectedStructuralFaceKernel::source_point(int role,int eye,double theta,double radial,const State&s)const{
 Canonical p;p.role=role;p.eye=eye;p.a=theta;p.b=radial;const auto v=sample(p,s);
 const double x=double(float(v.x)),y=double(float(v.y));
 return {x,y,double(float(double(float(v.z))+depth_v3(x,y).first-front_z(x,y)))};
}
SelectedStructuralFaceKernel::V3 SelectedStructuralFaceKernel::source_ring(int role,int eye,double theta,double radial,const State&s)const{
 const int segments=96,rings=role==MOUTH_CAVITY?8:role==MOUTH_RING?14:16;
 const double q=std::fmod(std::fmod(theta/TAU_S,1.)+1.,1.)*segments;const int i=int(std::floor(q));const double f=q-i,r=radial*rings;const int lo=std::min(rings,int(std::floor(r))),hi=std::min(rings,lo+1);const double k=r-lo;
 if(source_frame_ready&&(radial==1||role==MOUTH_CAVITY)){
  const auto&cache=source_frame_cache[size_t(role==MOUTH_CAVITY?3:role==MOUTH_RING?2:eye)];
  const int row_a=role==MOUTH_CAVITY?lo:0,row_b=role==MOUTH_CAVITY?hi:0;
  const auto&a=cache[size_t(row_a*97+i)];const auto&b=cache[size_t(row_a*97+i+1)];const auto&c=cache[size_t(row_b*97+i)];const auto&d=cache[size_t(row_b*97+i+1)];
  return {mix(mix(a.x,b.x,f),mix(c.x,d.x,f),k),mix(mix(a.y,b.y,f),mix(c.y,d.y,f),k),mix(mix(a.z,b.z,f),mix(c.z,d.z,f),k)};
 }
 const auto a=source_point(role,eye,double(i)/segments*TAU_S,double(lo)/rings,s),b=source_point(role,eye,double(i+1)/segments*TAU_S,double(lo)/rings,s),c=source_point(role,eye,double(i)/segments*TAU_S,double(hi)/rings,s),d=source_point(role,eye,double(i+1)/segments*TAU_S,double(hi)/rings,s);
 return {mix(mix(a.x,b.x,f),mix(c.x,d.x,f),k),mix(mix(a.y,b.y,f),mix(c.y,d.y,f),k),mix(mix(a.z,b.z,f),mix(c.z,d.z,f),k)};
}
void SelectedStructuralFaceKernel::prepare_structure_frame(const State&s){
 source_frame_ready=false;
 for(int set=0;set<4;++set){const int role=set<2?EYE_RING:set==2?MOUTH_RING:MOUTH_CAVITY,eye=set<2?set:0,rows=set==3?9:1;auto&cache=source_frame_cache[size_t(set)];cache.resize(size_t(rows*97));for(int row=0;row<rows;++row)for(int i=0;i<97;++i)cache[size_t(row*97+i)]=source_point(role,eye,double(i)/96*TAU_S,set==3?double(row)/8:1.,s);}
 source_frame_ready=true;
}
bool SelectedStructuralFaceKernel::inside_rim(double x,double y,const std::vector<V3>&rim){bool yes=false;for(size_t i=0,j=rim.size()-1;i<rim.size();j=i++){const auto&a=rim[i];const auto&b=rim[j];if((a.y>y)!=(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}
double SelectedStructuralFaceKernel::rim_distance(double x,double y,const std::vector<V3>&rim){double d=std::numeric_limits<double>::infinity();for(size_t i=0;i<rim.size();++i){const auto&a=rim[i];const auto&b=rim[(i+1)%rim.size()];const double dx=b.x-a.x,dy=b.y-a.y,q=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)),ex=x-a.x-dx*q,ey=y-a.y-dy*q;d=std::min(d,ex*ex+ey*ey);}return std::sqrt(d);}
SelectedStructuralFaceKernel::V3 SelectedStructuralFaceKernel::rim_at(const Hole&h,double theta){const double q=std::fmod(std::fmod(theta/TAU_S,1.)+1.,1.)*96;const int i=int(std::floor(q));const double k=q-i;const auto&a=h.rim[size_t(i)];const auto&b=h.rim[size_t((i+1)%96)];return{mix(a.x,b.x,k),mix(a.y,b.y,k),mix(a.z,b.z,k)};}
SelectedStructuralFaceKernel::Sample SelectedStructuralFaceKernel::sample_structure(const Canonical&p,const State&s)const{
 Sample v;if(!structure_enabled||p.eye<0||size_t(p.eye)>=holes.size()){v.x=std::numeric_limits<double>::quiet_NaN();return v;}
 const auto&h=holes[size_t(p.eye)];const auto inner=source_ring(h.eye?EYE_RING:MOUTH_RING,h.eye_index,p.a,1,s);double shade=1;
 if(p.role==20){const int a=int(p.c);if(a<0||size_t(a)>=support_anchors.size()){v.x=std::numeric_limits<double>::quiet_NaN();return v;}const auto&anchor=support_anchors[size_t(a)];v.x=mix(anchor.x,inner.x,p.b);v.y=mix(anchor.y,inner.y,p.b);const double amount=h.eye?(inside_rim(v.x,v.y,h.rim)?1:smooth(clamp(1-rim_distance(v.x,v.y,h.rim)/h.transition))):smooth(p.b);v.z=depth_v3(v.x,v.y).first+.0058*amount;}
 else if(p.role==21){const double t=p.b;const auto neutral=rim_at(h,p.a);const V3 expanded{h.center.x+(neutral.x-h.center.x)*1.18,h.center.y+(neutral.y-h.center.y)*1.18,neutral.z};
  if(t<=.4){const double u=smooth(t/.4);v.x=mix(inner.x,expanded.x,u);v.y=mix(inner.y,expanded.y,u);const double outside=inside_rim(v.x,v.y,h.rim)?0:smooth(clamp(rim_distance(v.x,v.y,h.rim)/h.transition));v.z=depth_v3(v.x,v.y).first+mix(.0058,.0038,u)-.045*outside;}
  else{const double u=(t-.4)/.6,scale=u<.7?1:std::cos((u-.7)/.3*PI_S/2);v.x=h.center.x+(expanded.x-h.center.x)*scale;v.y=h.center.y+(expanded.y-h.center.y)*scale;v.z=mix(depth_v3(expanded.x,expanded.y).first+.0038-.045,depth_v3(h.center.x,h.center.y).first-.235+.0058,smooth(u));}shade=1-.48*t;
 }else if(p.role==22){v.x=h.center.x;v.y=h.center.y;v.z=depth_v3(v.x,v.y).first-.235+.0058;shade=.5;}
 else if(p.role==23){v.x=inner.x;v.y=inner.y;v.z=depth_v3(v.x,v.y).first+mix(.0058,-.075,p.b);return v;}
 else if(p.role==24){const auto q=source_ring(MOUTH_CAVITY,0,p.a,p.b,s);v.x=q.x;v.y=q.y;v.z=q.z-.078;return v;}
 const auto color=skin_color(v.x,v.y);v.rgba={color[0]*shade,color[1]*shade,color[2]*shade,1};v.color=true;return v;
}
Dictionary SelectedStructuralFaceKernel::configure_structure(const Dictionary&config){
 if(!configured)return failure("configure_source_first");structure_enabled=false;depth_cache.clear();holes.clear();support_anchors.clear();cage_triangles.clear();cage_cells.clear();
 const Dictionary deformation=config.get("deformationConfig",Dictionary()),policy=config.get("depthPolicy",Dictionary()),parameters=policy.get("parameters",Dictionary()),cage=config.get("cage",Dictionary());
 if(String(cage.get("schema",""))!="dafeiyu.head-rest-depth-cage.v3")return failure("invalid_v3_cage_schema");
 target_strength=parameters.get("strength",1.);target_cheek=parameters.get("cheekExponent",.5);if(!std::isfinite(target_strength)||!std::isfinite(target_cheek)||target_strength<0||target_strength>1||target_cheek<=0)return failure("invalid_v3_profile");
 const Array bounds=cage.get("bounds",Array());if(bounds.size()!=4)return failure("invalid_cage_bounds");for(int i=0;i<4;++i){cage_bounds[size_t(i)]=bounds[i];if(!std::isfinite(cage_bounds[size_t(i)]))return failure("nonfinite_cage_bounds");}if(cage_bounds[2]<=cage_bounds[0]||cage_bounds[3]<=cage_bounds[1])return failure("invalid_cage_extent");
 const int source_grid=cage.get("gridResolution",48);cage_grid=config.get("nativeGridResolution",source_grid);cage_padding=cage.get("padding",.012);cage_safety=cage.get("safety",.55);if(cage_grid<1||cage_grid>256||!std::isfinite(cage_padding)||!std::isfinite(cage_safety)||cage_padding<0||cage_safety<0)return failure("invalid_cage_parameters");cage_cells.resize(size_t(cage_grid*cage_grid));
 const Array triangles=cage.get("triangles",Array());if(triangles.is_empty()||triangles.size()>500000)return failure("invalid_cage_count");
 for(const Variant&item:triangles){const Array row=item;if(row.size()!=9)return failure("invalid_cage_triangle");DepthTriangle t;for(int i=0;i<9;++i){t.p[size_t(i)]=row[i];if(!std::isfinite(t.p[size_t(i)]))return failure("nonfinite_cage_triangle");}const auto&p=t.p;t.det=(p[4]-p[7])*(p[0]-p[6])+(p[6]-p[3])*(p[1]-p[7]);if(std::abs(t.det)<1e-13)return failure("degenerate_cage_triangle");const int id=int(cage_triangles.size());cage_triangles.push_back(t);for(int y=grid_y(std::min({p[1],p[4],p[7]}));y<=grid_y(std::max({p[1],p[4],p[7]}));++y)for(int x=grid_x(std::min({p[0],p[3],p[6]}));x<=grid_x(std::max({p[0],p[3],p[6]}));++x)cage_cells[size_t(y*cage_grid+x)].push_back(id);}
 const Array hole_data=deformation.get("holes",Array());if(hole_data.size()!=3)return failure("expected_three_head_apertures");
 for(const Variant&item:hole_data){const Dictionary row=item;Hole h;h.eye=String(row.get("type",""))=="eye";h.eye_index=row.get("eye",0);h.center=vec2(row["center"]);h.transition=row.get("skinTransitionWidth",.001);if(h.eye){const Array rim=row.get("neutralRim",Array());if(rim.size()!=96||h.transition<=0)return failure("invalid_source_eye_rim");for(const Variant&point:rim){const Array p=point;h.rim.push_back({p[0],p[1],p[2]});}}holes.push_back(h);}
 for(const Variant&item:Array(deformation.get("supportAnchors",Array()))){const Array p=item;if(p.size()!=3)return failure("invalid_support_anchor");support_anchors.push_back({p[0],p[1],p[2]});}
 if(support_anchors.empty())return failure("missing_support_anchors");structure_enabled=true;depth_policy["kind"]="source-fitted-structure-v3";Dictionary result;result["ok"]=true;result["cage_triangles"]=int(cage_triangles.size());result["support_anchors"]=int(support_anchors.size());result["new_roles"]=5;result["native_grid_resolution"]=cage_grid;result["source_grid_resolution"]=source_grid;return result;
}
}
