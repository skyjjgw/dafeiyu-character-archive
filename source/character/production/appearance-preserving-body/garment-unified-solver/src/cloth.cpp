#include "cloth.hpp"
#include <algorithm>
#include <map>
#include <unordered_map>
#include <set>
#include <chrono>
#include <limits>
namespace cloth {
static double clamp01(double s){return std::max(0.,std::min(1.,s));}
double wrap(double a){constexpr double pi=3.14159265358979323846;double r=std::fmod(a+pi,2*pi);if(r<0)r+=2*pi;return r-pi;}
// Closest point and mass-weighted four-vertex distance projection adapted from
// PositionBasedDynamics contributors (MIT); pinned source in vendor/pbd.
// Boundary candidates are all compared, fixing the upstream single-edge clamp
// for obtuse corner cases. Degenerate triangles fall back to segment distance.
Closest point_triangle(V p,V a,V b,V c){
 Closest out;out.b={1,0,0,0};out.diff=p-a;double best=out.diff.dot(out.diff);
 V e=b-a,f=c-a,q=p-a;double ee=e.dot(e),ef=e.dot(f),ff=f.dot(f),det=ee*ff-ef*ef;
 if(det>1e-28){double u=(q.dot(e)*ff-q.dot(f)*ef)/det,t=(q.dot(f)*ee-q.dot(e)*ef)/det;
  if(u>=0&&t>=0&&u+t<=1){out.b={1,-(1-u-t),-u,-t};out.diff=q-e*u-f*t;return out;}}
 const V verts[3]={a,b,c};for(int i=0;i<3;++i){int j=(i+1)%3;V d=verts[j]-verts[i];double dd=d.dot(d),t=dd>1e-28?clamp01((p-verts[i]).dot(d)/dd):0;V delta=p-(verts[i]+d*t);double d2=delta.dot(delta);if(d2<=best){best=d2;out.diff=delta;out.b={1,0,0,0};out.b[i+1]=-(1-t);out.b[j+1]=-t;}}
 return out;
}
Closest edge_edge(V a,V b,V c,V d){
 // Unconstrained line minimum plus all four segment-boundary minima, including
 // parallel/zero-length edges. Unlike independently clipping s/t, this is the
 // exact Euclidean segment minimum. Uses PBD barycentric distance gradients.
 V e=b-a,f=d-c,q=a-c;double ee=e.dot(e),ff=f.dot(f),ef=e.dot(f),det=ee*ff-ef*ef;
 double best=std::numeric_limits<double>::infinity();Closest out;
 auto take=[&](double s,double t){V v=q+e*s-f*t;double d2=v.dot(v);if(d2<best){best=d2;out.b={1-s,s,-(1-t),-t};out.diff=v;}};
 if(det>1e-24){double s=(ef*q.dot(f)-ff*q.dot(e))/det,t=(ee*q.dot(f)-ef*q.dot(e))/det;if(s>=0&&s<=1&&t>=0&&t<=1)take(s,t);}
 take(0,ff>1e-28?clamp01(q.dot(f)/ff):0);take(1,ff>1e-28?clamp01((q+e).dot(f)/ff):0);
 take(ee>1e-28?clamp01(-q.dot(e)/ee):0,0);take(ee>1e-28?clamp01((f-q).dot(e)/ee):0,1);return out;
}
bool dihedral(const std::array<V,4>&x,double&angle,std::array<V,4>&g){
 V e=x[1]-x[0];double l=e.norm();V n=e.cross(x[2]-x[0]),m=e.cross(x[3]-x[0])*-1.;double na=n.norm(),ma=m.norm();
 if(l<1e-12||na<1e-16||ma<1e-16)return false;n=n*(1/na);m=m*(1/ma);angle=std::atan2((e*(1/l)).dot(n.cross(m)),n.dot(m));
 V gc=n*(-l/na),gd=m*(-l/ma);double tc=(x[2]-x[0]).dot(e)/(l*l),td=(x[3]-x[0]).dot(e)/(l*l);
 g={gc*-(1-tc)+gd*-(1-td),gc*-tc+gd*-td,gc,gd};return std::isfinite(angle);
}
bool Solver::configure(const std::vector<V>&points,const std::vector<Tri>&faces,const std::vector<int>&point_layers,const std::vector<int>&pin_ids,const std::vector<Material>&materials){
 diag={};x=rest=points;triangles=faces;layers=point_layers;pins=pin_ids;v.assign(x.size(),{});mass.assign(x.size(),0);w.assign(x.size(),0);neighbors.assign(x.size(),{});membranes.clear();hinges.clear();edges.clear();
 if(x.empty()||x.size()>4096||layers.size()!=x.size()||triangles.empty())return fail("invalid_size");
 for(size_t i=0;i<x.size();++i)if(!x[i].finite()||layers[i]<0||layers[i]>=int(materials.size()))return fail("invalid_vertex");
 for(auto m:materials)if(!std::isfinite(m.density)||m.density<=0||!std::isfinite(m.young2d)||m.young2d<0||!std::isfinite(m.poisson)||m.poisson<0||m.poisson>=.5||!std::isfinite(m.bending)||m.bending<0)return fail("invalid_material");
 struct E{int a,b,c,d=-1,sign,count=1;double area;};std::map<std::pair<int,int>,E>map;
 for(auto t:triangles){for(int i:t)if(i<0||i>=int(x.size()))return fail("bad_index");if(layers[t[0]]!=layers[t[1]]||layers[t[0]]!=layers[t[2]])return fail("mixed_layer_triangle");
  V e=x[t[1]]-x[t[0]],f=x[t[2]]-x[t[0]];double l=e.norm(),twice=e.cross(f).norm();if(l<1e-10||twice<1e-14)return fail("degenerate_rest");
  double px=e.dot(f)/l,py=twice/l,A=twice*.5;auto mat=materials[layers[t[0]]];double mu=mat.young2d/(2*(1+mat.poisson)),lambda=mat.young2d*mat.poisson/(1-mat.poisson*mat.poisson);
  membranes.push_back({t,A,1/l,-px/(l*py),1/py,{2*A*(lambda+mu),2*A*mu,4*A*mu},{}});for(int i:t)mass[i]+=mat.density*A/3;
  for(int j=0;j<3;++j){int a=t[j],b=t[(j+1)%3],c=t[(j+2)%3],sgn=a<b?1:-1;if(a>b)std::swap(a,b);auto key=std::make_pair(a,b);auto it=map.find(key);if(it==map.end())map.emplace(key,E{a,b,c,-1,sgn,1,A});else{if(++it->second.count>2||it->second.sign==sgn)return fail("nonmanifold_or_winding");it->second.d=c;it->second.area+=A;}}
 }
 for(auto&kv:map){auto e=kv.second;edges.push_back({e.a,e.b});neighbors[e.a].push_back(e.b);neighbors[e.b].push_back(e.a);if(e.d<0)continue;std::array<int,4>ids={e.a,e.b,e.c,e.d};std::array<V,4>p={x[e.a],x[e.b],x[e.c],x[e.d]},g;double a;if(!dihedral(p,a,g))return fail("degenerate_hinge");
  // Dual-height shell hinge: distance between adjacent triangle centroids is
  // (h1+h2)/3; integrated curvature energy gives k = 3 D edge²/(2(A1+A2)).
  double l2=(x[e.b]-x[e.a]).dot(x[e.b]-x[e.a]);hinges.push_back({ids,a,materials[layers[e.a]].bending*3*l2/(2*e.area),0});}
 for(size_t i=0;i<x.size();++i){if(mass[i]<=0)return fail("unreferenced_vertex");w[i]=1/mass[i];std::sort(neighbors[i].begin(),neighbors[i].end());}
 std::set<int> unique;for(int p:pins){if(p<0||p>=int(x.size())||!unique.insert(p).second)return fail("invalid_pin");w[p]=0;}previous=x;measure();return true;
}
bool Solver::adjacent(int a,int b)const{return a==b||std::binary_search(neighbors[a].begin(),neighbors[a].end(),b);}
void Solver::membrane_value(const Membrane&m,int mode,double&C,std::array<V,3>&g)const{
 V e=x[m.ids[1]]-x[m.ids[0]],f=x[m.ids[2]]-x[m.ids[0]],F0=e*m.inv00,F1=e*m.inv01+f*m.inv11;
 double ex=.5*(F0.dot(F0)-1),ey=.5*(F1.dot(F1)-1);V d0,d1;constexpr double q=.7071067811865475244;
 if(mode==0){C=(ex+ey)*q;d0=F0*q;d1=F1*q;}else if(mode==1){C=(ex-ey)*q;d0=F0*q;d1=F1*-q;}else{C=.5*F0.dot(F1);d0=F1*.5;d1=F0*.5;}
 g[1]=d0*m.inv00+d1*m.inv01;g[2]=d1*m.inv11;g[0]=(g[1]+g[2])*-1.;
}
void Solver::material_pass(double h){
 // XPBD.cpp multiplier update: Δlambda=-(C+alpha*lambda)/(sum(w|grad|²)+alpha).
 // SI compliance alpha=1/(k*h²); multipliers reset per integration substep.
 auto solve=[&](auto&ids,auto&g,double C,double k,double&lambda){if(k<=0)return;double alpha=1/(k*h*h),denom=alpha;for(size_t j=0;j<ids.size();++j)denom+=w[ids[j]]*g[j].dot(g[j]);double dl=-(C+alpha*lambda)/denom;lambda+=dl;for(size_t j=0;j<ids.size();++j)x[ids[j]]+=g[j]*(w[ids[j]]*dl);};
 for(size_t at=0;at<membranes.size();++at){auto&m=membranes[config.reverse?membranes.size()-1-at:at];for(int mode=0;mode<3;++mode){double C;std::array<V,3>g;membrane_value(m,mode,C,g);solve(m.ids,g,C,m.k[mode],m.lambda[mode]);}}
 for(size_t at=0;at<hinges.size();++at){auto&b=hinges[config.reverse?hinges.size()-1-at:at];std::array<V,4>p,g;for(int j=0;j<4;++j)p[j]=x[b.ids[j]];double a;if(dihedral(p,a,g))solve(b.ids,g,wrap(a-b.rest_angle),b.k,b.lambda);}
}
struct Box{V lo={1e100,1e100,1e100},hi={-1e100,-1e100,-1e100};void add(V p){lo={std::min(lo.x,p.x),std::min(lo.y,p.y),std::min(lo.z,p.z)};hi={std::max(hi.x,p.x),std::max(hi.y,p.y),std::max(hi.z,p.z)};}void pad(double d){lo=lo-V{d,d,d};hi+=V{d,d,d};}bool overlap(const Box&b)const{return lo.x<=b.hi.x&&hi.x>=b.lo.x&&lo.y<=b.hi.y&&hi.y>=b.lo.y&&lo.z<=b.hi.z&&hi.z>=b.lo.z;}};
void Solver::build_contacts(){
 contacts.clear();double margin=config.thickness;std::vector<Box>tb(triangles.size()),eb(edges.size());
 for(size_t t=0;t<triangles.size();++t){for(int j:triangles[t]){tb[t].add(x[j]);tb[t].add(previous[j]);}tb[t].pad(margin);}
 for(size_t i=0;i<edges.size();++i){auto e=edges[i];eb[i].add(x[e.a]);eb[i].add(x[e.b]);eb[i].add(previous[e.a]);eb[i].add(previous[e.b]);eb[i].pad(margin);}
 // Sweep-and-prune reduces candidate tests without a spatial-grid cell-size
 // assumption. Swept linear AABBs include material-projected endpoints too.
 std::vector<int>ti(triangles.size()),ei(edges.size());for(size_t i=0;i<ti.size();++i)ti[i]=int(i);for(size_t i=0;i<ei.size();++i)ei[i]=int(i);
 std::sort(ti.begin(),ti.end(),[&](int a,int b){return tb[a].lo.x<tb[b].lo.x;});std::sort(ei.begin(),ei.end(),[&](int a,int b){return eb[a].lo.x<eb[b].lo.x;});
 auto add=[&](std::array<int,4>ids,Closest cur,Closest old,int kind){double d=old.diff.norm();V n;if(d>1e-12)n=old.diff*(1/d);else {double now=cur.diff.norm();if(now<1e-12)return;n=cur.diff*(1/now);}
  double gap=cur.diff.dot(n); // Keep the pre-substep side, even after crossing.
  if(cur.diff.norm()>margin*2&&gap>=0)return;
  // A large lateral slide can turn a nearest-feature normal stale; only retain
  // crossing histories whose start/end nearest points are locally close. This
  // is a declared discrete limitation, not strict continuous collision proof.
  if(gap<0&&d>margin*4)return;
  if(gap<margin)contacts.push_back({ids,cur.b,n,0,kind});};
 for(size_t i=0;i<x.size();++i){Box box;box.add(x[i]);box.add(previous[i]);box.pad(margin);for(int t:ti){if(tb[t].lo.x>box.hi.x)break;if(!box.overlap(tb[t]))continue;auto f=triangles[t];if(adjacent(int(i),f[0])||adjacent(int(i),f[1])||adjacent(int(i),f[2]))continue;
  if(w[i]+w[f[0]]+w[f[1]]+w[f[2]]==0)continue;add({int(i),f[0],f[1],f[2]},point_triangle(x[i],x[f[0]],x[f[1]],x[f[2]]),point_triangle(previous[i],previous[f[0]],previous[f[1]],previous[f[2]]),0);}}
 for(size_t ai=0;ai<ei.size();++ai){int i=ei[ai];auto a=edges[i];for(size_t bj=ai+1;bj<ei.size();++bj){int j=ei[bj];if(eb[j].lo.x>eb[i].hi.x)break;if(!eb[i].overlap(eb[j]))continue;auto b=edges[j];if(adjacent(a.a,b.a)||adjacent(a.a,b.b)||adjacent(a.b,b.a)||adjacent(a.b,b.b))continue;if(w[a.a]+w[a.b]+w[b.a]+w[b.b]==0)continue;
  add({a.a,a.b,b.a,b.b},edge_edge(x[a.a],x[a.b],x[b.a],x[b.b]),edge_edge(previous[a.a],previous[a.b],previous[b.a],previous[b.b]),1);}}
}
void Solver::contact_pass(const std::vector<Capsule>&capsules){
 build_contacts();for(auto&c:contacts){V delta;double den=0;for(int j=0;j<4;++j){delta+=x[c.ids[j]]*c.b[j];den+=w[c.ids[j]]*c.b[j]*c.b[j];}double gap=delta.dot(c.n);if(gap<0)++diag.crossings;if(gap>=config.thickness||den<1e-30)continue;double dl=(config.thickness-gap)/den;for(int j=0;j<4;++j)x[c.ids[j]]+=c.n*(w[c.ids[j]]*c.b[j]*dl);if(c.kind==0)++diag.vf;else ++diag.ee;}
 for(size_t i=0;i<x.size();++i)if(w[i]>0)for(auto c:capsules){V ab=c.b-c.a;double ab2=ab.dot(ab),t=ab2>1e-24?clamp01((x[i]-c.a).dot(ab)/ab2):0;V q=c.a+ab*t,d=x[i]-q;double len=d.norm(),r=c.radius+config.thickness;if(len<r){if(len<1e-12){d=previous[i]-q;len=d.norm();}if(len>1e-12){x[i]+=d*((r-len)/len);++diag.rigid;}}}
}
bool Solver::step(double dt,const std::vector<V>&targets,const std::vector<Capsule>&capsules){
 auto start=std::chrono::steady_clock::now();diag={};if(dt<=0||dt>.1||!std::isfinite(dt)||targets.size()!=pins.size())return fail("invalid_step");
 if(config.thickness<=0||config.max_step<=0||config.iterations<1||config.iterations>64||config.max_substeps<1||config.max_substeps>1024||config.drag<0||!config.gravity.finite())return fail("invalid_config");
 std::vector<V>pin_start;double speed=0;for(auto vel:v){if(!vel.finite())return fail("nonfinite_velocity");speed=std::max(speed,vel.norm());}for(size_t j=0;j<pins.size();++j){if(!targets[j].finite())return fail("nonfinite_pin");pin_start.push_back(x[pins[j]]);speed=std::max(speed,(targets[j]-pin_start[j]).norm()/dt);}
 for(auto c:capsules)if(!c.a.finite()||!c.b.finite()||!std::isfinite(c.radius)||c.radius<=0)return fail("invalid_capsule");
 int count=std::max(int(std::ceil(dt/config.max_step)),int(std::ceil(dt*(speed+config.gravity.norm()*dt)/(.35*config.thickness))));if(count>config.max_substeps)return fail("adaptive_substep_budget_exceeded");diag.substeps=count;double h=dt/count;
 for(int s=0;s<count;++s){previous=x;for(size_t i=0;i<x.size();++i)if(w[i]>0){v[i]=(v[i]+config.gravity*h)*std::exp(-config.drag*h);x[i]+=v[i]*h;}
  for(size_t j=0;j<pins.size();++j)x[pins[j]]=pin_start[j]+(targets[j]-pin_start[j])*(double(s+1)/count);
  for(auto&m:membranes)m.lambda={};for(auto&b:hinges)b.lambda=0;
  for(int it=0;it<config.iterations;++it){material_pass(h);if(config.contacts)contact_pass(capsules);}
  for(size_t i=0;i<x.size();++i){v[i]=(x[i]-previous[i])*(1/h);if(!x[i].finite()||!v[i].finite())return fail("nonfinite_state");}
 }
 measure();diag.ms=std::chrono::duration<double,std::milli>(std::chrono::steady_clock::now()-start).count();return true;
}
void Solver::measure(){
 diag.mass=diag.energy=diag.kinetic=diag.elastic=diag.max_speed=diag.max_strain=0;
 for(size_t i=0;i<x.size();++i){diag.mass+=mass[i];diag.kinetic+=.5*mass[i]*v[i].dot(v[i]);diag.energy-=mass[i]*config.gravity.dot(x[i]);diag.max_speed=std::max(diag.max_speed,v[i].norm());}
 for(auto&m:membranes){for(int mode=0;mode<3;++mode){double C;std::array<V,3>g;membrane_value(m,mode,C,g);diag.elastic+=.5*m.k[mode]*C*C;diag.max_strain=std::max(diag.max_strain,std::abs(C));}}
 for(auto&b:hinges){std::array<V,4>p,g;for(int j=0;j<4;++j)p[j]=x[b.ids[j]];double a;if(dihedral(p,a,g)){double C=wrap(a-b.rest_angle);diag.elastic+=.5*b.k*C*C;}}
 diag.energy+=diag.kinetic+diag.elastic;
}
double Solver::gradient_test(){double err=0,eps=1e-7;for(auto&m:membranes)for(int mode=0;mode<3;++mode){double C;std::array<V,3>g;membrane_value(m,mode,C,g);for(int j=0;j<3;++j)for(int d=0;d<3;++d){double*value=(&x[m.ids[j]].x)+d;double original=*value;*value=original+eps;double a;std::array<V,3>dummy;membrane_value(m,mode,a,dummy);*value=original-eps;double b;membrane_value(m,mode,b,dummy);*value=original;err=std::max(err,std::abs((a-b)/(2*eps)-((&g[j].x)[d])));}}
 for(auto&b:hinges){std::array<V,4>p,g;for(int j=0;j<4;++j)p[j]=x[b.ids[j]];double a;dihedral(p,a,g);for(int j=0;j<4;++j)for(int d=0;d<3;++d){double original=(&p[j].x)[d],ap,am;std::array<V,4>dummy;(&p[j].x)[d]=original+eps;dihedral(p,ap,dummy);(&p[j].x)[d]=original-eps;dihedral(p,am,dummy);(&p[j].x)[d]=original;err=std::max(err,std::abs(wrap(ap-am)/(2*eps)-(&g[j].x)[d]));}}return err;}
}
