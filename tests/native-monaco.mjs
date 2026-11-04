import { build } from "esbuild";
import { fileURLToPath } from "node:url";

// Monaco publishes ESM in a package without a Node ESM type. Bundle its actual
// Monarch implementation in memory so tests work on Node 18 without DOM shims.
async function loadMonacoModule(relativePath) {
  const entry = new URL(
    "../node_modules/monaco-editor/esm/vs/" + relativePath,
    import.meta.url,
  );
  const result = await build({
    entryPoints: [fileURLToPath(entry)],
    bundle: true,
    platform: "node",
    format: "esm",
    write: false,
  });
  return import(
    "data:text/javascript;base64," +
      Buffer.from(result.outputFiles[0].contents).toString("base64")
  );
}

export async function createNativeTokenizer(language) {
  const [{ MonarchTokenizer }, { compile }] = await Promise.all([
    loadMonacoModule("editor/standalone/common/monarch/monarchLexer.js"),
    loadMonacoModule("editor/standalone/common/monarch/monarchCompile.js"),
  ]);
  return new MonarchTokenizer({}, {}, "cpp", compile("cpp", language), {
    getValue: () => 100000,
    onDidChangeConfiguration: () => ({ dispose() {} }),
  });
}
