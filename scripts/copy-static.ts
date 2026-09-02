import { copyFileSync, cpSync, mkdirSync } from "node:fs";

mkdirSync("dist", { recursive: true });
copyFileSync("manifest.json", "dist/manifest.json");
copyFileSync("styles.css", "dist/styles.css");
cpSync("icons", "dist/icons", {
  recursive: true,
  filter: (source) => !source.endsWith(".svg"),
});
