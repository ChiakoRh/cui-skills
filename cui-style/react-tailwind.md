# CUI style for React + Tailwind

The tokens are plain CSS variables, so they work in any stack. This file shows
the idiomatic React + Tailwind wiring.

## 1. Tailwind config (v3)

```js
// tailwind.config.js
module.exports = {
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        bg: 'var(--bg)',
        surface: 'var(--surface)',
        'surface-muted': 'var(--surface-muted)',
        'surface-sunk': 'var(--surface-sunk)',
        fg: 'var(--fg)',
        'text-2': 'var(--text-2)',
        'text-3': 'var(--text-3)',
        border: 'var(--border)',
        'border-subtle': 'var(--border-subtle)',
        'border-strong': 'var(--border-strong)',
        focus: 'var(--focus)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        danger: 'var(--danger)',
        'accent-red': 'var(--accent-red)',
        'accent-gold': 'var(--accent-gold)',
      },
      fontFamily: {
        sans: ['Geist', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['Geist Mono', 'ui-monospace', 'monospace'],
      },
      borderRadius: {
        card: '18px',
        inner: '12px',
        pill: '999px',
      },
      letterSpacing: {
        display: '-0.03em',
      },
      transitionTimingFunction: {
        cui: 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
    },
  },
};
```

Tailwind v4: put the same mappings in `@theme` inside your CSS instead.

## 2. Import tokens

```js
import './cui/tokens.css';
import './cui/components.css';
```

## 3. Components

```tsx
// Pill button — the two CUI button styles
export function Button({ primary, children, ...rest }: { primary?: boolean } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={`inline-flex h-10 items-center gap-2 rounded-pill px-[17px] font-medium transition duration-150 ease-cui hover:brightness-110 active:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--focus)] ${
        primary ? 'bg-fg text-bg border border-fg' : 'bg-surface text-fg border border-border hover:bg-surface-muted'
      }`}
      {...rest}
    >
      {children}
    </button>
  );
}

// Quiet card — 1px border, no shadow, ever
export function Card({ className = '', ...rest }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={`rounded-card border border-border bg-surface p-6 ${className}`} {...rest} />;
}

// Badge with the signature red dot
export function Badge({ name, tag }: { name: string; tag: string }) {
  return (
    <span className="inline-flex h-7 items-center gap-2.5 rounded-pill border border-border px-3.5 text-[12.5px] text-text-2">
      <span className="h-1.5 w-1.5 rounded-full bg-accent-red" />
      {name} <span className="text-text-3">·</span> {tag}
    </span>
  );
}

// Display heading — weight 500, tight tracking
export function Display({ children }: { children: React.ReactNode }) {
  return <h1 className="font-medium tracking-display leading-[1.15]">{children}</h1>;
}
```

## 4. Word-blur-in headline

```tsx
export function Words({ text, delay0 = 0, step = 0.07 }: { text: string; delay0?: number; step?: number }) {
  return (
    <>
      {text.split(' ').map((w, i) => (
        <span
          key={i}
          className="inline-block animate-[word_900ms_cubic-bezier(0.22,1,0.36,1)_both]"
          style={{ animationDelay: `${delay0 + i * step}s` }}
        >
          {w}&nbsp;
        </span>
      ))}
      <style>{`@keyframes word { 0% { opacity: 0; transform: translateY(.32em); filter: blur(10px); } }`}</style>
    </>
  );
}
```

## 5. Theme toggle

```tsx
function toggleTheme() {
  const h = document.documentElement;
  h.dataset.theme = h.dataset.theme === 'dark' ? 'light' : 'dark';
}
```

Dark-only project: set `<html data-theme="dark">` and never toggle.
