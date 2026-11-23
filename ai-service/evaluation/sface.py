from __future__ import annotations

import json
import math
import re
import time
from pathlib import Path
from typing import Callable

from .artifacts import Artifact, ArtifactError, verify_artifact
from .dataset import DatasetError, load_dataset
from .metrics import classification_metrics


class SFaceBlocked(ArtifactError):
    pass


class SFaceError(ValueError):
    pass


_PSEUDONYMOUS_ID = re.compile(r"^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$")


def require_sface_approval(artifact: Artifact) -> None:
    if artifact.approval != "APPROVED":
        raise SFaceBlocked(f"SFace is blocked: {artifact.approval}")


def _as_detection(detection):
    try:
        import numpy as np
        value = np.asarray(detection, dtype=np.float32)
    except (ImportError, TypeError, ValueError) as exc:
        raise SFaceError("invalid face detection") from exc
    if value.ndim == 2 and value.shape[0] == 1:
        value = value[0]
    if value.ndim != 1 or value.size < 15 or not np.isfinite(value).all():
        raise SFaceError("face detection must contain 15 finite values")
    if value[2] <= 0 or value[3] <= 0:
        raise SFaceError("face detection dimensions must be positive")
    return value.reshape(1, -1)


class SFaceAdapter:
    def __init__(self, artifact: Artifact, model_dir: Path, cv2_module=None):
        require_sface_approval(artifact)
        self.path = verify_artifact(artifact, model_dir)
        try:
            started = time.perf_counter()
            self.cv2 = cv2_module or __import__("cv2")
            self.recognizer = self.cv2.FaceRecognizerSF.create(
                str(self.path), "", self.cv2.dnn.DNN_BACKEND_OPENCV, self.cv2.dnn.DNN_TARGET_CPU
            )
            self.model_load_ms = (time.perf_counter() - started) * 1000
        except (AttributeError, ImportError, RuntimeError, TypeError, ValueError):
            raise SFaceError("unable to initialize OpenCV FaceRecognizerSF") from None
        except Exception:
            raise SFaceError("unable to initialize OpenCV FaceRecognizerSF") from None

    def extract_embedding(self, image, detection):
        try:
            import numpy as np
            image_array = np.asarray(image)
        except (ImportError, TypeError, ValueError) as exc:
            raise SFaceError("invalid image") from exc
        if image_array.ndim != 3 or image_array.shape[2] != 3 or image_array.size == 0 or not np.isfinite(image_array).all():
            raise SFaceError("image must be a finite non-empty BGR image")
        face = _as_detection(detection)
        try:
            aligned = self.recognizer.alignCrop(image_array, face)
            embedding = self.recognizer.feature(aligned)
            vector = np.asarray(embedding, dtype=np.float32)
        except (RuntimeError, TypeError, ValueError):
            raise SFaceError("SFace inference failed") from None
        except Exception:
            raise SFaceError("SFace inference failed") from None
        if vector.ndim == 2 and vector.shape[0] == 1:
            vector = vector[0]
        if vector.ndim != 1 or vector.size == 0 or not np.isfinite(vector).all():
            raise SFaceError("embedding must be a finite non-empty vector")
        norm = float(np.linalg.norm(vector))
        if not math.isfinite(norm) or norm == 0:
            raise SFaceError("embedding norm must be non-zero")
        return vector

    @staticmethod
    def cosine_similarity(first, second) -> float:
        try:
            import numpy as np
            left = np.asarray(first, dtype=np.float32).reshape(-1)
            right = np.asarray(second, dtype=np.float32).reshape(-1)
        except (ImportError, TypeError, ValueError) as exc:
            raise SFaceError("invalid embedding") from exc
        if left.size == 0 or left.size != right.size or not np.isfinite(left).all() or not np.isfinite(right).all():
            raise SFaceError("embeddings must be finite and have equal non-zero shape")
        denominator = float(np.linalg.norm(left) * np.linalg.norm(right))
        if denominator == 0 or not math.isfinite(denominator):
            raise SFaceError("embedding norm must be non-zero")
        return float(np.dot(left, right) / denominator)


