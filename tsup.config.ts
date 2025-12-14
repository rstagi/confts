import { defineConfig } from "tsup";

export default defineConfig([
  {
    entry: ["src/index.ts"],
    format: ["esm", "cjs"],
    dts: true,
    clean: true,
    sourcemap: true,
  },
  {
    entry: ["src/bin/confts-start.ts"],
    format: ["esm"],
    clean: false,
    sourcemap: true,
  },
]);
