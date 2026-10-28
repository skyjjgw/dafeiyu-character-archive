#pragma once
#include <godot_cpp/classes/ref_counted.hpp>
#include <godot_cpp/variant/dictionary.hpp>
#include <godot_cpp/variant/array.hpp>
#include <godot_cpp/variant/packed_byte_array.hpp>
#include <array>
#include <vector>
#include <unordered_map>
#include <cstdint>
#include <atomic>
#include <thread>
#include <mutex>
#include <condition_variable>
namespace godot {
class SelectedStructuralFaceKernel : public RefCounted {
 GDCLASS(SelectedStructuralFaceKernel,RefCounted)
 struct V2 {double x=0,y=0;};
 struct State {double blink=0,talk=0,happy=0,sad=0,gaze_x=0,gaze_y=0;};
 struct Eye {V2 center,iris_center;double iris_rx=0,iris_ry=0,outer_x=0,outer_top=0,outer_bottom=0,min_x=0,max_x=0;int index=0;std::vector<V2>upper,lower;};
 enum Role {STATIC=0,EYE_RING=1,SCLERA=2,IRIS=3,UPPER_LASH=4,WING=5,LOWER_LASH=6,CREASE=7,MOUTH_RING=8,MOUTH_CAVITY=9,TONGUE=10,LIPS=11,FRONT_PROFILE=12};
 struct Canonical {int role=0,eye=0;double a=0,b=0,c=0,d=0;};
 struct Sample {double x=0,y=0,z=0,u=0,v=0;std::array<double,4>rgba{{1,1,1,1}};bool uv=false,color=false;};
 struct DynamicMesh {String name;int source_index=0,role=0,eye=0,count=0;bool has_uv=false,has_color=false;std::vector<Canonical>vertices;std::vector<uint8_t>dependencies;State last_state;bool state_ready=false;uint64_t config_generation=0;uint8_t dependencies_mask=0;PackedByteArray positions,uvs,colors;};
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
 struct V3 {double x=0,y=0,z=0;};
 struct DepthTriangle {std::array<double,9>p;double det=0;std::array<double,4>bounds{};double maximum_z=0;};
 static constexpr int RIM_GRID=64;
 struct Hole {bool eye=false;int eye_index=0;V2 center;double transition=.001;std::vector<V3>rim;std::array<double,4>bounds{},near_bounds{};std::vector<std::vector<int>>near_segments,y_segments;};
 struct XY {double x,y;bool operator==(const XY&o)const{return x==o.x&&y==o.y;}};
 struct XYHash {size_t operator()(const XY&p)const{return std::hash<double>{}(p.x)^(std::hash<double>{}(p.y)<<1);}};
 bool structure_enabled=false;
 int cage_grid=48;
 std::array<double,4>cage_bounds{{-.65,-.42,.65,.68}};
 double cage_padding=.012,cage_safety=.55,target_strength=1,target_cheek=.5;
 std::vector<DepthTriangle>cage_triangles;
 std::vector<std::vector<int>>cage_cells;
 std::vector<Hole>holes;
 std::vector<V3>support_anchors;
 std::array<std::vector<V3>,4>source_frame_cache;
 mutable bool source_frame_ready=false;
 mutable bool source_state_ready=false;
 State source_cached_state;
 mutable uint64_t geometry_generation=1;
 static uint8_t state_changes(const State&,const State&);
 uint8_t canonical_dependencies(const Canonical&)const;
 void configure_dependencies();
 bool profile_enabled=false;
 bool serial_only=false;
 mutable std::array<uint64_t,8>profile_nanos{},profile_counts{};
 void report_structure_profile()const;
 struct DepthEntry{XY key{0,0};std::pair<double,double>value;uint32_t generation=0;};
 struct DepthLane{std::vector<DepthEntry>slots;uint32_t generation=1;size_t count=0;};
 mutable std::array<DepthLane,2>depth_lanes;
 mutable std::unordered_map<const Canonical*,Sample>structure_static_samples;
 void clear_depth_cache(bool=true)const;
 void build_rim_index(Hole&);
 int grid_x(double)const;
 int grid_y(double)const;
 double target_front_z(double,double)const;
 double cage_depth(double,double)const;
 std::pair<double,double>depth_v3(double,double)const;
 V3 source_point(int,int,double,double,const State&)const;
 V3 source_ring(int,int,double,double,const State&)const;
 void prepare_structure_frame(const State&);
 bool inside_rim(double,double,const Hole&)const;
 double rim_distance(double,double,const Hole&)const;
 static V3 rim_at(const Hole&,double);
 Sample sample_structure(const Canonical&,const State&)const;
 struct VertexWork{DynamicMesh*mesh=nullptr;uint8_t*positions=nullptr;uint8_t*uv=nullptr;uint8_t*color=nullptr;int begin=0,end=0;uint8_t changes=0;bool first=false,ok=true;};
 std::vector<VertexWork>vertex_work;
 State vertex_state;
 std::atomic<size_t>work_cursor{0};
 std::thread structure_worker;
 std::mutex structure_mutex;
 std::condition_variable structure_ready,structure_done;
 uint64_t work_generation=0,completed_generation=0;
 bool stop_worker=false;
 void start_structure_worker();
 void process_vertex_work(int);
 bool update_structure_buffers(const State&,std::vector<uint8_t>&);

 static void put_float(uint8_t*,int64_t,double);
 Dictionary failure(const String&)const;
protected:
 static void _bind_methods();
public:
 ~SelectedStructuralFaceKernel();
 Dictionary configure(const Dictionary&,const Array&);
 Dictionary configure_structure(const Dictionary&);
 Dictionary set_depth_policy(const Dictionary&);
 Dictionary evaluate(const Dictionary&);
 PackedByteArray pack_attributes(const PackedByteArray&,const PackedByteArray&,int,int,int,int)const;
 Dictionary compare_float_bytes(const PackedByteArray&,const PackedByteArray&)const;
 Dictionary get_metadata()const;
};
}
