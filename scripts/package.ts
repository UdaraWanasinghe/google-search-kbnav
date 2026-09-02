import { mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { join, relative, sep } from "node:path";
import { zipSync } from "fflate";

const manifest = JSON.parse(readFileSync("dist/manifest.json", "utf8")) as {
  version: string;
};
const files: Record<string, Uint8Array> = {};

function collectFiles(directory: string): void {
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      collectFiles(path);
      continue;
    }

    const archivePath = relative("dist", path).split(sep).join("/");
    files[archivePath] = readFileSync(path);
  }
}

collectFiles("dist");
mkdirSync("release", { recursive: true });

const outputPath = `release/google-search-kbnav-v${manifest.version}.zip`;
writeFileSync(outputPath, zipSync(files, { level: 9 }));
console.log(`Created ${outputPath}`);
