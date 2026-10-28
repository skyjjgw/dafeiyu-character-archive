#pragma once
#include <array>
#include <vector>
#include <string>
#include <cmath>
#include <cstdint>
namespace cloth {
struct V {double x=0,y=0,z=0; V operator+(V b)const{return{x+b.x,y+b.y,z+b.z};} V operator-(V b)const{return{x-b.x,y-b.y,z-b.z};} V operator*(double s)const{return{x*s,y*s,z*s};} V& operator+=(V b){x+=b.x;y+=b.y;z+=b.z;return *this;} double dot(V b)const{return x*b.x+y*b.y+z*b.z;} V cross(V b)const{return{y*b.z-z*b.y,z*b.x-x*b.z,x*b.y-y*b.x};} double norm()const{return std::sqrt(dot(*this));} bool finite()const{return std::isfinite(x)&&std::isfinite(y)&&std::isfinite(z);} };
using Tri=std::array<int,3>;
struct Material {double density=.3, young2d=200, poisson=.3, bending=.002;}; // kg/m², N/m, dimensionless, N*m
struct Config {double thickness=.002, max_step=1./240, drag=1.; int iterations=8,max_substeps=128; bool contacts=true,reverse=false; V gravity={0,-9.81,0};};
struct Capsule {V a,b; double radius;}; // kinematic, world m; no feedback impulse
struct Diagnostics {bool ok=true;std::string error;int substeps=0,vf=0,ee=0,rigid=0,crossings=0; double mass=0,energy=0,kinetic=0,elastic=0,max_speed=0,max_strain=0,min_gap=1e30,ms=0;};
struct Closest {std::array<double,4>b{}; V diff;};
Closest point_triangle(V p,V a,V b,V c);
Closest edge_edge(V a,V b,V c,V d);
double wrap(double a);
bool dihedral(const std::array<V,4>&x,double&angle,std::array<V,4>&g);
class Solver {
public:
 Config config; std::vector<V> x,v,rest;std::vector<Tri> triangles; std::vector<int> layers,pins;
 std::vector<double> mass,w; Diagnostics diag;
 bool configure(const std::vector<V>&points,const std::vector<Tri>&faces,const std::vector<int>&point_layers,const std::vector<int>&pin_ids,const std::vector<Material>&materials);
 bool step(double dt,const std::vector<V>&pin_targets,const std::vector<Capsule>&capsules={});
 void measure();
 double gradient_test();
private:
 struct Membrane{Tri ids;double area,inv00,inv01,inv11;std::array<double,3> k,lambda{};};
 struct Hinge{std::array<int,4>ids;double rest_angle,k,lambda=0;};
 struct Edge{int a,b;};
 struct Contact{std::array<int,4>ids;std::array<double,4>b;V n;double lambda=0;int kind;};
 std::vector<Membrane> membranes;std::vector<Hinge>hinges;std::vector<Edge>edges;std::vector<std::vector<int>>neighbors;
 std::vector<V> previous; std::vector<Contact>contacts;
 bool adjacent(int a,int b)const;
 void membrane_value(const Membrane&m,int mode,double&C,std::array<V,3>&g)const;
 void material_pass(double h);
 void contact_pass(const std::vector<Capsule>&capsules);
 void build_contacts();
 bool fail(const char*s){diag.ok=false;diag.error=s;return false;}
};
}
