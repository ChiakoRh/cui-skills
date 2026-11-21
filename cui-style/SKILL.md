---
name: cui-style
description: >
  Build or restyle UIs, UX and themes in the CUI style (yappologistic/CUI docs
  look): neutral charcoal scale with only two accents, Geist typography at
  weight 500 with tight tracking, pill controls, quiet 1px-bordered surfaces
  with no shadows, word-blur-in motion, dithered monochrome art. Dark + light
  tokens included, framework-agnostic (CSS variables) with React/Tailwind
  recipes. Trigger: "cui style", "CUI theme", "restyle like CUI",
  "yappologistic style", "charcoal UI".
---
# cui-style

> Restyle or build any UI in the CUI look. The kit lives in this folder:
> `tokens.css`, `components.css`, `example.html`, `react-tailwind.md`,
> `cui.py` (scaffolder), `fonts/` (Geist, OFL license).

**Sibling skills:** for *native desktop apps* (C/C++) in this exact visual
language, use `cui-app` — the CUI library's theming layer (`docs/theming.md`
in its repo) speaks the same token language this kit implements in CSS.
For running an actual C/C++ app *in the browser* via WebAssembly, use
`cui-web`. Icons: on the web use [Lucide](https://lucide.dev) (that is the
icon set CUI embeds on the native side); stroke width 1.5–2, single color
from `--text-2` or `--accent-red`.

## The look, in one paragraph

Near-black neutral surfaces separated by 1px borders and small brightness
steps — never shadows, never gradients on surfaces. Geist: Medium (500) for
display with tight tracking (-0.03em), Regular for body, Geist Mono for
commands and code. One accent colour at most (signature pair: camellia red
`--accent-red`, gold `--accent-gold`); the greys carry the design. Motion is
soft and late-easing: `cubic-bezier(0.22, 1, 0.36, 1)`, words blur in one by
one, panels rise 14px and fade. Radius scale: cards 18px, inner 12px, pills
full. Everything is quiet; hierarchy comes from typography and spacing.

## Command

```
python <this-folder>/cui.py init [target]   # scaffold cui/tokens.css + components.css + fonts into <target>/cui/
python <this-folder>/cui.py preview         # open example.html in the browser
```

`init` copies self-contained files into the project (fonts included, works
offline) and nothing else — the reference page stays in the skill
(`cui.py preview`), so no demo file lands in your project or your git diff.
Then in HTML:

```html
<link rel="stylesheet" href="cui/tokens.css">
<link rel="stylesheet" href="cui/components.css">
```

Theme: `<html data-theme="dark">` (dark-only projects: never add a toggle,
that is the CUI profile convention) or toggle via `data-theme` for both.

### Dark without the white flash

`tokens.css` defaults to light, so a dark page must set the attribute before
first paint — inline, in `<head>`, above the stylesheets:

```html
<script>document.documentElement.dataset.theme = localStorage.getItem("theme") || "dark";</script>
```

Never set it from JS at the end of `<body>`: the page paints light first. Keep
`<meta name="theme-color">` in sync (`#121212` dark, `#ffffff` light).

### Icons — Lucide, and the one gotcha

```html
<script src="https://unpkg.com/lucide@0.460.0/dist/umd/lucide.min.js"></script>
```

```html
<i data-lucide="search"></i>
```

- Pin the version. `lucide` is a global; `lucide.createIcons()` swaps every
  `<i data-lucide="name">` for an SVG.
- **Re-run `createIcons()` after every `innerHTML` you inject** — cards, toast,
  button labels, theme icon. Elements rendered after the first call stay
  invisible. This is the number one silent failure.
- Size/color come from CSS: `i[data-lucide], svg { width: 16px; height: 16px; }`
  with `color: var(--text-2)`; accent only on one meaningful icon.
- **Swapping emoji labels for icons? Strip the emoji from every label
  source** — the HTML *and* the i18n dictionary strings. An emoji beside its
  icon replacement looks doubled, and the strings that only surface after a
  language switch are the ones you will miss. (Seen in practice.)
- Offline / no-CDN build (Iran or an intranet): download once and commit the
  file — this exact URL is tested:

  ```sh
  curl -sL -o cui/lucide.min.js https://cdn.jsdelivr.net/npm/lucide@0.460.0/dist/umd/lucide.min.js
  ```

  ```html
  <script src="cui/lucide.min.js" defer></script>
  ```

  A missing CDN leaves empty gaps, not a broken layout.

### Persian / RTL

Geist has **no Arabic-script glyphs**. Load a Persian font and put it after
Geist in the stack — Vazirmatn is the good default (`400/500`, OFL):

```html
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;500&display=swap" rel="stylesheet">
```

Self-host instead (offline / blocked CDN) — both URLs tested:

```sh
curl -sL -o cui/fonts/Vazirmatn-Regular.woff2 https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Regular.woff2
curl -sL -o cui/fonts/Vazirmatn-Medium.woff2  https://cdn.jsdelivr.net/gh/rastikerdar/vazirmatn@v33.003/fonts/webfonts/Vazirmatn-Medium.woff2
```

