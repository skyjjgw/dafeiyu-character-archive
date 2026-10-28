#pragma once
#include <godot_cpp/classes/ref_counted.hpp>
#include <godot_cpp/variant/dictionary.hpp>
#include <godot_cpp/variant/packed_int32_array.hpp>
#include <godot_cpp/variant/packed_vector3_array.hpp>
#include <godot_cpp/variant/packed_float64_array.hpp>
#include <array>
#include <vector>

namespace godot {
class SelectedImplicitClothBending : public RefCounted {
  GDCLASS(SelectedImplicitClothBending, RefCounted)
  struct V {
    double x=0,y=0,z=0;
    V()=default; V(double a,double b,double c):x(a),y(b),z(c){}
    explicit V(const Vector3 &a):x(a.x),y(a.y),z(a.z){}
    V operator+(const V&b)const{return {x+b.x,y+b.y,z+b.z};}
    V operator-(const V&b)const{return {x-b.x,y-b.y,z-b.z};}
    V operator*(double a)const{return {x*a,y*a,z*a};}
    V &operator+=(const V&b){x+=b.x;y+=b.y;z+=b.z;return *this;}
    double dot(const V&b)const{return x*b.x+y*b.y+z*b.z;}
    V cross(const V&b)const{return {y*b.z-z*b.y,z*b.x-x*b.z,x*b.y-y*b.x};}
    double length()const;
    bool finite()const;
    Vector3 vector()const;
  };
  struct Hinge {std::array<int32_t,4> ids;double angle;};
  struct Geometry {double angle;std::array<V,4> g;};
  struct Active {std::array<V,4> b;std::array<V,4> g;double C,rate;};
  std::vector<Hinge> hinges;
  std::vector<Active> active;
  std::vector<double> inv_mass,sqrt_inv_mass,diagonal;
  std::vector<V> points,velocities,rhs,solution,residual,z,direction,product;
  double stiffness=0,damping=0,tolerance=1e-8;
  int max_iterations=160,boundary_edges=0,triangle_count=0;
  bool configured=false;
  static bool geometry(const V&,const V&,const V&,const V&,Geometry&);
  static double wrap(double);
  static double dot(const std::vector<V>&,const std::vector<V>&);
  void multiply(const std::vector<V>&,std::vector<V>&,double)const;
  Dictionary fail(const char*)const;
protected:
  static void _bind_methods();
public:
  Dictionary configure(const PackedVector3Array&,const PackedInt32Array&,const PackedFloat64Array&,double,double,int=160,double=1e-8);
  Dictionary step(const PackedVector3Array&,const PackedVector3Array&,double);
  Dictionary inspect_geometry(const PackedVector3Array&)const;
  Dictionary get_metadata()const;
};
}
