# cui-skills

Four agent skills for building UIs with [CUI](https://github.com/yappologistic/CUI)
(same visual language across C, WebAssembly, Python and CSS):

| Skill | What it covers | Stack |
|---|---|---|
| `cui-app` | Native desktop apps: ~210 components, theming, patterns, MSVC pitfalls, starter template | C99 + CMake |
| `cui-web` | The same C app compiled to WebAssembly and served on CUI's live site | clang `wasm32`, no Emscripten |
| `cui-py` | Desktop apps in Python via [nexa](https://github.com/x017/nexa) (the official CUI port, PyPI `nexa-ui`) | Python 3.9+ |
| `cui-style` | Plain HTML/CSS sites and UIs in the CUI look: tokens, Lucide icons, RTL/Persian, restyle workflow | CSS only |

All four share one token system — read them together when matching the CUI
visual language. `cui-app` is the reference for components and theming;
the others cover their own layer and point back to it.

## Requirements per skill

| Skill | Needs installed | Needs cloned |
|---|---|---|
| `cui-app` | git, CMake 3.14+, a C compiler (Visual Studio Build Tools / gcc / clang) | CUI |
| `cui-web` | git, clang with `wasm32` target (LLVM), Git Bash, python3 | CUI |
| `cui-py` | Python 3.9+ (`pip install nexa-ui`); a C compiler only when building from source | nexa (optional, for dev) |
| `cui-style` | nothing — a browser | no |

## Setup (for AI agents)

When a user asks to set up these skills, follow this flow. **Only install
what the skills they actually need require** — ask first which of the four
they want (native C, WASM, Python, or CSS).

1. **Ask** which skill branch the user needs. Multiple is fine; install the
   union of their requirements, nothing more.
2. **Check tools already present** before installing anything:
   `git --version`, `cmake --version`, `clang --version` (needs `wasm32` in
   `--print-targets` for `cui-web`), `python --version`.
   - Missing on Debian/Ubuntu: `sudo apt install git cmake clang lld llvm python3`
   - Missing on Windows: install git, CMake, LLVM (clang), Python from
     their official installers; Visual Studio Build Tools for `cui-app`.
3. **Clone the projects** for the branches chosen, into a location the user
   approves (suggest `~/Git/CUI` and `~/Git/nexa`; any path works):
   ```sh
   git clone https://github.com/yappologistic/CUI.git <CUI-path>     # cui-app, cui-web
   git clone https://github.com/x017/nexa.git <nexa-path>            # cui-py (dev only)
   ```
   For `cui-py` alone, `pip install nexa-ui` is enough — no clone needed.
4. **Record the paths** in `paths.json` at the repo root (replace the
   `null`s with the absolute paths). Every skill reads its source-of-truth
   location from there, so skills stay portable across machines.
5. **Verify**: run one cheap check per installed branch —
   `cmake --version` / a hello build (`cui-app`), `clang --print-targets |
   grep wasm32` (`cui-web`), `python -c "import nexa"` (`cui-py`).

## Installing the skills into an agent

Copy (or symlink) the skill folders into the agent's skills directory, for
example OpenCode: `~/.config/opencode/skills/`. Keep `paths.json` at the
root of wherever these four folders live; agents resolve clone locations
from it.

## Notes

- The skills were written from real build/test sessions on Windows and
  Linux; the pitfalls tables (MSVC `C2099`, conditional scopes, stale WASM
  builds) come from hits, not from reading docs.
- RTL/Persian support is covered in all layers: `cui-app` (direction flag +
  shaping build), `cui-py` (shaping on by default), `cui-style` (fonts,
  logical properties, always-RTL rules).
