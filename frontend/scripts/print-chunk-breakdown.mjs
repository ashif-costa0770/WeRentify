import fs from "node:fs";
import vm from "node:vm";
import path from "node:path";

const root = process.cwd();
const htmlPath = path.join(root, ".next", "analyze", "client.html");
const html = fs.readFileSync(htmlPath, "utf8");

const match = html.match(/window\.chartData\s*=\s*(\[.*?\]);\s*window\.defaultSizes/s);
if (!match) {
  console.error("Could not locate window.chartData in client.html");
  process.exit(1);
}

const sandbox = { window: {} };
vm.createContext(sandbox);
vm.runInContext(`window.chartData = ${match[1]};`, sandbox, { timeout: 2000 });
const data = sandbox.window.chartData;

const targets = process.argv.slice(2);
if (targets.length === 0) {
  console.error("Usage: node scripts/print-chunk-breakdown.mjs static/chunks/<file>.js ...");
  process.exit(1);
}

const trunc = (value, max = 130) => {
  const s = String(value ?? "");
  if (s.length <= max) return s;
  return `${s.slice(0, max - 1)}…`;
};

const flatten = (node, rows) => {
  if (!node?.groups) return;
  for (const g of node.groups) {
    rows.push({
      label: g.label,
      path: g.path,
      parsedSize: g.parsedSize ?? 0,
      gzipSize: g.gzipSize ?? 0,
      statSize: g.statSize ?? 0,
    });
    flatten(g, rows);
  }
};

for (const t of targets) {
  const asset = data.find((x) => x?.label === t);
  if (!asset) {
    console.log(`\nChunk not found in analyzer: ${t}`);
    continue;
  }

  const rows = [];
  flatten(asset, rows);
  rows.sort((a, b) => b.parsedSize - a.parsedSize);

  console.log(`\n=== ${t} ===`);
  console.log(`statSize=${asset.statSize} parsedSize=${asset.parsedSize} gzipSize=${asset.gzipSize}`);
  for (const r of rows.slice(0, 20)) {
    console.log(
      `${String(r.parsedSize).padStart(9)} parsed | ${String(r.gzipSize).padStart(8)} gzip | ${trunc(r.label, 40)} | ${trunc(r.path, 160)}`,
    );
  }
}

