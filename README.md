# C/C++ & CMake Kit for Orca

Modern C/C++ development companion for [Orca](https://useorca.com/), adding rich syntax highlighting for C++ inline and template definitions, plus full CMake language support.

## Features

- **C++ Inline & Template Definitions (`.ipp`, `.inl`, `.tpp`, `.tcc`)**
  - Syntax highlighting for separated C++ template implementations and inline headers.
  - Full support for C++20/23 keywords: `concept`, `requires`, `consteval`, `constexpr`, `co_await`, `co_yield`, `co_return`, `decltype`, `noexcept`.
  - Nested template angle brackets `<...>`, type parameters (`typename`, `class`), and variable templates.
  - Standard namespace symbols (`std::`, `chrono`, `filesystem`, `views`, `ranges`).

- **CMake Build System (`CMakeLists.txt`, `*.cmake`, `CMakeCache.txt`)**
  - Built-in commands (`project`, `add_executable`, `add_library`, `target_link_libraries`, `find_package`, `FetchContent_*`).
  - Control flow structures (`if`, `elseif`, `else`, `endif`, `foreach`, `while`, `function`, `macro`).
  - Variable expansions (`${VAR}`, `$ENV{VAR}`, `$CACHE{VAR}`) and generator expressions (`$<...>`).
  - Standard targets, scopes (`PUBLIC`, `PRIVATE`, `INTERFACE`), and bracket comments (`#[[ ... ]]`).

## Installation

Install directly in Orca or clone into Orca's plugins directory:

```sh
# Clone into plugins directory
git clone https://github.com/be0hhh/orca-cpp-kit.git ~/.orca/plugins/be0hhh.cpp-kit
```

## License

MIT © [be0hhh](https://github.com/be0hhh)
