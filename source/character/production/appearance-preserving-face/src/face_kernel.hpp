#pragma once
#include <godot_cpp/classes/ref_counted.hpp>
#include <godot_cpp/variant/dictionary.hpp>
#include <godot_cpp/variant/array.hpp>
#include <godot_cpp/variant/packed_byte_array.hpp>
#include <array>
#include <vector>
namespace godot {
class SelectedFaceKernel : public RefCounted {
 GDCLASS(SelectedFaceKernel,RefCounted)
 struct V2 {double x=0,y=0;};
 struct State {double blink=0,talk=0,happy=0,sad=0,gaze_x=0,gaze_y=0;};
 struct Eye {V2 center,iris_center;double iris_rx=0,iris_ry=0,outer_x=0,outer_top=0,outer_bottom=0,min_x=0,max_x=0;int index=0;std::vector<V2>upper,lower;};
 enum Role {STATIC=0,EYE_RING=1,SCLERA=2,IRIS=3,UPPER_LASH=4,WING=5,LOWER_LASH=6,CREASE=7,MOUTH_RING=8,MOUTH_CAVITY=9,TONGUE=10,LIPS=11,FRONT_PROFILE=12};
 struct Canonical {int role=0,eye=0;double a=0,b=0,c=0,d=0;};
 struct Sample {double x=0,y=0,z=0,u=0,v=0;std::array<double,4>rgba{{1,1,1,1}};bool uv=false,color=false;};
 struct DynamicMesh {String name;int source_index=0,role=0,eye=0,count=0;bool has_uv=false,has_color=false;std::vector<Canonical>vertices;PackedByteArray positions,uvs,colors;};
 struct Section {double y=0;std::array<double,10>v;};
 std::array<Eye,2>eyes;V2 mouth_center;double mouth_rx=.108,mouth_top=.056,mouth_bottom=.078;
 std::vector<V2>outline;std::vector<std::array<double,10>>table,source_table;std::vector<DynamicMesh>meshes;
 double min_y=-.382,max_y=.64,strength=.65,source_strength=.65,cheek_exponent=.25,source_w=1920,source_h=1080,tilt=.06;
 bool configured=false;
 Dictionary depth_policy;
 static double clamp(double,double=0,double=1);
 static double mix(double,double,double);
 static double smooth(double);
 static double srgb(double);
 static V2 vec2(const Variant&);
 static int role_id(const String&);
 static State state_of(const Dictionary&);
 double center_at(double)const;
 double width_at(double)const;
 Section section(double)const;
 double lateral(const Section&,double)const;
 double front_z(double,double)const;
 static double curve_y(const std::vector<V2>&,double);
 static double lid_y(const Eye&,double,bool,const State&);
 static V2 ellipse(const V2&,double,double,double,double);
 static V2 aperture(const Eye&,double,const State&);
 V2 mouth_point(double,const State&)const;
 V2 strip_path(int,const Eye&,double,const State&)const;
 static double strip_width(int,double,const State&);
 static std::array<double,3>skin_color(double,double);
 Sample sample(const Canonical&,const State&)const;
 double apply_depth(const Canonical&,const State&,const Sample&)const;
 static void put_float(uint8_t*,int64_t,double);
 Dictionary failure(const String&)const;
protected:
 static void _bind_methods();
public:
 Dictionary configure(const Dictionary&,const Array&);
 Dictionary set_depth_policy(const Dictionary&);
 Dictionary evaluate(const Dictionary&);
 PackedByteArray pack_attributes(const PackedByteArray&,const PackedByteArray&,int,int,int,int)const;
 Dictionary compare_float_bytes(const PackedByteArray&,const PackedByteArray&)const;
 Dictionary get_metadata()const;
};
}
