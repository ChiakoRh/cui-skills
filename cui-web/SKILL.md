---
name: cui-web
description: >
  Run CUI apps in the browser: compile the same C99 app to WebAssembly with
  plain clang (no Emscripten) and serve it on the CUI live site page, or
  deploy the static site anywhere. Covers the web-specific layer only — build
  scripts, browser constraints (no file I/O, no file dialogs), hosting and
  deployment. Use when the user wants a C/C++ app running as a web app with
  CUI, or asks about CUI's WASM/browser build. For native desktop apps use
  cui-app; for plain HTML/CSS sites in the CUI look (no WASM) use cui-style.
---

# cui-web

The CUI library itself (same ~210 components, same theming, same immediate
mode) compiled to WebAssembly and drawn with a WebGL2 port of its renderer.
Your C code runs unchanged in the browser. **The component API, layout,
theming, icons and app patterns are the `cui-app` skill's domain — read that
first (`api.md`, `patterns.md`); this skill only covers the web layer.**

Source of truth: a local clone of https://github.com/yappologistic/CUI -
setup records its absolute path in `paths.json` at the root of this skill
suite; if that file is missing, ask the user where their CUI clone is.
Key files inside the clone: `docs/getting-started.md` ("Run in the
browser"), `web/README.md`, `web/tools/build.sh`.

## The contract (what must be true of your app)

- `main` is `int main(void)` and hands a frame function to `cui_app_run`
  (the shape of `cui-app/template/main.c`) — no manual event loop.
- No real filesystem in the browser: the shim libc's `fopen` always returns
  `NULL`. Save/load via files silently does nothing — persist to
  `localStorage` via your own JS bridge or design stateless.
- Two app-layer calls are no-ops in the browser yet:
  `cui_app_file_dialog` (returns false) and `cui_app_open_url`.
- Android/iOS are not supported by CUI.

## Build and run (documented path)

Inside the CUI repo clone (the build uses the repo's `web/` host and shim):

```sh
cd <your CUI clone>
web/tools/build.sh app path\to\my_app.c      # more .c files may follow
web/tools/serve.sh                           # http://localhost:8765/#/app/my_app
```

Toolchain: **plain clang with the `wasm32` target + `wasm-ld` + `llvm-ar` +
python3**. No Emscripten, no sysroot, no downloads. On Debian/Ubuntu:
`sudo apt install clang lld llvm python3`.

**Verified end-to-end:** `cui-app/template/main.c` builds unchanged through
this exact path to `wasm/main.wasm` (~266 KB), serves on localhost, and all
assets return HTTP 200.

**Windows notes:** install LLVM (the installer adds `bin/` to PATH).
`serve.sh` calls `python3`, which the Windows Store stub shadows — make a
`python3` shim that runs `python` (`#!/bin/sh` + `exec python "$@"` on
Git Bash), or call `python -m http.server` yourself.

The app opens on the live site's page: theme + accent + renderer
(WebGL2 / software) + width controls in the top right, your source shown
beside the app. Each app gets its own WASM instance, so resets are exact.

`build.sh app` compiles with `-Dmain=web_app_main`, links against
`web/build/obj/web_host.o` + `libcui.a` + shim, writes
`web/site/wasm/<name>.wasm`, and copies your source to
`web/site/src/user/<name>.c`. The site opens any `#/app/<name>` for which a
module exists.

## Hosting your own copy

`web/site/` is plain static files — any static file server works, including
GitHub Pages. Deploy that folder (with your `wasm/<name>.wasm` in place) and
serve. For CI: an Ubuntu runner has clang/wasm-ld readily (`apt install lld
llvm`); build with `web/tools/build.sh app …` and upload `web/site/` as the
artifact. The repo's own `.github/workflows/pages.yml` is the reference.

Do not try to hand-assemble a minimal host page: the runtime
(`site/js/app.js` + `runtime.js` + `gl.js` + `catalog.js`) is the supported
way to load a module. Reuse it as-is.

## Which skill, when

| Goal | Skill |
|---|---|
| Desktop window (Windows/macOS/Linux) | `cui-app` |
| The same C app running in the browser (WASM) | `cui-web` |
| A plain HTML/CSS site or UI in the CUI look, no C/WASM | `cui-style` |

A CUI app can ship both ways from one codebase: `cui_app_run` in `main`
builds natively with CMake *and* as WASM with `build.sh app`.
