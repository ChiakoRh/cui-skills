cmake_minimum_required(VERSION 3.14)
project(my_app C)

# Option A (recommended while developing): use a local clone next to your app
# set(CUI_DIR "path/to/CUI-clone" CACHE PATH "")
add_subdirectory(${CUI_DIR} cui_build)

# Option B (releases): fetch a pinned version at configure time
# include(FetchContent)
# FetchContent_Declare(cui GIT_REPOSITORY https://github.com/yappologistic/CUI.git GIT_TAG v1.4.0)
# FetchContent_MakeAvailable(cui)

add_executable(my_app main.c)
target_link_libraries(my_app PRIVATE cui::cui)
cui_app_target(my_app)   # no console window, links only the components you use (~250 KB)
