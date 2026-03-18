import fs from "node:fs";
import vm from "node:vm";

const html = fs.readFileSync(new URL("../.next/analyze/client.html", import.meta.url), "utf8");

const match = html.match(/window\.chartData\s*=\s*(\[.*?\]);\s*window\.defaultSizes/s);
if (!match) {
  console.error("Could not locate window.chartData in client.html");
  process.exit(1);
}

let data;
try {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(`window.chartData = ${match[1]};`, sandbox, { timeout: 2000 });
  data = sandbox.window.chartData;
} catch (err) {
  console.error("Failed to evaluate chartData from client.html");
  console.error(err?.message || String(err));
  process.exit(1);
}

  const rows = [];
  const visit = (node) => {
    if (!node?.groups) return;
    for (const g of node.groups) {
      rows.push({
        label: g.label,
        path: g.path,
        statSize: g.statSize ?? 0,
        parsedSize: g.parsedSize ?? 0,
        gzipSize: g.gzipSize ?? 0,
      });
      visit(g);
    }
  };

  for (const asset of data) visit(asset);

  rows.sort((a, b) => (b.parsedSize || 0) - (a.parsedSize || 0));

  const trunc = (value, max = 120) => {
    const s = String(value ?? "");
    if (s.length <= max) return s;
    return `${s.slice(0, max - 1)}…`;
  };

  console.log("Top bundle groups by parsedSize (bytes):");
  for (const r of rows.slice(0, 25)) {
    const parsed = String(r.parsedSize).padStart(9);
    const stat = String(r.statSize).padStart(9);
    const gzip = String(r.gzipSize).padStart(9);
    console.log(
      `${parsed} parsed | ${gzip} gzip | ${stat} stat | ${trunc(r.label, 40)} | ${trunc(r.path, 140)}`,
    );
  }

