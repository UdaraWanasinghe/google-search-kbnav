import { readFileSync, writeFileSync } from "node:fs";
import { minify } from "terser";

const outputPath = "dist/content.js";
const source = readFileSync(outputPath, "utf8");
const result = await minify(source, {
  compress: false,
  mangle: false,
  format: {
    beautify: false,
    comments: false,
  },
});

if (!result.code) {
  throw new Error("Terser did not produce a minified bundle.");
}

writeFileSync(outputPath, result.code);
