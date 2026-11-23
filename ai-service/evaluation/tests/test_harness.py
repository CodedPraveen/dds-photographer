import hashlib
import json
from pathlib import Path

import pytest

from evaluation.artifacts import Artifact, ArtifactError, load_manifest, verify_artifact
from evaluation.cleanup import cleanup_run, cleanup_stale, create_run_dir
from evaluation.dataset import DatasetError, load_dataset
from evaluation.metrics import classification_metrics, latency_summary
from evaluation.sface import SFaceBlocked, require_sface_approval


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_artifact_checksum_and_failure(tmp_path):
    model = tmp_path / "model.onnx"; model.write_bytes(b"model")
    artifact = Artifact("x", Path("model.onnx"), "v", "commit", "MIT", digest(model), "APPROVED")
    assert verify_artifact(artifact, tmp_path) == model
    bad = Artifact("x", Path("model.onnx"), "v", "commit", "MIT", "0" * 64, "APPROVED")
    with pytest.raises(ArtifactError): verify_artifact(bad, tmp_path)


def test_sface_gate_blocks_before_loading(tmp_path):
    artifact = Artifact("sface", Path("missing.onnx"), "v", "commit", "Apache-2.0", "1" * 64, "BLOCKED_LICENSING_PROVENANCE")
    with pytest.raises(SFaceBlocked): require_sface_approval(artifact)


def test_dataset_rejects_traversal_and_unauthorized(tmp_path):
    image = tmp_path / "image.bin"; image.write_bytes(b"x")
    base = {"dataset_id": "x", "dataset_type": "synthetic", "authorization": "authorized", "cases": []}
    (tmp_path / "m.json").write_text(json.dumps({**base, "cases": [{"id": "x", "path": "../image.bin", "sha256": digest(image), "eligible": True}]}))
    with pytest.raises(DatasetError): load_dataset(tmp_path / "m.json", tmp_path)


def test_exclusion_is_validated_without_image_processing(tmp_path):
    image = tmp_path / "group.bin"; image.write_bytes(b"not-an-image")
    manifest = {"dataset_id": "x", "dataset_type": "synthetic", "authorization": "authorized", "cases": [{"id": "group", "path": "group.bin", "sha256": digest(image), "eligible": False, "exclusion": "group_photo"}]}
    (tmp_path / "m.json").write_text(json.dumps(manifest))
    cases = load_dataset(tmp_path / "m.json", tmp_path)
    assert cases[0]["eligible"] is False and cases[0]["_path"] is None


def test_isolation_flag_alone_is_not_sufficient(monkeypatch):
    from evaluation import isolation
    monkeypatch.setenv("DDS_EVALUATION_ISOLATED", "1")
    monkeypatch.setattr(isolation.platform, "system", lambda: "Windows")
    with pytest.raises(isolation.IsolationError):
        isolation.check_environment()


def test_metrics_and_no_biometric_values():
    assert classification_metrics([True, False], [True, False])["f1"] == 1.0
    assert latency_summary([1.0, 2.0, 3.0])["median_ms"] == 2.0
    report = json.dumps({"case_count": 2, "metrics": classification_metrics([True], [True])})
    assert "embedding" not in report and "coordinates" not in report


def test_cleanup_success_and_stale(tmp_path):
    run = create_run_dir(tmp_path); (run / "temporary").write_bytes(b"x")
    assert cleanup_run(run)
    stale = create_run_dir(tmp_path)
    import os, time
    old = time.time() - 7200; os.utime(stale, (old, old))
    assert cleanup_stale(tmp_path) >= 1

