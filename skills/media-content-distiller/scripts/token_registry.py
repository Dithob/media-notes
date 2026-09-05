#!/usr/bin/env python3
"""Legacy Python wrapper for the skill-owned Token registry CLI."""

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
            "Token registry 的 Python 兼容入口需要 Node.js 18+；"
            "请直接使用 media-content-distiller CLI"
        )
    if not CLI.is_file():
        raise SystemExit(f"找不到 skill-owned Node CLI：{CLI}")
    # os.execv duplicates argv[0] into the command line on Windows (node then
    # tries to load its own path as a module); subprocess.call keeps stdout
    # passing straight through, so Node's UTF-8 output is preserved.
    raise SystemExit(subprocess.call([node, str(CLI), "--", *sys.argv[1:]]))


if __name__ == "__main__":
    main()
