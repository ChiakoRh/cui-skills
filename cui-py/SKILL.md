---
name: cui-py
description: >-
  Build desktop UIs in Python with nexa (PyPI: nexa-ui), the official Python
  port of CUI: same 210+ components, same tokens, zero Python dependencies,
  value-returning immediate mode, OOP Application/Component/Router/Store,
  asyncio support, RTL/Persian shaping on by default, headless screenshot
  testing. Use when the user wants a Python desktop GUI, says "nexa",
  "cui python", or asks to port a CUI app to Python. For the C/C++ library
  use cui-app; for its WASM build use cui-web; for CSS-only web UIs use
  cui-style.
---

# cui-py

`nexa` (`pip install nexa-ui`, imported as `import nexa as ui`) is the
official Python port of CUI by x017/Parsa Mohammadian: the same ~210
components and token system, driven from Python through `ctypes` over a
~1.1 MB C99 core (no runtime Python deps; ~48 ms warm import).

**Component names, theming, tokens, tones and icons are identical to
`cui-app`** — read that skill for component semantics and the CUI visual
language; this skill covers the Python layer only.

Source of truth: a local clone of https://github.com/x017/nexa — its
absolute path is recorded in `paths.json` at the repo root (written by
setup; clone it only for development — `pip install nexa-ui` suffices to
use the library). Docs in `docs/`, also at https://parsa.x017.ir/nexa/.

## Install (verified)

```bash
pip install nexa-ui          # NOT "nexa" — that PyPI name is an unrelated package
```

From a checkout: `pip install -e .` (needs any C99 compiler — MSVC `cl`
works; no CMake, no python-dev). Rebuild the native lib anytime:
`python -m nexa.build` (RTL shaping is on by default; `--no-rtl` drops it).

Never name your own project folder/file `nexa` or `nexa.py` — it shadows
the installed package.

## Mental model (what differs from the C API)

1. **Value-returning immediate mode**: widgets take a value, return the new
   value; your Python variables are the single source of truth.
   `name = ui.input("id", name)`, `dark = ui.switch("Dark", dark)`,
   `if ui.button("Save"): ...` (True on click frame).
2. **Transition flags**: `ui.changed()`, `ui.submitted()` (Enter),
   `ui.focused()`, `ui.blurred()` — after the widget that fired.
3. **IDs**: first string arg is the ID key; `label##hidden` syntax; wrap
   every loop iteration in `with ui.id_scope(item_id):` (OOP `Component`
   does it automatically).
4. **Two scope kinds**:
   - Unconditional (`box row column stack grid card scroll split id_scope
     disabled_scope clip_scope …`): children always render.
   - **Conditional** (`dialog sheet popover menu accordion tree table
     data_grid …`): must bind `as s:` and check `if s:` — children build
     only when open. This is the #1 beginner bug.
5. **Styles**: three coexisting — functional `ui.run(draw)`, procedural
   `ctx: ui.UI`, OOP `ui.Application` + `ui.Component` + `ui.Router`/
   `ui.View` + `ui.Store[T]`. Same widget names in all three.
6. **Idle cost**: blocks in the OS event loop, 0% CPU idle, 60–120 fps
   springs when active; `app.wake()` from background threads.

## RTL / Persian (on by default)

- Shaping + BiDi built in (`fonts.supports_text_shaping()` → True).
- Layout does NOT flip: pass `direction=ui.TextDirection.RTL` (or `AUTO`
  for mixed) on `text box row column grid stack`.
- Font: `ctx.use_rtl_font()` picks first of Vazirmatn/Viraz/Sahel/… or
  `ctx.use_font("path.ttf")` / `ctx.use_rtl_font("Vazirmatn")`.
- Localize calendars: `ctx.set_strings(months=[...], weekdays=[...],
  today="امروز")`.
- Explicit LRE/RLE/PDF control chars are ignored — use `direction=`.
- Emoji are separate: `ctx.load_emoji_font()` then `ui.emoji(...)`.

## Headless test (CI / no display)

```bash
NEXA_HEADLESS=1 CUI_SCREENSHOT=preview.png CUI_SCREENSHOT_FRAMES=10 python app.py
```

Renders pixel-identical frames off-screen to PNG — use it to verify any UI
change without a window. On Linux/CI it falls back to the CPU
`SoftwareRenderer` automatically when no display exists.

## Theming (Python side — same tokens as CUI)

```python
ui.run(draw, accent=ui.Accent.BLUE, theme=ui.ThemeMode.DARK)   # 8 accents
ui.badge("...", tone=ui.Tone.ACCENT)          # 9 semantic tones
ctx.theme["corner_radius"] = 10               # 34 live Token slots, OKLCH math
ctx.theme["ui_scale"] = 1.1
```

Fonts: `ctx.use_font("path.ttf")`, roles `ui.FontRole.MONO`; icons are the
same 168 `ui.Icon.*` constants (dynamic `ui.icon("plus")` lookup too).
Full details: `docs/theming-and-styling.md`.

## OOP style (for multi-screen apps)

```python
class Home(ui.View): ...                      # one class per screen
app = ui.Application(title="X")
app.router.register("/home", Home)            # navigation
count = ui.Store(0)                           # reactive; notifies + wakes window
```

`ui.Application` (frame lifecycle), `ui.Component` (reusable widget class —
auto ID isolation, no manual `id_scope`), `ui.Store[T]` (mutate in place or
return new value). Full walkthrough: `docs/tutorial-oop.md`.

## Concurrency

`BackgroundRunner` (`submit`, `stream`, `fetch_json`, `fetch_bytes`),
MPSC `Channel`, `await app.run_async(...)`, `AsyncBridge` for threads;
`app.wake()` from any thread. Details: `docs/concurrency-and-async.md`.

## Docs map (`<your nexa clone>/docs/`)

| Question | File |
|---|---|
| Install, first window, IDs, scopes, transitions | `getting-started.md` |
| Functional/procedural style, layouts, forms | `tutorial-functional.md` |
| OOP: Application/Component/Router/Store | `tutorial-oop.md` |
| Accents, tones, tokens, fonts, RTL, icons | `theming-and-styling.md` |
| Async, threads, networking | `concurrency-and-async.md` |
| Every widget signature (190+ across 22 domains) | `components-reference.md` |
| Canvas, headless pytest, packaging | `advanced-rendering-and-packaging.md` |
| Full course (11 modules) | `zero-to-hero.md` |

## Windows build notes

- `make doctor` (or `python tools/doctor.py`) diagnoses broken checkouts.
- Old `_native/` lib after upgrade: detected by stamp mismatch and rebuilt
  once automatically; force with `python -m nexa.build` or delete
  `src/nexa/_native/`.
- `AttributeError: undefined symbol: cui_…_ex` = stale lib (see above).
- Editable install pointing at another checkout: `python -c "import nexa;
  print(nexa.__file__)"` to check.

## Which CUI skill, when

| Goal | Skill |
|---|---|
| C/C++ desktop app (Win/macOS/Linux) | `cui-app` |
| The same C app in the browser (WASM) | `cui-web` |
| **Python desktop app (nexa)** | `cui-py` |
| Plain HTML/CSS site in the CUI look | `cui-style` |
