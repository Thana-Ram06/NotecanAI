import { execSync } from "child_process";

const pat = process.env.GITHUB_PAT;
if (!pat) {
  console.error("GITHUB_PAT not set");
  process.exit(1);
}

const repoUrl = `https://${pat}@github.com/Thana-Ram06/NotecanAI.git`;

try {
  execSync(
    `git -c "credential.helper=" push "${repoUrl}" HEAD:main --force`,
    {
      stdio: "inherit",
      cwd: "/home/runner/workspace",
      env: { ...process.env, GIT_TERMINAL_PROMPT: "0" },
    }
  );
  console.log("Successfully pushed to GitHub!");
} catch (e) {
  console.error("Push failed:", e);
  process.exit(1);
}
