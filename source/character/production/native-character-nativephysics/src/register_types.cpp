#include "cloth_bending.hpp"
#include <godot_cpp/godot.hpp>
#include <godot_cpp/core/class_db.hpp>
using namespace godot;
static void initialize_cloth(ModuleInitializationLevel level){if(level==MODULE_INITIALIZATION_LEVEL_SCENE)ClassDB::register_class<NativeClothBending>();}
static void uninitialize_cloth(ModuleInitializationLevel level){(void)level;}
extern "C" {
GDExtensionBool GDE_EXPORT cloth_bending_library_init(GDExtensionInterfaceGetProcAddress address,GDExtensionClassLibraryPtr library,GDExtensionInitialization *initialization){
  GDExtensionBinding::InitObject init(address,library,initialization);init.register_initializer(initialize_cloth);init.register_terminator(uninitialize_cloth);init.set_minimum_library_initialization_level(MODULE_INITIALIZATION_LEVEL_SCENE);return init.init();
}
}
