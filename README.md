# C/C++ & CMake Kit for Orca

[![Release](https://img.shields.io/github/v/release/be0hhh/orca-cpp-kit?color=blue&label=release)](https://github.com/be0hhh/orca-cpp-kit/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Orca Plugin](https://img.shields.io/badge/Orca-Plugin-orange.svg)](https://onorca.dev/)

Modern C/C++ development companion for [Orca](https://useorca.com/), adding rich syntax highlighting for C++ inline and template definitions, plus full CMake language support.

---

## ⚡ Features

### 1. C++ Inline & Template Definitions (`.ipp`, `.inl`, `.tpp`, `.tcc`)
- Syntax highlighting for separated C++ template implementations and inline headers.
- Full support for C++20/23 keywords: `concept`, `requires`, `consteval`, `constexpr`, `co_await`, `co_yield`, `co_return`, `decltype`, `noexcept`.
- Nested template angle brackets `<...>`, type parameters (`typename`, `class`), and variable templates.
- Standard namespace symbols (`std::`, `chrono`, `filesystem`, `views`, `ranges`).

### 2. CMake Build System (`CMakeLists.txt`, `*.cmake`, `CMakeCache.txt`)
- Built-in commands (`project`, `add_executable`, `add_library`, `target_link_libraries`, `find_package`, `FetchContent_*`).
- Control flow structures (`if`, `elseif`, `else`, `endif`, `foreach`, `while`, `function`, `macro`).
- Variable expansions (`${VAR}`, `$ENV{VAR}`, `$CACHE{VAR}`) and generator expressions (`$<...>`).
- Standard targets, scopes (`PUBLIC`, `PRIVATE`, `INTERFACE`), and bracket comments (`#[[ ... ]]`).

---

## 📦 Installation

### Method 1: In Orca Settings (Recommended)
1. Open Orca and go to **Settings** (`Ctrl+,`) → **Plugins**.
2. Click **Add Plugin** / **Install from Git URL**.
3. Paste the repository URL:
   ```
   https://github.com/be0hhh/orca-cpp-kit
   ```
4. Click **Install**. (As a `data` plugin, it activates instantly without approval).

### Method 2: Manual Clone
Clone directly into your Orca plugins directory:
```sh
# Linux / macOS
git clone https://github.com/be0hhh/orca-cpp-kit.git ~/.orca/plugins/be0hhh.cpp-kit

# Windows
git clone https://github.com/be0hhh/orca-cpp-kit.git "%APPDATA%\orca\plugins\be0hhh.cpp-kit"
```

---

## 📄 License

MIT © [be0hhh](https://github.com/be0hhh)
