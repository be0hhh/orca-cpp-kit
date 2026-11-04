# A runnable script: cmake -P example.cmake
cmake_minimum_required(VERSION 3.20)
set(PREFIX "DEMO")
set(DEMO_NAME "Orca")
message(STATUS "Hello ${${PREFIX}_NAME}")

#[=[ Bracket comment with a ] character. ]=]
set(TEXT [=[Literal ${not_expanded}]=])
message(STATUS "${TEXT}")

# Generator expressions are evaluated in targets, not in script messages.
set(EXAMPLE "$<$<CONFIG:Debug>:$<BUILD_INTERFACE:${CMAKE_CURRENT_LIST_DIR}>>")
