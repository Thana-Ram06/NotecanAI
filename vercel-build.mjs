import { execSync } from "child_process";
import { cpSync, mkdirSync, writeFileSync } from "fs";
import { resolve } from "path";

const root = process.cwd();
console.log("Project root:", root);

process.env.PORT = "3000";
process.env.BASE_PATH = "/";

// Build the frontend
console.log("Building frontend...");
execSync("pnpm --filter @workspace/notecanai run build", { stdio: "inherit" });

const distPath = resolve(root, "artifacts/notecanai/dist");
console.log("Dist path:", distPath);

// Create Vercel Build Output API structure
const staticDir = resolve(root, ".vercel/output/static");
mkdirSync(staticDir, { recursive: true });
cpSync(distPath, staticDir, { recursive: true });
console.log("Copied static files to", staticDir);

// SPA routing config
writeFileSync(
  resolve(root, ".vercel/output/config.json"),
  JSON.stringify({
    version: 3,
    routes: [
      { handle: "filesystem" },
      { src: "/(.*)", dest: "/index.html" },
    ],
  })
);

console.log("Vercel build complete!");
