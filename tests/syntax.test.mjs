import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import textmate from "vscode-textmate";
import oniguruma from "vscode-oniguruma";
const { Registry, INITIAL } = textmate;
await oniguruma.loadWASM(
  fs.readFileSync(
    new URL(
      "../node_modules/vscode-oniguruma/release/onig.wasm",
      import.meta.url,
    ),
  ),
);
const native = await import(
  "data:text/javascript;base64," +
    fs
      .readFileSync(
        new URL(
          "../node_modules/monaco-editor/esm/vs/basic-languages/cpp/cpp.js",
          import.meta.url,
        ),
      )
      .toString("base64")
);
const read = (p) =>
  JSON.parse(fs.readFileSync(new URL("../" + p, import.meta.url), "utf8"));
const registry = new Registry({
  onigLib: Promise.resolve({
    createOnigScanner: (s) => new oniguruma.OnigScanner(s),
    createOnigString: (s) => new oniguruma.OnigString(s),
  }),
  loadGrammar: async (scope) =>
    Object.values(grammars).find((g) => g.scopeName === scope),
});
const grammars = Object.fromEntries(
  ["cpp", "cmake", "cmake-cache"].map((n) => [
    n,
    read(`syntaxes/${n}.tmLanguage.json`),
  ]),
);
const cpp = await registry.loadGrammar(grammars.cpp.scopeName);
const category = (scopes) => {
  for (const s of [...scopes].reverse()) {
    if (s.startsWith("comment")) return "comment";
    if (s.startsWith("string") || s.startsWith("constant.character.escape"))
      return "string";
    if (s.startsWith("constant.numeric")) return "number";
    if (s.startsWith("keyword")) return "keyword";
    if (s.startsWith("punctuation")) return "delimiter";
    if (s.startsWith("variable")) return "identifier";
    if (s.startsWith("entity.name.decorator")) return "annotation";
  }
  return "";
};
const tokens = (grammar, line, state = INITIAL) =>
  grammar.tokenizeLine(line, state);
const at = (result, line, part) =>
  category(
    result.tokens.find(
      (t) =>
        t.startIndex <= line.indexOf(part) && t.endIndex > line.indexOf(part),
    ).scopes,
  );
