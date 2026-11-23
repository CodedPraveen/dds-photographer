from __future__ import annotations

import time
from pathlib import Path

from .artifacts import Artifact, require_approved, verify_artifact


class YuNetError(RuntimeError):
    pass


class YuNetAdapter:
    def __init__(self, artifact: Artifact, model_dir: Path, confidence: float = 0.9, cv2_module=None):
        require_approved(artifact)
        self._path = verify_artifact(artifact, model_dir)
        try:
            cv2 = cv2_module or __import__("cv2")
        except ImportError:
            raise YuNetError("OpenCV evaluation dependency is not installed") from None
        self.cv2 = cv2
        started = time.perf_counter()
        try:
            self.detector = cv2.FaceDetectorYN.create(str(self._path), "", (320, 320), confidence, 0.3, 5000, cv2.dnn.DNN_BACKEND_OPENCV, cv2.dnn.DNN_TARGET_CPU)
        except Exception:
            raise YuNetError("YuNet model initialization failed") from None
        self.model_load_ms = (time.perf_counter() - started) * 1000

    def detect(self, image_path: Path) -> tuple[int, float, float]:
        try:
            image = self.cv2.imread(str(image_path), self.cv2.IMREAD_COLOR)
        except Exception:
            raise YuNetError("YuNet image reading failed") from None
        if image is None:
            raise YuNetError("invalid image")
        return self.detect_image(image)

    def detect_image(self, image):
        if image is None or getattr(image, "ndim", 0) != 3 or image.shape[2] != 3:
            raise YuNetError("invalid image")
        started = time.perf_counter()
        faces, latency = self.detect_faces(image)
        count = 0 if faces is None else len(faces)
        confidence = 0.0 if count == 0 else float(max(face[-1] for face in faces))
        return count, confidence, latency

    def detect_faces(self, image):
        height, width = image.shape[:2]
        try:
            self.detector.setInputSize((width, height))
            started = time.perf_counter()
            _, faces = self.detector.detect(image)
        except Exception:
            raise YuNetError("YuNet inference failed") from None
        latency = (time.perf_counter() - started) * 1000
        return faces, latency

