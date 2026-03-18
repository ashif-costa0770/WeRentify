import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const manifestPath = path.join(root, ".next", "react-loadable-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));

const nextRoot = path.join(root, ".next");
const entries = [
  "app\\_components\\navbar\\NavbarWrapper.jsx -> ./Navbar",
  "app\\_components\\navbar\\Navbar.jsx -> @/app/_components/modals/SignInModal",
  "app\\_components\\navbar\\Navbar.jsx -> @/app/_components/modals/SignUpModal",
  "app\\_components\\navbar\\Navbar.jsx -> @/app/_components/modals/LanguageCurrencyModal",
  "app\\_components\\navbar\\Navbar.jsx -> @/app/_components/modals/MessageSlider",
  "app\\page.js -> @/app/_components/modals/FiltersSlicer",
];

for (const key of entries) {
  const entry = manifest[key];
  if (!entry) {
    console.log(`\n${key}\n  (not found)`);
    continue;
  }

  const files = entry.files || [];
  let total = 0;
  const details = files
    .map((f) => {
      const p = path.join(nextRoot, f);
      const size = fs.existsSync(p) ? fs.statSync(p).size : 0;
      total += size;
      return { f, size };
    })
    .sort((a, b) => b.size - a.size);

  console.log(`\n${key}\n  total_bytes=${total}`);
  for (const d of details) {
    console.log(`  ${String(d.size).padStart(10)}  ${d.f}`);
  }
}