```css
@font-face { font-family: 'Vazirmatn'; src: url('fonts/Vazirmatn-Regular.woff2') format('woff2'); font-weight: 400; font-display: swap; }
@font-face { font-family: 'Vazirmatn'; src: url('fonts/Vazirmatn-Medium.woff2') format('woff2'); font-weight: 500; font-display: swap; }
```

```css
:root { --font-fa: 'Vazirmatn', 'Geist', system-ui, sans-serif; }
[lang="fa"] body { font-family: var(--font-fa); }
input, button, select, textarea { font-family: inherit; }  /* form controls do not inherit */
```

- Persian text is always RTL, even when the page is `dir="ltr"` for an English
  mode: switch `document.documentElement.dir` with the language and never wrap
  Persian paragraphs in `dir="ltr"`.
- Use logical properties so one rule works both ways:
  `padding-inline-start`, `margin-inline-start`, `inset-inline-start` — not
  `left`/`right`. A leading search icon is `padding-inline-start: 40px` in both
  directions.
- Digits stay Latin (`0-9`) inside Persian prose.

## Tokens (dark shown; light mirrors in tokens.css)

| Role | Var | Dark |
|---|---|---|
| Page bg | `--bg` | `#121212` |
| Surface | `--surface` | `#181818` |
| Muted surface | `--surface-muted` | `#1f1f1f` |
| Sunk surface | `--surface-sunk` | `#0e0e0e` |
| Foreground | `--fg` | `#f2f2f2` |
| Text 2 / 3 | `--text-2` / `--text-3` | `#b4b4b4` / `#8c8c8c` |
| Border / subtle / strong | `--border` / `--border-subtle` / `--border-strong` | `#2b2b2b` / `#222222` / `#676767` |
| Accents (signature pair) | `--accent-red` / `--accent-gold` | `#e0525b` / `#e8c46a` |
| Status | `--success` / `--warning` / `--danger` / `--focus` | `#55d69f` / `#f2bd68` / `#f2716c` / `#55adff` |

Do not introduce other colours. Status colours are for states only, not
decoration.

## Rules when building or restyling a UI

1. **Map, don't invent.** Existing colours map onto the token scale: page bg
   → `--bg`, panels → `--surface*`, text → `--fg/--text-2/--text-3` by
   prominence, lines → `--border*`. If the old design had a brand accent, use
   `--accent-red` or `--accent-gold` for it — one accent, not a rainbow.
2. **Kill shadows.** Replace every box-shadow with a 1px `--border` border and
   a one-step darker/lighter surface. This is the single most important move.
3. **Pills for actions.** Buttons, badges, chips, command bars → `--r-pill`.
   Cards → `--r-card` (18px), nested panels → `--r-inner`.
4. **Typography carries hierarchy.** Display = Geist 500, `letter-spacing:
   -0.03em`, line-height 1.15, sizes 46/30/19. Body = Geist 400. Commands,
   numbers, metadata = Geist Mono. Never bold body text; use `--text-2/3`
   instead.
5. **Motion is one family.** Only `--ease` with the four keyframes from
   `components.css` (`rise`, `word`, `fadein`, `grow`). Stagger words 70ms,
   cards 60ms. Always keep the `prefers-reduced-motion` guard.
6. **Accents touch only what matters.** Red/gold on: one headline word, the
   badge dot, the snake/star data, one bar segment. Nowhere else.
7. **Framework-agnostic.** Plain HTML/CSS: use `tokens.css` +
   `components.css` and class names from `example.html`. React/Tailwind: use
   the mapping in `react-tailwind.md`. Other stacks: emit the same CSS
   variables and follow the rules above; never port the style to SCSS
   constants or JS objects — keep it one `tokens.css`.
8. **Keep it accessible.** Body text on `--bg` is `--fg` (≥ 15:1); secondary
   text is `--text-2` (≥ 7:1). Never put `--text-3` on `--accent-red`.
   Focus-visible rings use `--focus`. Respect reduced motion.
9. **Art direction (optional, for hero/footers).** Monochrome dithered
   imagery: square dots on a Bayer 4×4 threshold, palette = the dot greys
   `#f2f2f2/#b4b4b4/#7a7a7a/#4a4a4a` plus the accent pair; dissolve with a
   radial weight (visible center → transparent edge). A reference
   implementation ships as `scripts/dither.py` in the example profile repo.

## Restyle workflow for an existing project

1. Read the current styles: find the palette (CSS vars, Tailwind config, or
   hardcoded hexes) and map each to the token table above. Note anything with
   no natural token (vivid brand colour → accent; gradients → remove or
   flatten to surface step).
2. Run `cui.py init` (or inline the variables), wire the fonts.
3. Apply rules 2–5 globally (shadows → borders, radius, typography, motion).
4. Re-point one-off components (modals, inputs, tables) at the token vars —
   do not leave hardcoded hexes behind.
5. Check both themes if the project ships both; dark-only projects stay
   dark-only (CUI profile convention).
6. Verify in a real browser before calling it done: screenshot at a few
   widths (320 / 768 / 1024 / 1440) and read the console. Every real-world
   run of this skill so far found its only real bug exactly this way.

When unsure, open `example.html` (or `cui.py preview`) — it is the reference
for spacing, hierarchy and motion timing.