test("native Monaco 0.55.1 keyword categories and plain identifiers", () => {
  // Monaco classifies these with keywords/identifier cases. Compare against the pinned source,
  // while executing the plugin through the real TextMate/Oniguruma engine.
  for (const word of native.language.keywords)
    assert.equal(at(tokens(cpp, word), word, word), "keyword", word);
  for (const word of ["std", "vector", "size_t", "myFunction", "Vector"])
    assert.equal(at(tokens(cpp, word), word, word), "identifier", word);
  for (const word of [
    "module",
    "import",
    "concept",
    "requires",
    "consteval",
    "co_await",
  ])
    assert.equal(at(tokens(cpp, word), word, word), "keyword", word);
});
test("native comment/bracket/quote configuration", () => {
  const config = read("syntaxes/cpp-configuration.json");
  for (const key of [
    "comments",
    "brackets",
    "autoClosingPairs",
    "surroundingPairs",
  ])
    assert.deepEqual(config[key], native.conf[key]);
});
test("complete operators keep native delimiter category", () => {
  for (const operator of [
    "<<",
    ">>",
    "->",
    "->*",
    "<=>",
    "++",
    "--",
    "&&",
    "||",
    "<<=",
  ]) {
    const line = "operator" + operator + "(x)";
    const result = tokens(cpp, line);
    assert.equal(at(result, line, operator), "delimiter");
    const start = line.indexOf(operator);
    const token = result.tokens.find((t) => t.startIndex === start);
    assert.equal(token.endIndex, start + operator.length, operator);
  }
});
test("numeric token consumes suffix, separators and floating notation", () => {
  for (const value of [
    "42ULL",
    "0b1010'0011ULL",
    "0xFF'ABu",
    "1.",
    ".5",
    "1e-4f",
    "0x1.fp+2",
    "123zu",
    "42_count",
  ]) {
    const result = tokens(cpp, value + ";");
    assert.equal(category(result.tokens[0].scopes), "number", value);
    assert.equal(result.tokens[0].endIndex, value.length, value);
  }
});
test("raw strings preserve prefix, punctuation delimiter and multiline state", () => {
  const first = 'u8R"tag-!(quoted "text"';
  const a = tokens(cpp, first);
  assert.equal(category(a.tokens[0].scopes), "string");
  const line = 'still raw)tag-!"; int value;';
  const b = tokens(cpp, line, a.ruleStack);
  assert.equal(at(b, line, "still"), "string");
  assert.equal(at(b, line, "int"), "keyword");
});
test("ordinary escaped strings and comments stop at the correct boundary", () => {
  for (const line of [
    '"say \\"hello\\""; int x;',
    "'\\n'; int x;",
    "/* comment */ int x;",
  ])
    assert.equal(at(tokens(cpp, line), line, "int"), "keyword");
  const a = tokens(cpp, "// continued \\");
  const b = tokens(cpp, "still comment", a.ruleStack);
  assert.equal(category(b.tokens[0].scopes), "comment");
});
test("nested CMake variables and generator expressions close independently", async () => {
  const grammar = await registry.loadGrammar("source.cmake");
  const line = 'message("${PREFIX_${NAME}} $<$<BOOL:${ON}>:yes>")';
  const result = tokens(grammar, line);
  assert.equal(result.ruleStack.depth, 1);
  assert.equal(at(result, line, "NAME"), "identifier");
});
test("cache comments and typed values have dedicated grammar", async () => {
  const grammar = await registry.loadGrammar("source.cmake-cache");
  assert.equal(
    category(tokens(grammar, "//Help text").tokens[0].scopes),
    "comment",
  );
  const line = "CMAKE_BUILD_TYPE:STRING=Release";
  const result = tokens(grammar, line);
  assert.equal(at(result, line, "Release"), "string");
});
test("manifest examples exist and ordinary C++ associations remain untouched", () => {
  const manifest = read("orca-plugin.json");
  assert.equal(manifest.contributes.newFiles[0].extension, ".ipp");
  for (const example of manifest.contributes.newFiles)
    assert.ok(
      fs.readFileSync(
        new URL("../" + example.template, import.meta.url),
        "utf8",
      ).length > 0,
    );
  for (const syntax of manifest.contributes.syntaxes)
    assert.ok(
      !syntax.extensions.includes(".cpp") &&
        !syntax.extensions.includes(".hpp"),
    );
  assert.deepEqual(
    manifest.contributes.syntaxes.find((s) => s.id === "cmake-cache").filenames,
    ["CMakeCache.txt"],
  );
});
test("all supplied samples finish outside multiline constructs", async () => {
  for (const [name, file] of [
    ["cpp", "math_vector.ipp"],
    ["cpp", "example.cppm"],
    ["cmake", "example.cmake"],
    ["cmake", "CMakeLists.txt"],
    ["cmake-cache", "CMakeCache.txt"],
  ]) {
    const grammar = await registry.loadGrammar(grammars[name].scopeName);
    let state = INITIAL;
    for (const line of fs
      .readFileSync(new URL("../samples/" + file, import.meta.url), "utf8")
      .split("\n"))
      state = tokens(grammar, line, state).ruleStack;
    assert.equal(state.depth, 1, file);
  }
});
test("actual Monaco runtime agrees on include delimiters and attributes", async () => {
  const { createNativeTokenizer } = await import("./native-monaco.mjs");
  const tokenizer = await createNativeTokenizer(native.language);
  try {
    for (const line of [
      '#include "foo.h"',
      "#include <vector>",
      "[[nodiscard]] int fn();",
      "[[using gnu: hot]] int fn();",
      "[[alignas(16)]] int value;",
      "[ [nodiscard] ] int value;",
      "int value = 42ULL; // comment",
    ]) {
      const ours = tokens(cpp, line);
      const theirs = tokenizer.tokenize(
        line,
        true,
        tokenizer.getInitialState(),
      ).tokens;
      for (let position = 0; position < line.length; position++) {
        if (/\s/.test(line[position])) continue;
        const a = ours.tokens.find(
          (t) => t.startIndex <= position && t.endIndex > position,
        );
        const b = theirs.findLast((t) => t.offset <= position);
        const expected = b.type.split(".")[0];
        assert.equal(
          category(a.scopes),
          expected,
          `${line} at ${position}: ${b.type}`,
        );
      }
    }
  } finally {
    tokenizer.dispose();
  }
});
test("hex float may omit the integral digit", () => {
  for (const value of ["0x.8p2", "0X.ABP-2f"]) {
    const result = tokens(cpp, value + ";");
    assert.equal(category(result.tokens[0].scopes), "number");
    assert.equal(result.tokens[0].endIndex, value.length);
  }
});
