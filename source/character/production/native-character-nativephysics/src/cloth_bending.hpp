#pragma once
#include <godot_cpp/classes/ref_counted.hpp>
#include <godot_cpp/variant/dictionary.hpp>
#include <godot_cpp/variant/packed_int32_array.hpp>
#include <godot_cpp/variant/packed_vector3_array.hpp>
#include <vector>
#include <array>

namespace godot {
class NativeClothBending : public RefCounted {
  GDCLASS(NativeClothBending, RefCounted)
  struct DVec {
    double x=0,y=0,z=0;
    DVec()=default;
    DVec(double a,double b,double c):x(a),y(b),z(c){}
    explicit DVec(const Vector3 &v):x(v.x),y(v.y),z(v.z){}
    DVec operator+(const DVec &b)const{return {x+b.x,y+b.y,z+b.z};}
    DVec operator-(const DVec &b)const{return {x-b.x,y-b.y,z-b.z};}
    DVec operator*(double k)const{return {x*k,y*k,z*k};}
    DVec &operator+=(const DVec &b){x+=b.x;y+=b.y;z+=b.z;return *this;}
    double dot(const DVec &b)const{return x*b.x+y*b.y+z*b.z;}
    DVec cross(const DVec &b)const{return {y*b.z-z*b.y,z*b.x-x*b.z,x*b.y-y*b.x};}
    double length()const;
    bool finite()const;
    Vector3 to_vector()const{return Vector3(static_cast<real_t>(x),static_cast<real_t>(y),static_cast<real_t>(z));}
  };
  struct Geometry {double angle=0;std::array<DVec,4> gradient;};
  struct Hinge {std::array<int32_t,4> ids;double rest_angle;};
  std::vector<Hinge> hinges;
  std::vector<DVec> previous,points,forces_d;
  int32_t point_count=0,triangle_count=0,boundary_edges=0,degenerate_hinges=0;
  double stiffness=.0006,damping=.000025,moment_limit=.0015;
  bool configured=false,has_previous=false;
  static bool geometry(const DVec&,const DVec&,const DVec&,const DVec&,Geometry&);
  static double wrap_angle(double);
  Dictionary failure(const char *message)const;
protected:
  static void _bind_methods();
public:
  Dictionary configure(const PackedVector3Array &rest,const PackedInt32Array &indices,double p_stiffness=.0006,double p_damping=.000025,double p_moment_limit=.0015);
  Dictionary evaluate(const PackedVector3Array &positions,double sample_dt);
  void reset_history();
  Dictionary get_metadata()const;
};
}
