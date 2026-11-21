"""cui-style scaffolder.

Usage:
  python cui.py init [target]     # scaffold tokens + components + fonts into target (default: cwd)
  python cui.py preview           # open the bundled example.html in the browser
"""
from __future__ import annotations

import shutil
import sys
import webbrowser
from pathlib import Path

SKILL = Path(__file__).resolve().parent


def init(target: Path) -> None:
    target.mkdir(parents=True, exist_ok=True)
    dst_css = target / "cui"
    dst_css.mkdir(exist_ok=True)
    for f in ("tokens.css", "components.css"):
        shutil.copy2(SKILL / f, dst_css / f)
    shutil.copytree(SKILL / "fonts", dst_css / "fonts", dirs_exist_ok=True)
    print(f"scaffolded {dst_css}")
    print('link them in your HTML: <link rel="stylesheet" href="cui/tokens.css">\n'
          '                         <link rel="stylesheet" href="cui/components.css">\n'
          'reference page: python cui.py preview')


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "init":
        target = Path(sys.argv[2]) if len(sys.argv) > 2 else Path.cwd()
        init(target)
    elif cmd == "preview":
        webbrowser.open((SKILL / "example.html").as_uri())
    else:
        print(__doc__)
        sys.exit(1)


if __name__ == "__main__":
    main()
