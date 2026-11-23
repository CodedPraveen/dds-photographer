from __future__ import annotations

from .artifacts import Artifact, ArtifactError, verify_artifact


class SFaceBlocked(ArtifactError):
    pass


def require_sface_approval(artifact: Artifact) -> None:
    # Deliberately reject before touching the filesystem or importing OpenCV.
    if artifact.approval != "APPROVED":
        raise SFaceBlocked(f"SFace is blocked: {artifact.approval}")


class SFaceAdapter:
    def __init__(self, artifact: Artifact, model_dir):
        require_sface_approval(artifact)
        self.path = verify_artifact(artifact, model_dir)
        raise NotImplementedError("SFace evaluation remains approval-gated and is not enabled")

