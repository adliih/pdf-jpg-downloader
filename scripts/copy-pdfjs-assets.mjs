import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";

const require = createRequire(import.meta.url);
const repoRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const src = path.dirname(require.resolve("pdfjs-dist/package.json"));
const dest = path.join(
  repoRoot,
  "api/download-pdf-to-jpg/pdfjs-dist",
);

fs.rmSync(dest, { recursive: true, force: true });
fs.cpSync(src, dest, { recursive: true });

console.log(`Copied pdfjs-dist to ${dest}`);
