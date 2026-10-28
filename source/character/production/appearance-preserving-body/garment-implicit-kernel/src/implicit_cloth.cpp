#include "implicit_cloth.hpp"
#include <godot_cpp/core/class_db.hpp>
#include <algorithm>
#include <cmath>
#include <cstdint>
#include <limits>
#include <unordered_map>

namespace godot {
namespace {constexpr double PI=3.1415926535897932384626433832795;}
double SelectedImplicitClothBending::V::length()const{return std::sqrt(dot(*this));}
bool SelectedImplicitClothBending::V::finite()const{return std::isfinite(x)&&std::isfinite(y)&&std::isfinite(z);}
Vector3 SelectedImplicitClothBending::V::vector()const{return {static_cast<real_t>(x),static_cast<real_t>(y),static_cast<real_t>(z)};}
double SelectedImplicitClothBending::wrap(double a){double v=std::fmod(a+PI,2*PI);if(v<0)v+=2*PI;return v-PI;}
bool SelectedImplicitClothBending::geometry(const V&a,const V&b,const V&c,const V&d,Geometry&out){
  const V e=b-a;const double l=e.length();V n=e.cross(c-a),m=e.cross(d-a)*-1.;
  const double na=n.length(),ma=m.length();
  if(l<1e-10||na<1e-14||ma<1e-14)return false;
  n=n*(1/na);m=m*(1/ma);
  out.angle=std::atan2((e*(1/l)).dot(n.cross(m)),n.dot(m));
  const V gc=n*(-l/na),gd=m*(-l/ma);
  const double tc=(c-a).dot(e)/(l*l),td=(d-a).dot(e)/(l*l);
  out.g={gc*-(1-tc)+gd*-(1-td),gc*-tc+gd*-td,gc,gd};
  return std::isfinite(out.angle)&&out.g[0].finite()&&out.g[1].finite()&&gc.finite()&&gd.finite();
}
double SelectedImplicitClothBending::dot(const std::vector<V>&a,const std::vector<V>&b){double v=0;for(size_t i=0;i<a.size();++i)v+=a[i].dot(b[i]);return v;}
void SelectedImplicitClothBending::_bind_methods(){
  ClassDB::bind_method(D_METHOD("configure","rest_world","triangle_indices","inverse_masses","stiffness","damping","max_iterations","relative_tolerance"),&SelectedImplicitClothBending::configure,DEFVAL(160),DEFVAL(1e-8));
  ClassDB::bind_method(D_METHOD("step","positions_world","velocities_world","dt"),&SelectedImplicitClothBending::step);
  ClassDB::bind_method(D_METHOD("inspect_geometry","positions_world"),&SelectedImplicitClothBending::inspect_geometry);
  ClassDB::bind_method(D_METHOD("get_metadata"),&SelectedImplicitClothBending::get_metadata);
}
Dictionary SelectedImplicitClothBending::fail(const char*error)const{Dictionary r;r["ok"]=false;r["error"]=String(error);r["impulses"]=PackedVector3Array();return r;}
Dictionary SelectedImplicitClothBending::configure(const PackedVector3Array&rest,const PackedInt32Array&indices,const PackedFloat64Array&mass,double k,double c,int iterations,double tol){
  configured=false;hinges.clear();active.clear();inv_mass.clear();boundary_edges=0;
  if(rest.size()<4||rest.size()>100000||mass.size()!=rest.size()||indices.size()%3||indices.size()<6)return fail("invalid_array_size");
  if(!std::isfinite(k)||!std::isfinite(c)||k<0||c<0||iterations<1||iterations>4096||!std::isfinite(tol)||tol<1e-12||tol>1e-3)return fail("invalid_solver_parameters");
  const auto *vertices=rest.ptr();const auto *tri=indices.ptr();const auto *im=mass.ptr();
  inv_mass.resize(rest.size());sqrt_inv_mass.resize(rest.size());
  for(int64_t i=0;i<rest.size();++i){if(!V(vertices[i]).finite()||!std::isfinite(im[i])||im[i]<0)return fail("invalid_rest_or_inverse_mass");inv_mass[i]=im[i];sqrt_inv_mass[i]=std::sqrt(im[i]);}
  struct Edge {int32_t a,b,c,d=-1;int orientation,count=1;};
  std::unordered_map<uint64_t,Edge> edges;edges.reserve(indices.size());
  for(int64_t at=0;at<indices.size();at+=3){
    const int32_t ids[3]={tri[at],tri[at+1],tri[at+2]};
    for(int j=0;j<3;++j)if(ids[j]<0||ids[j]>=rest.size())return fail("index_out_of_bounds");
    if(ids[0]==ids[1]||ids[1]==ids[2]||ids[2]==ids[0])return fail("repeated_triangle_vertex");
    for(int j=0;j<3;++j){const int32_t first=ids[j],second=ids[(j+1)%3],opposite=ids[(j+2)%3];const int32_t a=std::min(first,second),b=std::max(first,second);const int sign=first<second?1:-1;const uint64_t key=(uint64_t(uint32_t(a))<<32)|uint32_t(b);auto found=edges.find(key);
      if(found==edges.end())edges.emplace(key,Edge{a,b,opposite,-1,sign,1});
      else {auto &e=found->second;if(++e.count>2)return fail("nonmanifold_edge");if(e.orientation==sign)return fail("inconsistent_winding");e.d=opposite;}
    }
  }
  std::vector<uint64_t> keys;keys.reserve(edges.size());for(const auto&e:edges)keys.push_back(e.first);std::sort(keys.begin(),keys.end());
  for(auto key:keys){const auto&e=edges.at(key);if(e.count==1){++boundary_edges;continue;}Geometry g;if(!geometry(V(vertices[e.a]),V(vertices[e.b]),V(vertices[e.c]),V(vertices[e.d]),g))return fail("degenerate_rest_hinge");hinges.push_back({{e.a,e.b,e.c,e.d},g.angle});}
  if(hinges.empty())return fail("no_hinges");
  const size_t n=rest.size();active.resize(hinges.size());points.resize(n);velocities.resize(n);rhs.resize(n);solution.resize(n);residual.resize(n);z.resize(n);direction.resize(n);product.resize(n);diagonal.resize(n*3);
  stiffness=k;damping=c;max_iterations=iterations;tolerance=tol;triangle_count=static_cast<int>(indices.size()/3);configured=true;
  Dictionary r=get_metadata();r["ok"]=true;return r;
}
void SelectedImplicitClothBending::multiply(const std::vector<V>&input,std::vector<V>&output,double beta)const{
  output=input;
  for(size_t i=0;i<hinges.size();++i){const auto&h=hinges[i];const auto&a=active[i];double v=0;for(int j=0;j<4;++j)v+=a.b[j].dot(input[h.ids[j]]);v*=beta;for(int j=0;j<4;++j)output[h.ids[j]]+=a.b[j]*v;}
}
Dictionary SelectedImplicitClothBending::step(const PackedVector3Array&positions,const PackedVector3Array&velocity,double dt){
  if(!configured)return fail("not_configured");
  if(positions.size()!=static_cast<int64_t>(inv_mass.size())||velocity.size()!=positions.size())return fail("point_count_mismatch");
  if(!std::isfinite(dt)||dt<=0||dt>.1)return fail("invalid_dt");
  const auto *p=positions.ptr();const auto *v=velocity.ptr();const size_t n=inv_mass.size();
  for(size_t i=0;i<n;++i){points[i]=V(p[i]);velocities[i]=V(v[i]);if(!points[i].finite()||!velocities[i].finite())return fail("nonfinite_input");rhs[i]=V();solution[i]=V();diagonal[i*3]=diagonal[i*3+1]=diagonal[i*3+2]=1;}
  const double H=damping+dt*stiffness,beta=dt*H;double elastic=0,max_error=0;
  for(size_t i=0;i<hinges.size();++i){const auto&h=hinges[i];auto&a=active[i];Geometry g;if(!geometry(points[h.ids[0]],points[h.ids[1]],points[h.ids[2]],points[h.ids[3]],g))return fail("degenerate_current_hinge");a.C=wrap(g.angle-h.angle);a.g=g.g;a.rate=0;
    for(int j=0;j<4;++j){a.b[j]=a.g[j]*sqrt_inv_mass[h.ids[j]];a.rate+=a.g[j].dot(velocities[h.ids[j]]);}
    const double value=-dt*(stiffness*a.C+H*a.rate);
    for(int j=0;j<4;++j){const size_t id=h.ids[j];const V b=a.b[j];rhs[id]+=b*value;diagonal[id*3]+=beta*b.x*b.x;diagonal[id*3+1]+=beta*b.y*b.y;diagonal[id*3+2]+=beta*b.z*b.z;}
    elastic+=.5*stiffness*a.C*a.C;max_error=std::max(max_error,std::abs(a.C));
  }
  residual=rhs;
  for(size_t i=0;i<n;++i){z[i]={residual[i].x/diagonal[i*3],residual[i].y/diagonal[i*3+1],residual[i].z/diagonal[i*3+2]};direction[i]=z[i];}
  const double rhs_norm=std::sqrt(dot(rhs,rhs));double rz=dot(residual,z),relative=rhs_norm>0?1:0;int iterations=0;
  while(relative>tolerance&&iterations<max_iterations){
    multiply(direction,product,beta);const double denom=dot(direction,product);
    if(!std::isfinite(denom)||denom<=0||!std::isfinite(rz)||rz<0)return fail("nonpositive_or_nonfinite_spd_product");
    const double alpha=rz/denom;
    for(size_t i=0;i<n;++i){solution[i]+=direction[i]*alpha;residual[i]+=product[i]*-alpha;}
    ++iterations;relative=std::sqrt(dot(residual,residual))/rhs_norm;
    if(relative<=tolerance)break;
    for(size_t i=0;i<n;++i)z[i]={residual[i].x/diagonal[i*3],residual[i].y/diagonal[i*3+1],residual[i].z/diagonal[i*3+2]};
    const double next=dot(residual,z),scale=next/rz;for(size_t i=0;i<n;++i)direction[i]=z[i]+direction[i]*scale;rz=next;
  }
  // Recompute the true residual. Recursive CG residual alone is not acceptance.
  multiply(solution,product,beta);double norm2=0;for(size_t i=0;i<n;++i){residual[i]=rhs[i]-product[i];norm2+=residual[i].dot(residual[i]);}
  relative=rhs_norm>0?std::sqrt(norm2)/rhs_norm:0;
  if(!std::isfinite(relative)||relative>tolerance*1.01){Dictionary r=fail("cg_did_not_converge");r["iterations"]=iterations;r["relative_residual"]=relative;return r;}
  std::vector<V> internal(n);double linear_elastic=0,damping_loss=0,implicit_loss=0,pin_work=0;V net,torque;
  double kinetic_before=0,kinetic_after=0,max_dv=0,max_impulse=0;
  for(size_t i=0;i<n;++i){const V dv=solution[i]*sqrt_inv_mass[i];max_dv=std::max(max_dv,dv.length());if(inv_mass[i]>0){kinetic_before+=.5*velocities[i].dot(velocities[i])/inv_mass[i];const V next=velocities[i]+dv;kinetic_after+=.5*next.dot(next)/inv_mass[i];implicit_loss+=.5*solution[i].dot(solution[i]);}}
  for(size_t i=0;i<hinges.size();++i){const auto&h=hinges[i];const auto&a=active[i];double rate=a.rate;for(int j=0;j<4;++j)rate+=a.b[j].dot(solution[h.ids[j]]);const double angle=a.C+dt*rate;const double impulse=-dt*(stiffness*angle+damping*rate);
    for(int j=0;j<4;++j)internal[h.ids[j]]+=a.g[j]*impulse;
    linear_elastic+=.5*stiffness*angle*angle;damping_loss+=dt*damping*rate*rate;implicit_loss+=.5*dt*dt*stiffness*rate*rate;
  }
  PackedVector3Array impulses,reactions;impulses.resize(n);reactions.resize(n);auto *out=impulses.ptrw();auto *react=reactions.ptrw();
  for(size_t i=0;i<n;++i){const V value=inv_mass[i]>0?solution[i]*(1/sqrt_inv_mass[i]):V();if(!value.finite()||!internal[i].finite())return fail("nonfinite_impulse");out[i]=value.vector();react[i]=inv_mass[i]==0?internal[i].vector():Vector3();if(inv_mass[i]==0)pin_work-=velocities[i].dot(internal[i]);net+=internal[i];torque+=points[i].cross(internal[i]);max_impulse=std::max(max_impulse,value.length());}
  const double balance=(kinetic_after+linear_elastic)-(kinetic_before+elastic)-pin_work+damping_loss+implicit_loss;
  Dictionary r;r["ok"]=true;r["impulses"]=impulses;r["reaction_impulses"]=reactions;r["energy_j"]=elastic;r["linearized_elastic_after_j"]=linear_elastic;r["kinetic_before_j"]=kinetic_before;r["kinetic_after_j"]=kinetic_after;r["damping_loss_j"]=damping_loss;r["implicit_loss_j"]=implicit_loss;r["pin_work_j"]=pin_work;r["linear_energy_balance_error_j"]=balance;r["relative_residual"]=relative;r["iterations"]=iterations;r["max_delta_velocity_mps"]=max_dv;r["max_impulse_ns"]=max_impulse;r["max_angle_error_rad"]=max_error;r["internal_net_impulse_ns"]=net.vector();r["internal_net_angular_impulse_nms"]=torque.vector();return r;
}
Dictionary SelectedImplicitClothBending::inspect_geometry(const PackedVector3Array&positions)const{
  if(!configured||positions.size()!=static_cast<int64_t>(inv_mass.size()))return fail("invalid_geometry_request");
  PackedInt32Array ids;PackedFloat64Array angles,rest,gradients;ids.resize(hinges.size()*4);angles.resize(hinges.size());rest.resize(hinges.size());gradients.resize(hinges.size()*12);
  auto *ii=ids.ptrw();auto *aa=angles.ptrw();auto *rr=rest.ptrw();auto *gg=gradients.ptrw();const auto *pp=positions.ptr();
  for(size_t i=0;i<hinges.size();++i){const auto&h=hinges[i];Geometry g;if(!geometry(V(pp[h.ids[0]]),V(pp[h.ids[1]]),V(pp[h.ids[2]]),V(pp[h.ids[3]]),g))return fail("degenerate_inspection_hinge");aa[i]=g.angle;rr[i]=h.angle;for(int j=0;j<4;++j){ii[i*4+j]=h.ids[j];gg[i*12+j*3]=g.g[j].x;gg[i*12+j*3+1]=g.g[j].y;gg[i*12+j*3+2]=g.g[j].z;}}
  Dictionary r;r["ok"]=true;r["ids"]=ids;r["angles"]=angles;r["rest_angles"]=rest;r["gradients"]=gradients;return r;
}
Dictionary SelectedImplicitClothBending::get_metadata()const{
  Dictionary r;r["configured"]=configured;r["vertices"]=static_cast<int64_t>(inv_mass.size());r["triangles"]=triangle_count;r["hinges"]=static_cast<int64_t>(hinges.size());r["boundary_edges"]=boundary_edges;r["stiffness_j_per_rad2"]=stiffness;r["damping_js_per_rad2"]=damping;r["max_iterations"]=max_iterations;r["relative_tolerance"]=tolerance;r["internal_precision"]="double";r["input_output_precision"]="Official Godot single Vector3";r["solver"]="Mass-scaled matrix-free PCG, frozen-gradient Gauss-Newton backward Euler";r["output_units"]="Impulse N*s; dt already integrated once; do not multiply dt again";r["position_writes"]=false;r["force_or_impulse_caps"]=false;r["per_hinge_material_uniform"]=true;r["global_nonlinear_or_jolt_coupling_stability_proof"]=false;return r;
}
}