def load_pairs(manifest_path: Path, dataset_root: Path) -> tuple[list[dict], list[dict]]:
    cases = load_dataset(manifest_path, dataset_root)
    try:
        raw = json.loads(manifest_path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as exc:
        raise DatasetError("invalid pair manifest JSON") from exc
    pairs = raw.get("pairs")
    if not isinstance(pairs, list) or not pairs:
        raise DatasetError("dataset requires a pairs array")
    by_id = {case["id"]: case for case in cases}
    seen = set()
    validated = []
    for pair in pairs:
        if not isinstance(pair, dict) or not isinstance(pair.get("id"), str) or not pair["id"] or not _PSEUDONYMOUS_ID.fullmatch(pair["id"]) or pair["id"] in seen:
            raise DatasetError("pair IDs must be unique strings")
        if not isinstance(pair.get("left"), str) or not isinstance(pair.get("right"), str):
            raise DatasetError(f"invalid pair references: {pair.get('id')}")
        if pair["left"] not in by_id or pair["right"] not in by_id:
            raise DatasetError(f"pair references unknown case: {pair['id']}")
        if pair["left"] == pair["right"]:
            raise DatasetError(f"self-pair is not allowed: {pair['id']}")
        pair_key = tuple(sorted((pair["left"], pair["right"])))
        if any(existing["_key"] == pair_key for existing in validated):
            raise DatasetError(f"duplicate or reversed pair: {pair['id']}")
        if not by_id[pair["left"]]["eligible"] or not by_id[pair["right"]]["eligible"]:
            raise DatasetError(f"pair references ineligible case: {pair['id']}")
        if not isinstance(pair.get("same"), bool):
            raise DatasetError(f"pair label must be boolean: {pair['id']}")
        for case_id in (pair["left"], pair["right"]):
            if by_id[case_id].get("expected_face_count") != 1:
                raise DatasetError(f"SFace pairs require expected_face_count=1: {pair['id']}")
        seen.add(pair["id"])
        validated.append({"id": pair["id"], "left": pair["left"], "right": pair["right"], "same": pair["same"], "_key": pair_key})
    for pair in validated:
        pair.pop("_key", None)
    return cases, validated


def evaluate_pairs(cases: list[dict], pairs: list[dict], adapter: SFaceAdapter, detector: Callable, threshold: float = 0.363, image_loader: Callable | None = None) -> dict:
    if not math.isfinite(threshold) or threshold < -1 or threshold > 1:
        raise SFaceError("threshold must be finite and within [-1, 1]")
    by_id = {case["id"]: case for case in cases}
    if image_loader is None:
        try:
            import cv2
            image_loader = lambda path: cv2.imread(str(path), cv2.IMREAD_COLOR)
        except ImportError as exc:
            raise SFaceError("OpenCV evaluation dependency is not installed") from exc
    embeddings = {}
    for case_id in {ref for pair in pairs for ref in (pair["left"], pair["right"])}:
        image = image_loader(by_id[case_id]["_path"])
        if image is None:
            raise SFaceError(f"invalid image for case {case_id}")
        detection = detector(image)
        if detection is None or len(detection) != 1:
            raise SFaceError(f"expected exactly one detected face for case {case_id}")
        embeddings[case_id] = adapter.extract_embedding(image, detection[0])
    labels = []
    predictions = []
    for pair in pairs:
        score = adapter.cosine_similarity(embeddings[pair["left"]], embeddings[pair["right"]])
        labels.append(pair["same"])
        predictions.append(score >= threshold)
    return {"pair_count": len(pairs), "threshold": threshold, "reference_threshold": 0.363, **classification_metrics(labels, predictions)}

