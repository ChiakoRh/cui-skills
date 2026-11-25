#!/usr/bin/env node
// Zero-dependency setup for the CUI skill suite: checks tools, clones the
// projects, writes paths.json, installs the skills into detected agents.
// Run: npx github:ChiakoRh/cui-skills   or   node setup.mjs (after clone)
import { execSync } from "node:child_process";
import { existsSync, mkdirSync, cpSync, writeFileSync, readFileSync } from "node:fs";
import { homedir } from "node:os";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createInterface } from "node:readline/promises";

const root = dirname(fileURLToPath(import.meta.url));
const rl = createInterface({ input: process.stdin, output: process.stdout });
const ask = (q, d = "") => rl.question(q + (d ? ` [${d}]: ` : ": ")).then((a) => a.trim() || d);
const has = (cmd) => { try { execSync(`${cmd} --version`, { stdio: "ignore" }); return true; } catch { return false; } };
const run = (cmd) => execSync(cmd, { stdio: "inherit" });

console.log("\n=== CUI skills setup ===\n");

// 1. Tools
const tools = {
  git: has("git"),
  cmake: has("cmake"),
  clang: has("clang"),
  python: has("python") || has("python3"),
};
let wasm32 = false;
if (tools.clang) {
  try { wasm32 = execSync("clang --print-targets", { encoding: "utf8" }).includes("wasm32"); } catch {}
}
console.log("Tools:", Object.entries(tools).map(([k, v]) => `${k}=${v ? "ok" : "MISSING"}`).join("  "), tools.clang ? `(wasm32: ${wasm32 ? "yes" : "no"})` : "");

// 2. Which branches (a branch whose tools are missing is skipped with a warning)
const branches = (await ask("Which skills? app, web, py, style", "app,web,py,style"))
  .split(",").map((s) => s.trim()).filter(Boolean);
const needClone = branches.includes("app") || branches.includes("web");

// 3. Clone CUI
let cuiClone = null;
if (needClone) {
  const def = join(homedir(), "Git", "CUI");
  const dest = await ask("CUI clone path", def);
  if (existsSync(join(dest, "include", "cui.h"))) {
    cuiClone = dest; console.log("CUI already cloned.");
  } else if (tools.git) {
    mkdirSync(dirname(dest), { recursive: true });
    run(`git clone https://github.com/yappologistic/CUI.git "${dest}"`);
    cuiClone = dest;
  } else console.log("git missing - clone manually: git clone https://github.com/yappologistic/CUI.git");
}
// nexa: pip install is enough for using the library; clone only for development
if (branches.includes("py")) {
  const pip = has("python") ? "python" : "python3";
  try { run(`${pip} -m pip install nexa-ui`); console.log("nexa-ui installed."); }
  catch { console.log("pip install nexa-ui failed - install manually"); }
}

// 4. paths.json (at the suite root)
const paths = { cui_clone: cuiClone, nexa_clone: null };
writeFileSync(join(root, "paths.json"), JSON.stringify(paths, null, 2) + "\n");
console.log("paths.json written.");

// 5. Install skills into every agent dir that exists
const skillDirs = branches.map((b) => `cui-${b === "app" ? "app" : b}`);
const agentHomes = {
  opencode: join(homedir(), ".config", "opencode", "skills"),
  claude: join(homedir(), ".claude", "skills"),
  codex: join(homedir(), ".codex", "skills"),
  cursor: join(homedir(), ".cursor", "skills"),
  "github-copilot": join(homedir(), ".config", "github-copilot", "skills"),
};
let installed = 0;
for (const [agent, dir] of Object.entries(agentHomes)) {
  if (!existsSync(dirname(dir))) continue; // agent not present on this machine
  for (const s of skillDirs) {
    const src = join(root, s);
    const dst = join(dir, s);
    if (!existsSync(src)) continue;
    if (existsSync(dst)) { console.log(`${s} already in ${agent} - skipped (delete it first to reinstall)`); continue; }
    mkdirSync(dir, { recursive: true });
    cpSync(src, dst, { recursive: true });
  }
  installed++; console.log(`skills -> ${agent}: ${dir}`);
}
if (!installed) console.log("No agent dir found - copy the skill folders manually (see README).");

// 6. Verify
console.log("\n=== Verify ===");
console.log(`cmake: ${tools.cmake ? "ok" : "MISSING"}  clang/wasm32: ${tools.clang ? (wasm32 ? "ok" : "no wasm32 target (cui-web only)") : "MISSING"}  paths.json: ${cuiClone ? "ok" : "null (clone skipped)"}`);
console.log("\nDone. Restart your agent so it picks up the new skills.\n");
rl.close();
