from __future__ import annotations

import hashlib
import json
import os
from pathlib import Path


class DatasetError(ValueError):
    pass


_EXCLUSIONS = {"group_photo", "minor", "unclear_consent", "ineligible"}


def _hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_dataset(path: Path, root: Path, max_bytes: int = 25 * 1024 * 1024) -> list[dict]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    if raw.get("authorization") != "authorized" or raw.get("dataset_type") not in {"synthetic", "authorized_non_production"}:
        raise DatasetError("dataset is not explicitly authorized non-production data")
    if any(token in json.dumps(raw).lower() for token in ("production", "visitor", "gallery")) and raw.get("dataset_type") != "authorized_non_production":
        raise DatasetError("production data marker in dataset manifest")
    root = root.resolve()
    cases = raw.get("cases")
    if not isinstance(cases, list) or not cases:
        raise DatasetError("dataset requires cases")
    seen = set()
    validated = []
    for case in cases:
        cid = case.get("id")
        if not cid or cid in seen or any(x in cid.lower() for x in ("email", "phone", "visitor", "gallery")):
            raise DatasetError("invalid or identifying case id")
        seen.add(cid)
        exclusion = case.get("exclusion")
        if not case.get("eligible", False) and exclusion not in _EXCLUSIONS:
            raise DatasetError(f"invalid exclusion for {cid}")
        rel = Path(case.get("path", ""))
        if rel.is_absolute() or ".." in rel.parts:
            raise DatasetError(f"unsafe dataset path for {cid}")
        if not case.get("eligible", False):
            # Excluded cases are metadata-only fixtures. Do not stat, hash, decode,
            # or otherwise open their image before exclusion is enforced.
            validated.append({**case, "_path": None})
            continue
        unresolved = root / rel
        if unresolved.is_symlink():
            raise DatasetError(f"symlink dataset path is not allowed: {cid}")
        candidate = unresolved.resolve()
        if root not in candidate.parents or not candidate.is_file():
            raise DatasetError(f"dataset path escapes root or is missing: {cid}")
        if candidate.stat().st_size > max_bytes:
            raise DatasetError(f"dataset input is oversized: {cid}")
        if _hash(candidate).lower() != str(case.get("sha256", "")).lower():
            raise DatasetError(f"dataset checksum mismatch: {cid}")
        if case.get("eligible") and exclusion:
            raise DatasetError(f"eligible case has exclusion: {cid}")
        validated.append({**case, "_path": candidate})
    return validated


def validate_image(path: Path) -> None:
    try:
        import cv2
    except ImportError as exc:
        raise DatasetError("evaluation OpenCV dependency is not installed") from exc
    image = cv2.imread(os.fspath(path), cv2.IMREAD_COLOR)
    if image is None or image.size == 0:
        raise DatasetError(f"invalid or corrupt image: {path.name}")

