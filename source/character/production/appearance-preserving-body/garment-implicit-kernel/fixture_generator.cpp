// Grid/seed/boundary adaptation of JoltPhysics SoftBodyBendConstraintTest and
// SoftBodyCreator at 5d5275c38074c44b14f38b85bc9c73573078c808 (MIT, LICENSE-JOLT).
// Only generates static fixture data. Does not run/imitate the official solver.
#include <random>
#include <fstream>
#include <iomanip>
struct V {float x,y,z;V(float a,float b,float c):x(a),y(b),z(c){}};
int main(){
  std::default_random_engine random;random.seed(1234);
  std::uniform_real_distribution<float> dist(-.1f,.1f);
  std::ofstream out("project/official-jolt-fixture.json");out<<std::setprecision(9);
  out<<"{\"name\":\"official_jolt_grid10\",\"points\":[";
  for(int z=0;z<10;++z)for(int x=0;x<10;++x){V p(dist(random),(z&1)?.1f:-.1f,dist(random));if(z||x)out<<',';out<<'['<<p.x-2.25f+x*.5f<<','<<p.y+5.f<<','<<p.z-2.25f+z*.5f<<']';}
  out<<"],\"indices\":[";bool first=true;
  for(int z=0;z<9;++z)for(int x=0;x<9;++x){if(!first)out<<',';first=false;const int a=x+z*10;out<<a<<','<<a+10<<','<<a+11<<','<<a<<','<<a+11<<','<<a+1;}
  out<<"],\"pins\":[";for(int i=0;i<20;++i){if(i)out<<',';out<<i;}
  out<<"],\"mass\":100,\"k\":100,\"c\":0.01,\"source_commit\":\"5d5275c38074c44b14f38b85bc9c73573078c808\",\"original_mass_per_free_point_kg\":1,\"seed\":1234,\"seed_portability\":\"MSVC std::default_random_engine + uniform_real_distribution; C++ Vec3 argument evaluation/order and distribution are implementation dependent\",\"material_parameters_are_new_trial_not_original_solver\":true}";
}
