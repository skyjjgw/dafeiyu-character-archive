#include "cloth_bending.hpp"
#include <godot_cpp/core/class_db.hpp>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <limits>
#include <unordered_map>

namespace godot {
namespace {constexpr double PI_D=3.1415926535897932384626433832795;constexpr double TAU_D=2*PI_D;}
double NativeClothBending::DVec::length()const{return std::sqrt(dot(*this));}
bool NativeClothBending::DVec::finite()const{return std::isfinite(x)&&std::isfinite(y)&&std::isfinite(z);}
bool NativeClothBending::geometry(const DVec&a,const DVec&b,const DVec&c,const DVec&d,Geometry&out){
  const DVec e=b-a;const double len=e.length();
  DVec nc=e.cross(c-a),nd=e.cross(d-a)*-1.;
  const double ac=nc.length(),ad=nd.length();
  if(std::min(len,std::min(ac,ad))<1e-7)return false;
  nc=nc*(1/ac);nd=nd*(1/ad);
  out.angle=std::atan2((e*(1/len)).dot(nc.cross(nd)),nc.dot(nd));
  const DVec gc=nc*(-len/ac),gd=nd*(-len/ad);
  const double tc=(c-a).dot(e)/(len*len),td=(d-a).dot(e)/(len*len);
  out.gradient={gc*-(1-tc)+gd*-(1-td),gc*-tc+gd*-td,gc,gd};
  return std::isfinite(out.angle)&&out.gradient[0].finite()&&out.gradient[1].finite()&&gc.finite()&&gd.finite();
}
double NativeClothBending::wrap_angle(double a){double value=std::fmod(a+PI_D,TAU_D);if(value<0)value+=TAU_D;return value-PI_D;}
void NativeClothBending::_bind_methods(){
  ClassDB::bind_method(D_METHOD("configure","rest","triangle_indices","stiffness","damping","moment_limit"),&NativeClothBending::configure,DEFVAL(.0006),DEFVAL(.000025),DEFVAL(.0015));
  ClassDB::bind_method(D_METHOD("evaluate","positions","sample_dt"),&NativeClothBending::evaluate);
  ClassDB::bind_method(D_METHOD("reset_history"),&NativeClothBending::reset_history);
  ClassDB::bind_method(D_METHOD("get_metadata"),&NativeClothBending::get_metadata);
}
Dictionary NativeClothBending::failure(const char *message)const{
  Dictionary r;r["ok"]=false;r["error"]=String(message);r["hinge_count"]=static_cast<int64_t>(hinges.size());r["forces"]=PackedVector3Array();r["energy"]=0.;r["max_force"]=0.;return r;
}
Dictionary NativeClothBending::configure(const PackedVector3Array &rest,const PackedInt32Array &indices,double k,double c,double limit){
  configured=false;has_previous=false;hinges.clear();points.clear();previous.clear();forces_d.clear();point_count=0;triangle_count=0;boundary_edges=0;degenerate_hinges=0;
  if(rest.size()<4||rest.size()>1000000||indices.size()<3||indices.size()%3!=0||indices.size()>12000000)return failure("invalid_mesh_size");
  if(!std::isfinite(k)||!std::isfinite(c)||!std::isfinite(limit)||k<0||c<0||limit<=0)return failure("invalid_material_parameters");
  const auto *vertices=rest.ptr();const auto *tri=indices.ptr();
  for(int64_t i=0;i<rest.size();++i)if(!DVec(vertices[i]).finite())return failure("nonfinite_rest_position");
  struct Edge {int32_t a,b,c;int orientation,count=1;int32_t d=-1;};
  std::unordered_map<uint64_t,Edge> edges;edges.reserve(static_cast<size_t>(indices.size()));
  for(int64_t at=0;at<indices.size();at+=3){
    const int32_t ids[3]={tri[at],tri[at+1],tri[at+2]};
    for(int j=0;j<3;++j)if(ids[j]<0||ids[j]>=rest.size())return failure("index_out_of_bounds");
    if(ids[0]==ids[1]||ids[1]==ids[2]||ids[2]==ids[0])return failure("repeated_triangle_vertex");
    for(int j=0;j<3;++j){
      const int32_t first=ids[j],second=ids[(j+1)%3],opposite=ids[(j+2)%3];const int32_t a=std::min(first,second),b=std::max(first,second);const int direction=first<second?1:-1;
      const uint64_t key=(uint64_t(uint32_t(a))<<32)|uint32_t(b);
      auto found=edges.find(key);
      if(found==edges.end())edges.emplace(key,Edge{a,b,opposite,direction,1,-1});
      else {auto &edge=found->second;if(++edge.count>2)return failure("nonmanifold_edge");if(edge.orientation==direction)return failure("inconsistent_triangle_winding");edge.d=opposite;}
    }
  }
  // Sort actual edge keys for deterministic force summation and parity tests.
  std::vector<uint64_t> keys;keys.reserve(edges.size());for(const auto &item:edges)keys.push_back(item.first);std::sort(keys.begin(),keys.end());
  for(uint64_t key:keys){const auto &edge=edges.at(key);if(edge.count==1){++boundary_edges;continue;}Geometry g;
    if(geometry(DVec(vertices[edge.a]),DVec(vertices[edge.b]),DVec(vertices[edge.c]),DVec(vertices[edge.d]),g))hinges.push_back({{edge.a,edge.b,edge.c,edge.d},g.angle});else ++degenerate_hinges;
  }
  if(hinges.empty())return failure("no_valid_material_hinges");
  point_count=static_cast<int32_t>(rest.size());triangle_count=static_cast<int32_t>(indices.size()/3);stiffness=k;damping=c;moment_limit=limit;
  points.resize(point_count);previous.resize(point_count);forces_d.resize(point_count);configured=true;
  Dictionary r=get_metadata();r["ok"]=true;return r;
}
Dictionary NativeClothBending::evaluate(const PackedVector3Array &positions,double dt){
  if(!configured)return failure("not_configured");
  if(positions.size()!=point_count)return failure("position_count_mismatch");
  if(!std::isfinite(dt)||dt<=0)return failure("invalid_sample_dt");
  const auto *input=positions.ptr();
  for(int i=0;i<point_count;++i){points[i]=DVec(input[i]);if(!points[i].finite())return failure("nonfinite_position");forces_d[i]=DVec();}
  double energy=0,max_hinge_force=0,max_nodal_force=0;int skipped=0;
  for(const auto &h:hinges){Geometry g;if(!geometry(points[h.ids[0]],points[h.ids[1]],points[h.ids[2]],points[h.ids[3]],g)){++skipped;continue;}
    const double angle=wrap_angle(g.angle-h.rest_angle);double rate=0;
    if(has_previous)for(int j=0;j<4;++j)rate+=g.gradient[j].dot((points[h.ids[j]]-previous[h.ids[j]])*(1/dt));
    const double moment=std::clamp(stiffness*angle+damping*rate,-moment_limit,moment_limit);
    for(int j=0;j<4;++j){const DVec force=g.gradient[j]*-moment;forces_d[h.ids[j]]+=force;max_hinge_force=std::max(max_hinge_force,force.length());}
    energy+=.5*stiffness*angle*angle;
  }
  if(!std::isfinite(energy)||!std::isfinite(max_hinge_force))return failure("nonfinite_material_result");
  const auto fits_boundary=[](const DVec &v){const double maximum=std::numeric_limits<real_t>::max();return v.finite()&&std::abs(v.x)<=maximum&&std::abs(v.y)<=maximum&&std::abs(v.z)<=maximum;};
  PackedVector3Array output;output.resize(point_count);auto *dst=output.ptrw();DVec net,torque;
  for(int i=0;i<point_count;++i){if(!fits_boundary(forces_d[i]))return failure("force_outside_boundary_precision");dst[i]=forces_d[i].to_vector();max_nodal_force=std::max(max_nodal_force,forces_d[i].length());net+=forces_d[i];torque+=points[i].cross(forces_d[i]);}
  if(!std::isfinite(max_nodal_force)||!fits_boundary(net)||!fits_boundary(torque))return failure("diagnostic_outside_boundary_precision");
  previous=points;has_previous=true;
  Dictionary r;r["ok"]=true;r["forces"]=output;r["energy"]=energy;r["max_force"]=max_hinge_force;r["max_nodal_force"]=max_nodal_force;r["hinge_count"]=static_cast<int64_t>(hinges.size());r["skipped_degenerate_hinges"]=skipped;r["net_force_double"]=net.to_vector();r["net_torque_double"]=torque.to_vector();return r;
}
void NativeClothBending::reset_history(){has_previous=false;}
Dictionary NativeClothBending::get_metadata()const{
  Dictionary r;r["configured"]=configured;r["vertices"]=point_count;r["triangles"]=triangle_count;r["hinge_count"]=static_cast<int64_t>(hinges.size());r["boundary_edges"]=boundary_edges;r["rest_degenerate_hinges"]=degenerate_hinges;r["stiffness"]=stiffness;r["damping"]=damping;r["moment_limit"]=moment_limit;r["internal_precision"]="double";r["boundary_precision"]="Godot official single Vector3";r["topology"]="Every actual shared interior triangle edge; no grid shortcuts or hole bridging";r["integration"]="Forces only; caller/Jolt owns positions and integration";r["max_force_semantics"]="Largest individual hinge contribution, matching reference; max_nodal_force is accumulated point maximum";r["energy_semantics"]="Uncapped quadratic elastic diagnostic, matching reference; total moment is capped";r["first_sample_damping"]="Zero velocity until two samples, avoids treating model rest/world placement as motion";return r;
}
}
