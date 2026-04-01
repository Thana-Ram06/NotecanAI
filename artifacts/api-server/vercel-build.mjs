import { execSync } from "child_process";
import { cpSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// This runs from artifacts/api-server/ — navigate up to project root
const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "../..");

console.log("Project root:", root);
console.log("Build dir:", __dirname);

process.env.PORT = "3000";
process.env.BASE_PATH = "/";

// Build the frontend
console.log("Building frontend...");
execSync("pnpm --filter @workspace/notecanai run build", {
  stdio: "inherit",
  cwd: root,
});

// Copy to dist/ inside artifacts/api-server/ — this is where Vercel looks
const distPath = resolve(root, "artifacts/notecanai/dist");
const outputPath = resolve(__dirname, "dist");
mkdirSync(outputPath, { recursive: true });
cpSync(distPath, outputPath, { recursive: true });

console.log("Output ready at:", outputPath);
console.log("Vercel build complete!");
