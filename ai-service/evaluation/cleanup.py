from __future__ import annotations

import shutil
import time
from pathlib import Path


def create_run_dir(root: Path) -> Path:
    root.mkdir(mode=0o700, parents=True, exist_ok=True)
    path = root / f"run-{time.time_ns()}"
    path.mkdir(mode=0o700)
    return path


def cleanup_run(path: Path) -> bool:
    try:
        if path.exists():
            shutil.rmtree(path)
        return not path.exists()
    except OSError:
        return False


def cleanup_stale(root: Path, max_age_seconds: int = 3600) -> int:
    removed = 0
    now = time.time()
    if not root.exists():
        return 0
    for path in root.iterdir():
        if path.is_dir() and now - path.stat().st_mtime > max_age_seconds and cleanup_run(path):
            removed += 1
    return removed

