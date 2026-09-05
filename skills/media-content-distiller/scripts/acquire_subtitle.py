#!/usr/bin/env python3
"""Legacy Python entry point for media-content-distiller.

The skill-owned Node.js CLI is the single implementation. This wrapper keeps
the historical ``python3 scripts/acquire_subtitle.py ...`` command shape while
avoiding a second API client, credential resolver, and artifact writer.
"""

from __future__ import annotations

import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CLI = ROOT / "bin" / "media-content-distiller.mjs"


def main() -> None:
    node = shutil.which("node")
    if not node:
        raise SystemExit(
            "Python 兼容入口需要 Node.js 18+；请直接安装 media-content-distiller CLI"
        )
    if not CLI.is_file():
        raise SystemExit(f"找不到 skill-owned Node CLI：{CLI}")
    # os.execv duplicates argv[0] into the command line on Windows (node then
    # tries to load its own path as a module); subprocess.call keeps stdout
    # passing straight through, so Node's UTF-8 output is preserved.
    raise SystemExit(subprocess.call([node, str(CLI), "--", *sys.argv[1:]]))


if __name__ == "__main__":
    main()
