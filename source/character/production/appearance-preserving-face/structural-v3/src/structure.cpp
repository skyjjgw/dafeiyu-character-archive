#include "face_kernel.hpp"
#include <algorithm>
#include <cmath>
#include <limits>
#include <chrono>
#include <cstdlib>
#include <cstdio>
#include <cstring>
namespace godot {
namespace {constexpr double PI_S=3.141592653589793;constexpr double TAU_S=2*PI_S;
thread_local int depth_worker_lane=0;
struct ProfileScope{uint64_t*total;std::chrono::steady_clock::time_point begin;explicit ProfileScope(uint64_t*p):total(p){if(total)begin=std::chrono::steady_clock::now();}~ProfileScope(){if(total)*total+=uint64_t(std::chrono::duration_cast<std::chrono::nanoseconds>(std::chrono::steady_clock::now()-begin).count());}};
}
int SelectedStructuralFaceKernel::grid_x(double x)const{return std::clamp(int(std::floor((x-cage_bounds[0])/(cage_bounds[2]-cage_bounds[0])*cage_grid)),0,cage_grid-1);}
int SelectedStructuralFaceKernel::grid_y(double y)const{return std::clamp(int(std::floor((y-cage_bounds[1])/(cage_bounds[3]-cage_bounds[1])*cage_grid)),0,cage_grid-1);}
double SelectedStructuralFaceKernel::target_front_z(double x,double y)const{
 const Section s=section(y);const double u=lateral(s,x),strength=target_strength,exponent=target_cheek;
 if(std::abs(u)==1)return mix(.015,s.v[2],strength);
 const auto legacy=[&](){return .015+s.v[8]*std::pow(std::max(0.,1-u*u),.25)+s.v[9]*std::exp(-std::pow((x-.02)/.075,2));};
 const double curve=std::pow(std::max(0.,1-u*u),exponent),base=s.v[2]+(s.v[1]-s.v[2])*curve,axis=clamp(s.v[4],s.v[7]-s.v[6],s.v[7]+s.v[6]),au=lateral(s,axis),at=s.v[2]+(s.v[1]-s.v[2])*std::pow(std::max(0.,1-au*au),exponent),available=x>=axis?s.v[7]+s.v[6]-axis:axis-(s.v[7]-s.v[6]),q=available>1e-8?(x-axis)/available:0,kernel=std::exp(-std::pow((x-axis)/s.v[5],4))*std::sqrt(std::max(0.,1-q*q)),candidate=base+(s.v[0]-at)*kernel;
 return strength==1?candidate:mix(legacy(),candidate,strength);
}
double SelectedStructuralFaceKernel::cage_depth(double x,double y)const{
 ProfileScope profile(profile_enabled?&profile_nanos[0]:nullptr);
 double z=-std::numeric_limits<double>::infinity();
 for(const int id:cage_cells[size_t(grid_y(y)*cage_grid+grid_x(x))]){
  if(profile_enabled)++profile_counts[2];
  const auto&t=cage_triangles[size_t(id)];const auto&p=t.p;
  if(t.maximum_z<z)break;
  if(x<t.bounds[0]||y<t.bounds[1]||x>t.bounds[2]||y>t.bounds[3])continue;
  const double u=((p[4]-p[7])*(x-p[6])+(p[6]-p[3])*(y-p[7]))/t.det,w=((p[7]-p[1])*(x-p[6])+(p[0]-p[6])*(y-p[7]))/t.det,q=1-u-w;
  if(u>=-1e-8&&w>=-1e-8&&q>=-1e-8)z=std::max(z,u*p[2]+w*p[5]+q*p[8]);
 }return z;
}
std::pair<double,double>SelectedStructuralFaceKernel::depth_v3(double x,double y)const{
 ProfileScope profile(profile_enabled?&profile_nanos[1]:nullptr);if(profile_enabled)++profile_counts[0];
 constexpr size_t capacity=size_t(1)<<19,mask=capacity-1;
 auto&cache=depth_lanes[size_t(depth_worker_lane)];
 if(cache.slots.empty())cache.slots.resize(capacity);
 if(cache.count>=capacity*3/4)clear_depth_cache(false);
 uint64_t hx=0,hy=0;if(x!=0)std::memcpy(&hx,&x,8);if(y!=0)std::memcpy(&hy,&y,8);
 uint64_t hash=hx^((hy<<29)|(hy>>35));hash^=hash>>30;hash*=0xbf58476d1ce4e5b9ULL;hash^=hash>>27;hash*=0x94d049bb133111ebULL;hash^=hash>>31;
 size_t slot=size_t(hash)&mask;while(cache.slots[slot].generation==cache.generation){const auto&entry=cache.slots[slot];if(entry.key.x==x&&entry.key.y==y)return entry.value;slot=(slot+1)&mask;}
 if(profile_enabled)++profile_counts[1];
 const double old=front_z(x,y),target=target_front_z(x,y),delta=target-old,hair=cage_depth(x,y);
 double fraction=1;if(std::isfinite(hair)&&std::abs(delta)>1e-12)fraction=std::tanh(std::max(0.,std::abs(hair-old)-cage_padding)*cage_safety/std::abs(delta));
 // Second value caches the exact source depth, not an approximation or delta.
 // Subtract it in the original arithmetic order to preserve Float32 parity.
 const auto value=std::make_pair(old+delta*fraction,old);auto&entry=cache.slots[slot];entry.key={x,y};entry.value=value;entry.generation=cache.generation;++cache.count;return value;
}
void SelectedStructuralFaceKernel::clear_depth_cache(bool invalidate_static)const{for(size_t i=0;i<depth_lanes.size();++i){if(!invalidate_static&&i!=size_t(depth_worker_lane))continue;auto&cache=depth_lanes[i];++cache.generation;if(cache.generation==0){for(auto&entry:cache.slots)entry.generation=0;cache.generation=1;}cache.count=0;}if(invalidate_static){structure_static_samples.clear();source_state_ready=false;source_frame_ready=false;++geometry_generation;}}
uint8_t SelectedStructuralFaceKernel::state_changes(const State&a,const State&b){return uint8_t((a.blink!=b.blink?1:0)|(a.talk!=b.talk?2:0)|(a.happy!=b.happy?4:0)|(a.sad!=b.sad?8:0)|(a.gaze_x!=b.gaze_x?16:0)|(a.gaze_y!=b.gaze_y?32:0));}
uint8_t SelectedStructuralFaceKernel::canonical_dependencies(const Canonical&p)const{
 constexpr uint8_t eye=1|4|8,mouth=2|4|8;
 if(p.role>=20&&(p.eye<0||size_t(p.eye)>=holes.size()))return 63;
 if(p.role==STATIC||p.role==FRONT_PROFILE||p.role==22||(p.role==21&&p.b>.4))return 0;
 if(p.role==IRIS)return eye|16|32;
 if(p.role==EYE_RING||p.role==SCLERA||p.role==UPPER_LASH||p.role==WING||p.role==LOWER_LASH||p.role==CREASE)return p.role==EYE_RING&&p.b==0?0:eye;
 if(p.role==MOUTH_RING||p.role==MOUTH_CAVITY||p.role==TONGUE||p.role==LIPS)return p.role==MOUTH_RING&&p.b==0?0:mouth;
 if(p.role==20){if(p.b==0)return 0;return holes[size_t(p.eye)].eye?eye:mouth;}
 if(p.role==21)return holes[size_t(p.eye)].eye?eye:mouth;
 if(p.role==23||p.role==24)return mouth;
 return 63;
}
void SelectedStructuralFaceKernel::configure_dependencies(){for(auto&mesh:meshes){mesh.dependencies.clear();mesh.dependencies.reserve(mesh.vertices.size());mesh.dependencies_mask=0;mesh.state_ready=false;for(const auto&p:mesh.vertices){const auto dep=canonical_dependencies(p);mesh.dependencies.push_back(dep);mesh.dependencies_mask|=dep;}if(mesh.role==IRIS||mesh.role==SCLERA)mesh.dependencies_mask|=1;if(mesh.role==TONGUE)mesh.dependencies_mask|=2;}source_state_ready=false;}
SelectedStructuralFaceKernel::V3 SelectedStructuralFaceKernel::source_point(int role,int eye,double theta,double radial,const State&s)const{
 Canonical p;p.role=role;p.eye=eye;p.a=theta;p.b=radial;const auto v=sample(p,s);
 const double x=double(float(v.x)),y=double(float(v.y));
 const auto depth=depth_v3(x,y);return {x,y,double(float(double(float(v.z))+depth.first-depth.second))};
}
SelectedStructuralFaceKernel::V3 SelectedStructuralFaceKernel::source_ring(int role,int eye,double theta,double radial,const State&s)const{
 ProfileScope profile(profile_enabled?&profile_nanos[5]:nullptr);if(profile_enabled)++profile_counts[6];
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
 profile_nanos.fill(0);profile_counts.fill(0);ProfileScope profile(profile_enabled?&profile_nanos[6]:nullptr);
 const auto changed=source_state_ready?state_changes(source_cached_state,s):uint8_t(63);
 source_frame_ready=false;
 for(int set=0;set<4;++set){if(source_state_ready&&(changed&(set<2?uint8_t(1|4|8):uint8_t(2|4|8)))==0)continue;const int role=set<2?EYE_RING:set==2?MOUTH_RING:MOUTH_CAVITY,eye=set<2?set:0,rows=set==3?9:1;auto&cache=source_frame_cache[size_t(set)];cache.resize(size_t(rows*97));for(int row=0;row<rows;++row)for(int i=0;i<97;++i)cache[size_t(row*97+i)]=source_point(role,eye,double(i)/96*TAU_S,set==3?double(row)/8:1.,s);}
 source_frame_ready=true;source_state_ready=true;source_cached_state=s;
}
bool SelectedStructuralFaceKernel::inside_rim(double x,double y,const Hole&hole)const{ProfileScope profile(profile_enabled?&profile_nanos[2]:nullptr);if(profile_enabled)++profile_counts[3];const auto&bounds=hole.bounds;if(x<bounds[0]||x>bounds[2]||y<bounds[1]||y>bounds[3])return false;const int row=std::clamp(int(std::floor((y-bounds[1])/(bounds[3]-bounds[1])*RIM_GRID)),0,RIM_GRID-1);bool yes=false;const auto&rim=hole.rim;for(const int index:hole.y_segments[size_t(row)]){const size_t i=size_t(index),j=i==0?rim.size()-1:i-1;const auto&a=rim[i];const auto&b=rim[j];if((a.y>y)!=(b.y>y)&&x<(b.x-a.x)*(y-a.y)/(b.y-a.y)+a.x)yes=!yes;}return yes;}
double SelectedStructuralFaceKernel::rim_distance(double x,double y,const Hole&hole)const{ProfileScope profile(profile_enabled?&profile_nanos[3]:nullptr);if(profile_enabled)++profile_counts[4];
 const auto&bounds=hole.bounds;const double bx=std::max({bounds[0]-x,0.,x-bounds[2]}),by=std::max({bounds[1]-y,0.,y-bounds[3]}),limit=hole.transition;
 // Both callers already saturate at transition. Reject only boxes safely
 // beyond it, preserving the exact original segment query inside the band.
 if(bx*bx+by*by>limit*limit*(1+1e-14))return limit;
 const auto&frame=hole.near_bounds;const int gx=std::clamp(int(std::floor((x-frame[0])/(frame[2]-frame[0])*RIM_GRID)),0,RIM_GRID-1),gy=std::clamp(int(std::floor((y-frame[1])/(frame[3]-frame[1])*RIM_GRID)),0,RIM_GRID-1);
 const auto&rim=hole.rim;double d=std::numeric_limits<double>::infinity();for(const int id:hole.near_segments[size_t(gy*RIM_GRID+gx)]){const size_t i=size_t(id);const auto&a=rim[i];const auto&b=rim[(i+1)%rim.size()];const double dx=b.x-a.x,dy=b.y-a.y,q=clamp(((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)),ex=x-a.x-dx*q,ey=y-a.y-dy*q;d=std::min(d,ex*ex+ey*ey);}return std::isfinite(d)?std::sqrt(d):limit;}
void SelectedStructuralFaceKernel::build_rim_index(Hole&h){
 const double padding=h.transition+1e-13;h.near_bounds={h.bounds[0]-padding,h.bounds[1]-padding,h.bounds[2]+padding,h.bounds[3]+padding};h.near_segments.resize(RIM_GRID*RIM_GRID);h.y_segments.resize(RIM_GRID);
 const auto gx=[&](double x){return std::clamp(int(std::floor((x-h.near_bounds[0])/(h.near_bounds[2]-h.near_bounds[0])*RIM_GRID)),0,RIM_GRID-1);};const auto gy=[&](double y){return std::clamp(int(std::floor((y-h.near_bounds[1])/(h.near_bounds[3]-h.near_bounds[1])*RIM_GRID)),0,RIM_GRID-1);};const auto row=[&](double y){return std::clamp(int(std::floor((y-h.bounds[1])/(h.bounds[3]-h.bounds[1])*RIM_GRID)),0,RIM_GRID-1);};
 for(size_t i=0;i<h.rim.size();++i){const auto&a=h.rim[i];const auto&b=h.rim[(i+1)%h.rim.size()];for(int y=gy(std::min(a.y,b.y)-padding);y<=gy(std::max(a.y,b.y)+padding);++y)for(int x=gx(std::min(a.x,b.x)-padding);x<=gx(std::max(a.x,b.x)+padding);++x)h.near_segments[size_t(y*RIM_GRID+x)].push_back(int(i));const auto&previous=h.rim[i==0?h.rim.size()-1:i-1];for(int y=row(std::min(a.y,previous.y));y<=row(std::max(a.y,previous.y));++y)h.y_segments[size_t(y)].push_back(int(i));}
}
SelectedStructuralFaceKernel::V3 SelectedStructuralFaceKernel::rim_at(const Hole&h,double theta){const double q=std::fmod(std::fmod(theta/TAU_S,1.)+1.,1.)*96;const int i=int(std::floor(q));const double k=q-i;const auto&a=h.rim[size_t(i)];const auto&b=h.rim[size_t((i+1)%96)];return{mix(a.x,b.x,k),mix(a.y,b.y,k),mix(a.z,b.z,k)};}
SelectedStructuralFaceKernel::Sample SelectedStructuralFaceKernel::sample_structure(const Canonical&p,const State&s)const{
 ProfileScope profile(profile_enabled?&profile_nanos[4]:nullptr);if(profile_enabled&&p.role==20)++profile_counts[5];
 Sample v;if(!structure_enabled||p.eye<0||size_t(p.eye)>=holes.size()){v.x=std::numeric_limits<double>::quiet_NaN();return v;}
 if((p.role==21&&p.b>.4)||p.role==22){const auto found=structure_static_samples.find(&p);if(found!=structure_static_samples.end())return found->second;}
 const auto&h=holes[size_t(p.eye)];V3 inner;if(p.role==20||p.role==23||(p.role==21&&p.b<=.4))inner=source_ring(h.eye?EYE_RING:MOUTH_RING,h.eye_index,p.a,1,s);double shade=1;
 if(p.role==20){const int a=int(p.c);if(a<0||size_t(a)>=support_anchors.size()){v.x=std::numeric_limits<double>::quiet_NaN();return v;}const auto&anchor=support_anchors[size_t(a)];v.x=mix(anchor.x,inner.x,p.b);v.y=mix(anchor.y,inner.y,p.b);const double amount=h.eye?(inside_rim(v.x,v.y,h)?1:smooth(clamp(1-rim_distance(v.x,v.y,h)/h.transition))):smooth(p.b);v.z=depth_v3(v.x,v.y).first+.0058*amount;}
 else if(p.role==21){const double t=p.b;const auto neutral=rim_at(h,p.a);const V3 expanded{h.center.x+(neutral.x-h.center.x)*1.18,h.center.y+(neutral.y-h.center.y)*1.18,neutral.z};
  if(t<=.4){const double u=smooth(t/.4);v.x=mix(inner.x,expanded.x,u);v.y=mix(inner.y,expanded.y,u);const double outside=inside_rim(v.x,v.y,h)?0:smooth(clamp(rim_distance(v.x,v.y,h)/h.transition));v.z=depth_v3(v.x,v.y).first+mix(.0058,.0038,u)-.045*outside;}
  else{const double u=(t-.4)/.6,scale=u<.7?1:std::cos((u-.7)/.3*PI_S/2);v.x=h.center.x+(expanded.x-h.center.x)*scale;v.y=h.center.y+(expanded.y-h.center.y)*scale;v.z=mix(depth_v3(expanded.x,expanded.y).first+.0038-.045,depth_v3(h.center.x,h.center.y).first-.235+.0058,smooth(u));}shade=1-.48*t;
 }else if(p.role==22){v.x=h.center.x;v.y=h.center.y;v.z=depth_v3(v.x,v.y).first-.235+.0058;shade=.5;}
 else if(p.role==23){v.x=inner.x;v.y=inner.y;v.z=depth_v3(v.x,v.y).first+mix(.0058,-.075,p.b);return v;}
 else if(p.role==24){const auto q=source_ring(MOUTH_CAVITY,0,p.a,p.b,s);v.x=q.x;v.y=q.y;v.z=q.z-.078;return v;}
 const auto color=skin_color(v.x,v.y);v.rgba={color[0]*shade,color[1]*shade,color[2]*shade,1};v.color=true;return v;
}
Dictionary SelectedStructuralFaceKernel::configure_structure(const Dictionary&config){
 profile_enabled=std::getenv("DFY_FACE_PROFILE")!=nullptr;
 serial_only=profile_enabled||std::getenv("DFY_FACE_SERIAL")!=nullptr;
 if(!configured)return failure("configure_source_first");structure_enabled=false;clear_depth_cache();holes.clear();support_anchors.clear();cage_triangles.clear();cage_cells.clear();
 const Dictionary deformation=config.get("deformationConfig",Dictionary()),policy=config.get("depthPolicy",Dictionary()),parameters=policy.get("parameters",Dictionary()),cage=config.get("cage",Dictionary());
 if(String(cage.get("schema",""))!="dafeiyu.head-rest-depth-cage.v3")return failure("invalid_v3_cage_schema");
 target_strength=parameters.get("strength",1.);target_cheek=parameters.get("cheekExponent",.5);if(!std::isfinite(target_strength)||!std::isfinite(target_cheek)||target_strength<0||target_strength>1||target_cheek<=0)return failure("invalid_v3_profile");
 const Array bounds=cage.get("bounds",Array());if(bounds.size()!=4)return failure("invalid_cage_bounds");for(int i=0;i<4;++i){cage_bounds[size_t(i)]=bounds[i];if(!std::isfinite(cage_bounds[size_t(i)]))return failure("nonfinite_cage_bounds");}if(cage_bounds[2]<=cage_bounds[0]||cage_bounds[3]<=cage_bounds[1])return failure("invalid_cage_extent");
 const int source_grid=cage.get("gridResolution",48);cage_grid=config.get("nativeGridResolution",source_grid);cage_padding=cage.get("padding",.012);cage_safety=cage.get("safety",.55);if(cage_grid<1||cage_grid>256||!std::isfinite(cage_padding)||!std::isfinite(cage_safety)||cage_padding<0||cage_safety<0)return failure("invalid_cage_parameters");const int requested_grid=cage_grid;cage_grid=256;cage_cells.resize(size_t(cage_grid*cage_grid));
 const Array triangles=cage.get("triangles",Array());if(triangles.is_empty()||triangles.size()>500000)return failure("invalid_cage_count");
 for(const Variant&item:triangles){const Array row=item;if(row.size()!=9)return failure("invalid_cage_triangle");DepthTriangle t;for(int i=0;i<9;++i){t.p[size_t(i)]=row[i];if(!std::isfinite(t.p[size_t(i)]))return failure("nonfinite_cage_triangle");}const auto&p=t.p;t.det=(p[4]-p[7])*(p[0]-p[6])+(p[6]-p[3])*(p[1]-p[7]);if(std::abs(t.det)<1e-13)return failure("degenerate_cage_triangle");const int id=int(cage_triangles.size());const double minx=std::min({p[0],p[3],p[6]}),maxx=std::max({p[0],p[3],p[6]}),miny=std::min({p[1],p[4],p[7]}),maxy=std::max({p[1],p[4],p[7]});const double ex=2e-8*(maxx-minx)+1e-14,ey=2e-8*(maxy-miny)+1e-14;t.bounds={minx-ex,miny-ey,maxx+ex,maxy+ey};const double minz=std::min({p[2],p[5],p[8]}),maxz=std::max({p[2],p[5],p[8]});t.maximum_z=maxz+2e-8*(maxz-minz)+1e-13;cage_triangles.push_back(t);for(int y=grid_y(std::min({p[1],p[4],p[7]}));y<=grid_y(std::max({p[1],p[4],p[7]}));++y)for(int x=grid_x(std::min({p[0],p[3],p[6]}));x<=grid_x(std::max({p[0],p[3],p[6]}));++x)cage_cells[size_t(y*cage_grid+x)].push_back(id);}
 for(auto&cell:cage_cells)std::stable_sort(cell.begin(),cell.end(),[&](int a,int b){return cage_triangles[size_t(a)].maximum_z>cage_triangles[size_t(b)].maximum_z;});const Array hole_data=deformation.get("holes",Array());if(hole_data.size()!=3)return failure("expected_three_head_apertures");
 for(const Variant&item:hole_data){const Dictionary row=item;Hole h;h.eye=String(row.get("type",""))=="eye";h.eye_index=row.get("eye",0);h.center=vec2(row["center"]);h.transition=row.get("skinTransitionWidth",.001);if(h.eye){const Array rim=row.get("neutralRim",Array());if(rim.size()!=96||h.transition<=0)return failure("invalid_source_eye_rim");for(const Variant&point:rim){const Array p=point;h.rim.push_back({p[0],p[1],p[2]});}}if(h.eye){h.bounds={std::numeric_limits<double>::infinity(),std::numeric_limits<double>::infinity(),-std::numeric_limits<double>::infinity(),-std::numeric_limits<double>::infinity()};for(const auto&p:h.rim){h.bounds[0]=std::min(h.bounds[0],p.x);h.bounds[1]=std::min(h.bounds[1],p.y);h.bounds[2]=std::max(h.bounds[2],p.x);h.bounds[3]=std::max(h.bounds[3],p.y);}build_rim_index(h);}holes.push_back(h);}
 for(const Variant&item:Array(deformation.get("supportAnchors",Array()))){const Array p=item;if(p.size()!=3)return failure("invalid_support_anchor");support_anchors.push_back({p[0],p[1],p[2]});}
 if(support_anchors.empty())return failure("missing_support_anchors");for(auto&lane:depth_lanes)if(lane.slots.empty())lane.slots.resize(size_t(1)<<19);structure_enabled=true;configure_dependencies();structure_static_samples.reserve(3000);for(const auto&mesh:meshes)for(const auto&point:mesh.vertices)if((point.role==21&&point.b>.4)||point.role==22)structure_static_samples.emplace(&point,sample_structure(point,State{}));depth_policy["kind"]="source-fitted-structure-v3";Dictionary result;result["ok"]=true;result["cage_triangles"]=int(cage_triangles.size());result["support_anchors"]=int(support_anchors.size());result["new_roles"]=5;result["native_grid_resolution"]=cage_grid;result["requested_native_grid_resolution"]=requested_grid;result["source_grid_resolution"]=source_grid;return result;
}
void SelectedStructuralFaceKernel::report_structure_profile()const{if(!profile_enabled)return;std::fprintf(stderr,"DFY_PROFILE cage=%.4f depth_inclusive=%.4f inside=%.4f rim_distance=%.4f structure_inclusive=%.4f source_ring=%.4f prepare=%.4f depth_calls=%llu misses=%llu cage_tests=%llu inside_calls=%llu rim_calls=%llu support_calls=%llu ring_calls=%llu cache_size=%zu\n",profile_nanos[0]/1e6,profile_nanos[1]/1e6,profile_nanos[2]/1e6,profile_nanos[3]/1e6,profile_nanos[4]/1e6,profile_nanos[5]/1e6,profile_nanos[6]/1e6,profile_counts[0],profile_counts[1],profile_counts[2],profile_counts[3],profile_counts[4],profile_counts[5],profile_counts[6],depth_lanes[0].count+depth_lanes[1].count);}
void SelectedStructuralFaceKernel::start_structure_worker(){
 if(structure_worker.joinable()||serial_only)return;
 stop_worker=false;structure_worker=std::thread([this](){for(;;){std::unique_lock<std::mutex>lock(structure_mutex);structure_ready.wait(lock,[this](){return stop_worker||work_generation>completed_generation;});if(stop_worker)return;const auto generation=work_generation;lock.unlock();process_vertex_work(1);lock.lock();completed_generation=generation;lock.unlock();structure_done.notify_one();}});
}
SelectedStructuralFaceKernel::~SelectedStructuralFaceKernel(){
 {std::lock_guard<std::mutex>lock(structure_mutex);stop_worker=true;}structure_ready.notify_one();if(structure_worker.joinable())structure_worker.join();
}
void SelectedStructuralFaceKernel::process_vertex_work(int lane){
 depth_worker_lane=lane;
 for(;;){const size_t index=work_cursor.fetch_add(1,std::memory_order_relaxed);if(index>=vertex_work.size())break;auto&job=vertex_work[index];const auto&mesh=*job.mesh;
  for(int i=job.begin;i<job.end;++i){const auto&canonical=mesh.vertices[size_t(i)];if(!job.first&&(mesh.dependencies[size_t(i)]&job.changes)==0)continue;const auto value=sample(canonical,vertex_state);const double z=apply_depth(canonical,vertex_state,value);if(!std::isfinite(value.x)||!std::isfinite(value.y)||!std::isfinite(z)){job.ok=false;break;}put_float(job.positions,int64_t(i)*12,value.x);put_float(job.positions,int64_t(i)*12+4,value.y);put_float(job.positions,int64_t(i)*12+8,z);if(value.uv&&job.uv){put_float(job.uv,int64_t(i)*8,value.u);put_float(job.uv,int64_t(i)*8+4,value.v);}if(value.color&&job.color)for(int n=0;n<4;++n)put_float(job.color,int64_t(i)*16+n*4,value.rgba[size_t(n)]);}
 }
}
bool SelectedStructuralFaceKernel::update_structure_buffers(const State&s,std::vector<uint8_t>&changed){
 vertex_work.clear();vertex_state=s;changed.clear();changed.reserve(meshes.size());
 for(auto&mesh:meshes){const bool first=!mesh.state_ready||mesh.config_generation!=geometry_generation;const auto changes=first?uint8_t(63):state_changes(mesh.last_state,s);const bool update=first||(changes&mesh.dependencies_mask)!=0;changed.push_back(update?1:0);if(!update)continue;
  // All Godot copy-on-write pointers are acquired on the calling thread.
  uint8_t*p=mesh.positions.ptrw();uint8_t*uv=mesh.has_uv?mesh.uvs.ptrw():nullptr;uint8_t*color=mesh.has_color?mesh.colors.ptrw():nullptr;
  for(int begin=0;begin<mesh.count;begin+=256)vertex_work.push_back({&mesh,p,uv,color,begin,std::min(mesh.count,begin+256),changes,first,true});
 }
 work_cursor.store(0,std::memory_order_relaxed);
 if(!vertex_work.empty()){
  if(serial_only)process_vertex_work(0);
  else{start_structure_worker();{std::lock_guard<std::mutex>lock(structure_mutex);++work_generation;}structure_ready.notify_one();process_vertex_work(0);std::unique_lock<std::mutex>lock(structure_mutex);structure_done.wait(lock,[this](){return completed_generation==work_generation;});}
 }
 for(const auto&job:vertex_work)if(!job.ok){for(auto&mesh:meshes)mesh.state_ready=false;return false;}
 for(auto&mesh:meshes){mesh.last_state=s;mesh.state_ready=true;mesh.config_generation=geometry_generation;}return true;
}
}
