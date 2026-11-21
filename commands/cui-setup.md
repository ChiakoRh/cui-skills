---
description: Set up the CUI skills (cui-app / cui-web / cui-py / cui-style) — asks what the user needs, installs only that chain, clones the projects, records paths.
---

# cui-setup

Set up the CUI skill suite for this machine. Follow the flow below; adapt
paths to the OS. Do **not** install anything the chosen skills don't need.

## Flow

1. **Ask the user which skill branch they want** (they may pick more):
   - `cui-app` — native C/C++ desktop app
   - `cui-web` — that same C app as WebAssembly in the browser
   - `cui-py` — desktop app in Python (nexa)
   - `cui-style` — plain HTML/CSS UI in the CUI look (no build at all)
2. **Check what already exists** — run once: `git --version`,
   `cmake --version`, `clang --version` (for `cui-web` also
   `clang --print-targets` and look for `wasm32`), `python --version`.
   Report what's present before installing anything.
3. **Install only the missing tools for the chosen branches:**
   - Debian/Ubuntu: `sudo apt install git cmake clang lld llvm python3`
   - Windows: install git, CMake, LLVM, Python from official installers;
     Visual Studio Build Tools (MSVC) for `cui-app`.
   - `cui-style` alone needs nothing.
4. **Clone the projects** (skip a clone if not needed for the chosen
   branches — `cui-py` works with `pip install nexa-ui` alone):
   ```sh
   git clone https://github.com/yappologistic/CUI.git   # cui-app, cui-web
   git clone https://github.com/x017/nexa.git           # cui-py development only
   ```
   Put them where the user wants (suggest `~/Git/CUI`, `~/Git/nexa`).
5. **Record the clone paths** in `paths.json` at the root of this skill
   suite (replace `"null"` values with the absolute paths).
6. **Install the skills themselves** into the agent's skills directory if
   not already there (OpenCode: `~/.config/opencode/skills/`).
7. **Verify** one cheap check per branch:
   - `cui-app`: `cmake --version`, or configure the template
   - `cui-web`: `clang --print-targets | grep wasm32`
   - `cui-py`: `python -c "import nexa"` (after install)
   - `cui-style`: nothing to verify

Finish with a table: branch → tools found/installed → clone path →
verified or not.
