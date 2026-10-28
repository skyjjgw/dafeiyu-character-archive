cmake_minimum_required(VERSION 3.22)
project(DafeiyuNativeClothBending LANGUAGES CXX)
set(GODOTCPP_TARGET template_release CACHE STRING "" FORCE)
set(GODOTCPP_API_VERSION "4.7" CACHE STRING "" FORCE)
set(GODOTCPP_CUSTOM_API_FILE "${CMAKE_CURRENT_SOURCE_DIR}/extension_api.json" CACHE PATH "" FORCE)
set(GODOTCPP_BUILD_PROFILE "${CMAKE_CURRENT_SOURCE_DIR}/build_profile.json" CACHE PATH "" FORCE)
set(GODOTCPP_PRECISION single CACHE STRING "" FORCE)
add_subdirectory(vendor/godot-cpp)
add_library(native_cloth_bending SHARED src/cloth_bending.cpp src/register_types.cpp)
target_link_libraries(native_cloth_bending PRIVATE godot::cpp)
target_compile_features(native_cloth_bending PRIVATE cxx_std_17)
if(MSVC)
  target_compile_options(native_cloth_bending PRIVATE /O2 /fp:precise /W4)
endif()
set_target_properties(native_cloth_bending PROPERTIES
  RUNTIME_OUTPUT_DIRECTORY "$<1:${CMAKE_CURRENT_SOURCE_DIR}/project/bin>"
  LIBRARY_OUTPUT_DIRECTORY "$<1:${CMAKE_CURRENT_SOURCE_DIR}/project/bin>"
  OUTPUT_NAME "native_cloth_bending.windows.release.x86_64")
