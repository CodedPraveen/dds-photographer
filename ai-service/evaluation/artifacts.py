from __future__ import annotations

import hashlib
import json
from dataclasses import dataclass
from pathlib import Path


class ArtifactError(ValueError):
    pass


@dataclass(frozen=True)
class Artifact:
    id: str
    path: Path
    version: str
    source: str
    license: str
    sha256: str
    approval: str


def load_manifest(path: Path) -> dict[str, Artifact]:
    raw = json.loads(path.read_text(encoding="utf-8"))
    models = raw.get("models")
    if not isinstance(models, list):
        raise ArtifactError("model manifest requires a models array")
    result = {}
    for item in models:
        try:
            artifact = Artifact(
                id=item["id"], path=Path(item.get("path", item["artifact"])),
                version=item["version"], source=item["source"],
                license=item["license"], sha256=item["sha256"].lower(),
                approval=item["approval"],
            )
        except (KeyError, TypeError) as exc:
            raise ArtifactError("invalid model manifest entry") from exc
        if artifact.id in result or not artifact.sha256 or len(artifact.sha256) != 64:
            raise ArtifactError(f"invalid or missing checksum for {artifact.id}")
        if any(c not in "0123456789abcdef" for c in artifact.sha256):
            raise ArtifactError(f"invalid checksum for {artifact.id}")
        if "IMMUTABLE_COMMIT_REQUIRED" in artifact.source:
            raise ArtifactError(f"immutable source required for {artifact.id}")
        result[artifact.id] = artifact
    return result


def sha256_file(path: Path, chunk_size: int = 1024 * 1024) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(chunk_size), b""):
            digest.update(chunk)
    return digest.hexdigest()


def verify_artifact(artifact: Artifact, model_dir: Path) -> Path:
    if not artifact.path.is_absolute():
        path = (model_dir / artifact.path).resolve()
    else:
        path = artifact.path.resolve()
    root = model_dir.resolve()
    if root not in path.parents or not path.is_file():
        raise ArtifactError(f"missing model artifact: {artifact.id}")
    if sha256_file(path) != artifact.sha256:
        raise ArtifactError(f"checksum mismatch: {artifact.id}")
    return path


def require_approved(artifact: Artifact) -> None:
    if artifact.approval != "APPROVED":
        raise ArtifactError(f"{artifact.id} is not approved: {artifact.approval}")

