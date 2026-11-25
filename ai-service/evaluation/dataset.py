from __future__ import annotations

import hashlib
import json
import os
import re
from pathlib import Path


class DatasetError(ValueError):
    pass


_EXCLUSIONS = {"group_photo", "minor", "unclear_consent", "ineligible"}
_PSEUDONYMOUS_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$")


def _hash(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def load_dataset(path: Path, root: Path, max_bytes: int = 25 * 1024 * 1024) -> list[dict]:
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise DatasetError("invalid dataset manifest JSON") from exc
    if not isinstance(raw, dict) or not isinstance(raw.get("dataset_id"), str) or not _PSEUDONYMOUS_ID.fullmatch(raw["dataset_id"]):
        raise DatasetError("dataset_id is required")
    if raw.get("authorization") != "authorized" or raw.get("dataset_type") not in {"synthetic", "authorized_non_production"}:
        raise DatasetError("dataset is not explicitly authorized non-production data")
    root = root.resolve()
    cases = raw.get("cases")
    if not isinstance(cases, list) or not cases:
        raise DatasetError("dataset requires cases")
    seen = set()
    validated = []
    for case in cases:
        if not isinstance(case, dict):
            raise DatasetError("dataset case must be an object")
        cid = case.get("id")
        if not isinstance(cid, str) or not _PSEUDONYMOUS_ID.fullmatch(cid) or cid in seen or any(x in cid.lower() for x in ("email", "phone", "visitor", "gallery")):
            raise DatasetError("invalid or identifying case id")
        seen.add(cid)
        if not isinstance(case.get("eligible"), bool):
            raise DatasetError(f"eligible must be a boolean for {cid}")
        exclusion = case.get("exclusion")
        if not case.get("eligible", False) and exclusion not in _EXCLUSIONS:
            raise DatasetError(f"invalid exclusion for {cid}")
        if not isinstance(case.get("path"), str):
            raise DatasetError(f"path is required for {cid}")
        if "expected_face_count" in case and (not isinstance(case["expected_face_count"], int) or isinstance(case["expected_face_count"], bool) or case["expected_face_count"] < 0):
            raise DatasetError(f"expected_face_count must be a non-negative integer: {cid}")
        if "labels" in case and not isinstance(case["labels"], dict):
            raise DatasetError(f"labels metadata must be an object: {cid}")
        rel = Path(case["path"])
        if rel.is_absolute() or ".." in rel.parts:
            raise DatasetError(f"unsafe dataset path for {cid}")
        if not case["eligible"]:
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
        checksum = case.get("sha256")
        if not isinstance(checksum, str) or len(checksum) != 64 or any(c not in "0123456789abcdefABCDEF" for c in checksum):
            raise DatasetError(f"eligible case requires a valid SHA256: {cid}")
        if _hash(candidate).lower() != checksum.lower():
            raise DatasetError(f"dataset checksum mismatch: {cid}")
        expected = case.get("expected_face_count")
        if not isinstance(expected, int) or isinstance(expected, bool) or expected < 0:
            raise DatasetError(f"expected_face_count must be a non-negative integer: {cid}")
        if exclusion:
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

