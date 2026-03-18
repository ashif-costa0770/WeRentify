import fs from "node:fs";
import path from "node:path";

const root = path.join(process.cwd(), ".next");
const buildManifest = JSON.parse(fs.readFileSync(path.join(root, "build-manifest.json"), "utf8"));

const rscManifestPath = path.join(root, "server", "app", "page_client-reference-manifest.js");
const rscText = fs.readFileSync(rscManifestPath, "utf8");

// In clientModules we have an entry for src/app/page.js that includes a "chunks": [...]
const needle = "src\\\\app\\\\page.js";
const start = rscText.indexOf(needle);
if (start === -1) {
  console.error("Could not locate src/app/page.js in client reference manifest");
  process.exit(1);
}

const chunksKey = '"chunks":[';
const chunksStart = rscText.indexOf(chunksKey, start);
if (chunksStart === -1) {
  console.error("Could not locate chunks array for src/app/page.js");
  process.exit(1);
}

let i = chunksStart + chunksKey.length;
let depth = 1;
let inString = false;
let escape = false;
for (; i < rscText.length; i++) {
  const ch = rscText[i];
  if (escape) {
    escape = false;
    continue;
  }
  if (ch === "\\\\") {
    escape = true;
    continue;
  }
  if (ch === '"') {
    inString = !inString;
    continue;
  }
  if (inString) continue;
  if (ch === "[") depth++;
  if (ch === "]") {
    depth--;
    if (depth === 0) break;
  }
}

const chunksRaw = rscText.slice(chunksStart + chunksKey.length, i);
const chunkList = JSON.parse(`[${chunksRaw}]`);
const files = [...new Set([...(buildManifest.rootMainFiles || []), ...chunkList])];

const rows = files
  .map((file) => {
    const rel = file.replace(/^\/_next\//, "");
    const diskPath = path.join(root, rel);
    const size = fs.existsSync(diskPath) ? fs.statSync(diskPath).size : 0;
    return { file, size };
  })
  .sort((a, b) => b.size - a.size);

console.log("Files loaded by / (rootMainFiles + app/page chunks)");
for (const r of rows) {
  console.log(String(r.size).padStart(10), r.file);
}

