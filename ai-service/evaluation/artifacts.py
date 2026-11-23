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
    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise ArtifactError("invalid model manifest JSON") from exc
    models = raw.get("models")
    if not isinstance(models, list):
        raise ArtifactError("model manifest requires a models array")
    result = {}
    for item in models:
        if not isinstance(item, dict):
            raise ArtifactError("invalid model manifest entry")
        try:
            artifact_path = item.get("path")
            if artifact_path is None:
                artifact_path = item["artifact"]
            artifact = Artifact(
                id=item["id"], path=Path(artifact_path),
                version=item["version"], source=item["source"],
                license=item["license"], sha256=item["sha256"].lower(),
                approval=item["approval"],
            )
        except (KeyError, TypeError) as exc:
            raise ArtifactError("invalid model manifest entry") from exc
        if artifact.id in result:
            raise ArtifactError(f"duplicate model id: {artifact.id}")
        if not artifact.id or not artifact.version or not artifact.source or not artifact.license:
            raise ArtifactError(f"incomplete model metadata for {artifact.id}")
        if artifact.approval == "APPROVED":
            if len(artifact.sha256) != 64 or any(c not in "0123456789abcdef" for c in artifact.sha256):
                raise ArtifactError(f"approved artifact has invalid checksum: {artifact.id}")
            if "IMMUTABLE_COMMIT_REQUIRED" in artifact.source:
                raise ArtifactError(f"approved artifact requires immutable source: {artifact.id}")
        elif artifact.approval not in {"BLOCKED_UNVERIFIED_ARTIFACT", "BLOCKED_LICENSING_PROVENANCE"}:
            raise ArtifactError(f"unknown approval state for {artifact.id}")
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


def verify_status(artifact: Artifact, model_dir: Path) -> dict:
    if artifact.approval != "APPROVED":
        return {"id": artifact.id, "status": "blocked", "approval": artifact.approval}
    path = verify_artifact(artifact, model_dir)
    return {"id": artifact.id, "status": "verified", "approval": artifact.approval, "path": str(path)}

