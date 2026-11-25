import hashlib
import json
from pathlib import Path

import pytest

from evaluation.artifacts import Artifact, ArtifactError, load_manifest, verify_artifact, verify_status
from evaluation.cleanup import cleanup_run, cleanup_stale, create_run_dir
from evaluation.dataset import DatasetError, load_dataset
from evaluation.metrics import classification_metrics, latency_summary
from evaluation.sface import SFaceAdapter, SFaceBlocked, SFaceError, evaluate_pairs, load_pairs, require_sface_approval
from evaluation.yunet import YuNetAdapter, YuNetError


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def test_artifact_checksum_and_failure(tmp_path):
    model = tmp_path / "model.onnx"; model.write_bytes(b"model")
    artifact = Artifact("x", Path("model.onnx"), "v", "commit", "MIT", digest(model), "APPROVED")
    assert verify_artifact(artifact, tmp_path) == model
    bad = Artifact("x", Path("model.onnx"), "v", "commit", "MIT", "0" * 64, "APPROVED")
    with pytest.raises(ArtifactError): verify_artifact(bad, tmp_path)


def test_blocked_manifest_entry_does_not_block_approved_entry(tmp_path):
    model = tmp_path / "yunet.onnx"; model.write_bytes(b"model")
    manifest = {
        "models": [
            {"id": "yunet", "artifact": "yunet.onnx", "version": "v", "source": "repo@0123456789abcdef0123456789abcdef01234567", "license": "MIT", "sha256": digest(model), "approval": "APPROVED"},
            {"id": "sface", "artifact": "sface.onnx", "version": "v", "source": "repo", "license": "Apache-2.0", "sha256": "", "approval": "BLOCKED_LICENSING_PROVENANCE"},
        ]
    }
    path = tmp_path / "models.json"; path.write_text(json.dumps(manifest))
    loaded = load_manifest(path)
    assert verify_status(loaded["yunet"], tmp_path)["status"] == "verified"
    assert verify_status(loaded["sface"], tmp_path)["status"] == "blocked"


def test_manifest_fallback_does_not_eagerly_require_artifact_key(tmp_path):
    path = tmp_path / "models.json"
    path.write_text(json.dumps({"models": [{"id": "x", "path": "x.onnx", "version": "v", "source": "repo@commit", "license": "MIT", "sha256": "", "approval": "BLOCKED_UNVERIFIED_ARTIFACT"}]}))
    assert load_manifest(path)["x"].path == Path("x.onnx")


@pytest.mark.parametrize("source", ["main", "latest", "commit", "repo@IMMUTABLE_COMMIT_REQUIRED", "repo@0123456789abcdef"])
def test_approved_artifact_requires_full_pinned_commit(tmp_path, source):
    path = tmp_path / "models.json"
    path.write_text(json.dumps({"models": [{"id": "x", "artifact": "x.onnx", "version": "v", "source": source, "license": "MIT", "sha256": "1" * 64, "approval": "APPROVED"}]}))
    with pytest.raises(ArtifactError): load_manifest(path)


def test_sface_gate_blocks_before_loading(tmp_path):
    artifact = Artifact("sface", Path("missing.onnx"), "v", "commit", "Apache-2.0", "1" * 64, "BLOCKED_LICENSING_PROVENANCE")
    with pytest.raises(SFaceBlocked): require_sface_approval(artifact)


class FakeDnn:
    DNN_BACKEND_OPENCV = 3
    DNN_TARGET_CPU = 0


class FakeRecognizer:
    def __init__(self):
        self.aligned = None

    def alignCrop(self, image, detection):
        self.aligned = (image, detection)
        return image[:2, :2]

    def feature(self, aligned):
        return [[3.0, 4.0]]


class FakeFaceRecognizerSF:
    instance = FakeRecognizer()

    @staticmethod
    def create(*args):
        return FakeFaceRecognizerSF.instance


class FakeCv2:
    FaceRecognizerSF = FakeFaceRecognizerSF
    dnn = FakeDnn()


class FailingRecognizer:
    def alignCrop(self, _image, _detection):
        import cv2
        raise cv2.error("mock align failure")

    def feature(self, _aligned):
        return [[1.0]]


class FailingFaceRecognizerSF:
    @staticmethod
    def create(*_args):
        import cv2
        raise cv2.error("mock init failure")


class FailingSFaceCv2:
    FaceRecognizerSF = FailingFaceRecognizerSF
    dnn = FakeDnn()


def approved_sface(tmp_path):
    model = tmp_path / "sface.onnx"; model.write_bytes(b"sface")
    return Artifact("sface", Path("sface.onnx"), "v", "repo@0123456789abcdef0123456789abcdef01234567", "Apache-2.0", digest(model), "APPROVED")


def test_sface_adapter_aligns_and_extracts_mocked_embedding(tmp_path):
    import numpy as np
    adapter = SFaceAdapter(approved_sface(tmp_path), tmp_path, FakeCv2)
    embedding = adapter.extract_embedding(np.zeros((4, 4, 3), dtype=np.uint8), [1, 1, 2, 2, *([0.0] * 11)])
    assert embedding.tolist() == [3.0, 4.0]
    assert FakeFaceRecognizerSF.instance.aligned is not None
    assert SFaceAdapter.cosine_similarity([1, 0], [1, 0]) == 1.0


@pytest.mark.parametrize("image,detection", [(None, [[1] * 15]), ("bad", [[1] * 15]), (None, None)])
def test_sface_adapter_rejects_invalid_inputs(tmp_path, image, detection):
    adapter = SFaceAdapter(approved_sface(tmp_path), tmp_path, FakeCv2)
    with pytest.raises(SFaceError): adapter.extract_embedding(image, detection)


def test_sface_normalizes_opencv_initialization_and_alignment_errors(tmp_path):
    import numpy as np
    with pytest.raises(SFaceError, match="initialize"):
        SFaceAdapter(approved_sface(tmp_path), tmp_path, FailingSFaceCv2)
    adapter = SFaceAdapter(approved_sface(tmp_path), tmp_path, FakeCv2)
    adapter.recognizer = FailingRecognizer()
    with pytest.raises(SFaceError, match="inference"):
        adapter.extract_embedding(np.zeros((4, 4, 3), dtype=np.uint8), [1, 1, 2, 2, *([0.0] * 11)])


class FakeYuNetDetector:
    def setInputSize(self, _size):
        import cv2
        raise cv2.error("mock inference failure")

    def detect(self, _image):
        return None, None


class FakeYuNetFactory:
    fail_init = False

    @staticmethod
    def create(*_args):
        import cv2
        if FakeYuNetFactory.fail_init:
            raise cv2.error("mock init failure")
        return FakeYuNetDetector()


class FakeYuNetCv2:
    FaceDetectorYN = FakeYuNetFactory
    IMREAD_COLOR = 1
    dnn = FakeDnn()

    @staticmethod
    def imread(_path, _mode):
        import cv2
        raise cv2.error("mock read failure")


def approved_yunet(tmp_path):
    model = tmp_path / "yunet.onnx"; model.write_bytes(b"yunet")
    return Artifact("yunet", Path("yunet.onnx"), "v", "repo@0123456789abcdef0123456789abcdef01234567", "MIT", digest(model), "APPROVED")


def test_yunet_normalizes_opencv_initialization_read_and_inference_errors(tmp_path):
    FakeYuNetFactory.fail_init = True
    with pytest.raises(YuNetError, match="initialization"):
        YuNetAdapter(approved_yunet(tmp_path), tmp_path, cv2_module=FakeYuNetCv2)
    FakeYuNetFactory.fail_init = False
    adapter = YuNetAdapter(approved_yunet(tmp_path), tmp_path, cv2_module=FakeYuNetCv2)
    with pytest.raises(YuNetError, match="reading"):
        adapter.detect(tmp_path / "image.jpg")
    import numpy as np
    with pytest.raises(YuNetError, match="inference"):
        adapter.detect_image(np.zeros((4, 4, 3), dtype=np.uint8))


def test_sface_pair_manifest_and_aggregate_metrics(tmp_path):
    import numpy as np
    first = tmp_path / "a.jpg"; second = tmp_path / "b.jpg"
    first.write_bytes(b"a"); second.write_bytes(b"b")
    manifest = {"dataset_id": "synthetic", "dataset_type": "synthetic", "authorization": "authorized", "cases": [
        {"id": "a", "path": "a.jpg", "sha256": digest(first), "expected_face_count": 1, "eligible": True},
        {"id": "b", "path": "b.jpg", "sha256": digest(second), "expected_face_count": 1, "eligible": True}],
        "pairs": [{"id": "p1", "left": "a", "right": "b", "same": True}]}
    manifest_path = tmp_path / "pairs.json"; manifest_path.write_text(json.dumps(manifest))
    cases, pairs = load_pairs(manifest_path, tmp_path)
    adapter = SFaceAdapter(approved_sface(tmp_path), tmp_path, FakeCv2)
    report = evaluate_pairs(cases, pairs, adapter, lambda _image: [[1, 1, 2, 2, *([0.0] * 11)]], image_loader=lambda _path: np.zeros((4, 4, 3), dtype=np.uint8))
    assert report["pair_count"] == 1 and report["tp"] == 1 and report["threshold"] == 0.363


def test_pair_manifest_rejects_duplicate_and_ineligible_references(tmp_path):
    image = tmp_path / "a.jpg"; image.write_bytes(b"a")
    base = {"dataset_id": "synthetic", "dataset_type": "synthetic", "authorization": "authorized", "cases": [{"id": "a", "path": "a.jpg", "sha256": digest(image), "expected_face_count": 1, "eligible": True}]}
    for pairs in [[{"id": "p", "left": "a", "right": "a", "same": True}, {"id": "p", "left": "a", "right": "a", "same": True}], [{"id": "p", "left": "missing", "right": "a", "same": True}]]:
        path = tmp_path / "pairs.json"; path.write_text(json.dumps({**base, "pairs": pairs}))
        with pytest.raises(DatasetError): load_pairs(path, tmp_path)


@pytest.mark.parametrize("pairs", [
    [{"id": "", "left": "a", "right": "b", "same": True}],
    [{"id": "self", "left": "a", "right": "a", "same": True}],
    [{"id": "p1", "left": "a", "right": "b", "same": True}, {"id": "p2", "left": "b", "right": "a", "same": True}],
    [{"id": "not pseudonymous@example", "left": "a", "right": "b", "same": True}],
])
def test_pair_manifest_rejects_empty_self_reversed_or_non_pseudonymous_pairs(tmp_path, pairs):
    first = tmp_path / "a.jpg"; second = tmp_path / "b.jpg"
    first.write_bytes(b"a"); second.write_bytes(b"b")
    manifest = {"dataset_id": "synthetic", "dataset_type": "synthetic", "authorization": "authorized", "cases": [
        {"id": "a", "path": "a.jpg", "sha256": digest(first), "expected_face_count": 1, "eligible": True},
        {"id": "b", "path": "b.jpg", "sha256": digest(second), "expected_face_count": 1, "eligible": True}], "pairs": pairs}
    path = tmp_path / "pairs.json"; path.write_text(json.dumps(manifest))
    with pytest.raises(DatasetError): load_pairs(path, tmp_path)


def test_pair_manifest_requires_one_expected_face(tmp_path):
    image = tmp_path / "a.jpg"; image.write_bytes(b"a")
    manifest = {"dataset_id": "synthetic", "dataset_type": "synthetic", "authorization": "authorized", "cases": [{"id": "a", "path": "a.jpg", "sha256": digest(image), "expected_face_count": 2, "eligible": True}], "pairs": []}
    path = tmp_path / "pairs.json"; path.write_text(json.dumps(manifest))
    with pytest.raises(DatasetError): load_pairs(path, tmp_path)


def test_sface_threshold_must_be_cosine_range(tmp_path):
    import numpy as np
    adapter = SFaceAdapter(approved_sface(tmp_path), tmp_path, FakeCv2)
    cases = [{"id": "a", "_path": tmp_path / "a.jpg", "eligible": True, "expected_face_count": 1}, {"id": "b", "_path": tmp_path / "b.jpg", "eligible": True, "expected_face_count": 1}]
    pairs = [{"id": "p", "left": "a", "right": "b", "same": True}]
    for threshold in [-1.1, 1.1, float("inf")]:
        with pytest.raises(SFaceError):
            evaluate_pairs(cases, pairs, adapter, lambda _image: [[1, 1, 2, 2, *([0.0] * 11)]], threshold, lambda _path: np.zeros((4, 4, 3), dtype=np.uint8))


def test_dataset_rejects_traversal_and_unauthorized(tmp_path):
    image = tmp_path / "image.bin"; image.write_bytes(b"x")
    base = {"dataset_id": "x", "dataset_type": "synthetic", "authorization": "authorized", "cases": []}
    (tmp_path / "m.json").write_text(json.dumps({**base, "cases": [{"id": "x", "path": "../image.bin", "sha256": digest(image), "eligible": True}]}))
    with pytest.raises(DatasetError): load_dataset(tmp_path / "m.json", tmp_path)


def test_dataset_requires_boolean_and_validates_example_shape(tmp_path):
    image = tmp_path / "face.jpg"; image.write_bytes(b"authorized-fixture")
    manifest = {"dataset_id": "example", "dataset_type": "synthetic", "authorization": "authorized", "cases": [{"id": "face", "path": "face.jpg", "sha256": digest(image), "expected_face_count": 1, "eligible": True}]}
    path = tmp_path / "m.json"; path.write_text(json.dumps(manifest))
    assert load_dataset(path, tmp_path)[0]["id"] == "face"
    manifest["cases"][0]["eligible"] = "true"
    path.write_text(json.dumps(manifest))
    with pytest.raises(DatasetError): load_dataset(path, tmp_path)


@pytest.mark.parametrize("field,value", [("dataset_id", "bad id"), ("id", "visitor-123"), ("expected_face_count", True), ("labels", "not-an-object")])
def test_dataset_rejects_malformed_identifiers_and_metadata(tmp_path, field, value):
    image = tmp_path / "face.jpg"; image.write_bytes(b"fixture")
    case = {"id": "face", "path": "face.jpg", "sha256": digest(image), "expected_face_count": 1, "eligible": True}
    manifest = {"dataset_id": "example", "dataset_type": "synthetic", "authorization": "authorized", "cases": [case]}
    if field == "dataset_id": manifest[field] = value
    else: case[field] = value
    path = tmp_path / "m.json"; path.write_text(json.dumps(manifest))
    with pytest.raises(DatasetError): load_dataset(path, tmp_path)


def test_excluded_cases_never_open_or_stat_files(tmp_path):
    manifest = {"dataset_id": "x", "dataset_type": "synthetic", "authorization": "authorized", "cases": [{"id": "minor", "path": "missing.jpg", "eligible": False, "exclusion": "minor"}]}
    path = tmp_path / "m.json"; path.write_text(json.dumps(manifest))
    assert load_dataset(path, tmp_path)[0]["_path"] is None


def test_ipv4_and_ipv6_route_fixtures():
    from evaluation.isolation import IsolationError, verify_ipv4_routes, verify_ipv6_routes
    ipv4 = "Iface Destination Gateway Flags RefCnt Use Metric Mask MTU Window IRTT\nlo 0000007F 00000000 0001 0 0 0 000000FF 0 0 0 0"
    ipv6 = "0" * 32 + " 00 " + "0" * 32 + " 00 " + "0" * 32 + " ffffffff 00000001 00000000 00200200 lo\n" + "0" * 31 + "1" + " 80 " + "0" * 32 + " 00 " + "0" * 32 + " 00000000 00000002 00000000 80200001 lo"
    verify_ipv4_routes(ipv4); verify_ipv6_routes(ipv6)
    with pytest.raises(IsolationError): verify_ipv4_routes(ipv4.replace("lo ", "eth0 "))
    with pytest.raises(IsolationError): verify_ipv6_routes(ipv6.replace(" lo", " eth0"))
    with pytest.raises(IsolationError): verify_ipv4_routes(ipv4.replace("0000007F", "00000000"))
    with pytest.raises(IsolationError): verify_ipv6_routes(ipv6.replace("0" * 31 + "1", "0" * 32))


@pytest.mark.parametrize("mutation", [
    lambda text: " ".join(text.split()[:4] + ["00000000000000000000000000000001"] + text.split()[5:]),
    lambda text: " ".join(text.split()[:2] + ["00000000000000000000000000000001"] + text.split()[3:]),
    lambda text: " ".join(text.split()[:5] + ["00000000"] + text.split()[6:]),
    lambda text: " ".join(text.split()[:9] + ["eth0"]),
])
def test_ipv6_unsafe_route_variants_are_rejected(mutation):
    from evaluation.isolation import IsolationError, verify_ipv6_routes
    fixture = "0" * 32 + " 00 " + "0" * 32 + " 00 " + "0" * 32 + " ffffffff 00000001 00000000 00200200 lo"
    with pytest.raises(IsolationError): verify_ipv6_routes(mutation(fixture))


def test_ipv6_malformed_route_is_rejected():
    from evaluation.isolation import IsolationError, verify_ipv6_routes
    with pytest.raises(IsolationError): verify_ipv6_routes("0" * 32 + " 00 malformed")


def test_default_relative_model_path_is_resolved_before_mount_check(monkeypatch, tmp_path):
    from evaluation import isolation
    for name in isolation.forbidden_environment_names(dict(__import__("os").environ)):
        monkeypatch.delenv(name, raising=False)
    seen = []
    monkeypatch.setattr(isolation, "_mount_options", lambda _text, mountpoint: (seen.append(mountpoint) or ({"ro"}, {"size=1M", "noexec", "nosuid"})))
    status = "\n".join([*(f"{field}:\t0000000000000000" for field in ["CapEff", "CapPrm", "CapInh", "CapBnd", "CapAmb"]), "NoNewPrivs:\t1"])
    monkeypatch.setattr(isolation, "_read", lambda _root, name: "Iface Destination Gateway Flags RefCnt Use Metric Mask MTU Window IRTT\nlo 0000007F 00000000 0001 0 0 0 000000FF 0 0 0 0" if name == "net/route" else ("" if name == "net/ipv6_route" else (status if name == "self/status" else "")))
    monkeypatch.setattr(isolation.platform, "system", lambda: "Linux")
    monkeypatch.setenv("DDS_EVALUATION_ISOLATED", "1")
    isolation.check_environment(Path("models"), Path("dataset"), Path("/tmp/evaluation"), tmp_path)
    assert str(Path("models").resolve()) in seen


def test_cli_subcommands_do_not_require_unrelated_arguments(monkeypatch, tmp_path, capsys):
    from evaluation import cli
    monkeypatch.setattr(cli, "check_environment", lambda **kwargs: None)
    dataset = {"dataset_id": "x", "dataset_type": "synthetic", "authorization": "authorized", "cases": [{"id": "minor", "path": "missing.jpg", "eligible": False, "exclusion": "minor"}]}
    manifest = tmp_path / "dataset.json"; manifest.write_text(json.dumps(dataset))
    assert cli.main(["validate-dataset", "--manifest", str(manifest), "--root", str(tmp_path)]) == 0
    models = tmp_path / "models.json"
    models.write_text(json.dumps({"models": [{"id": "sface", "artifact": "missing.onnx", "version": "v", "source": "repo", "license": "Apache-2.0", "sha256": "", "approval": "BLOCKED_LICENSING_PROVENANCE"}]}))
    assert cli.main(["run-sface", "--models", str(models), "--manifest", str(manifest), "--root", str(tmp_path)]) == 2
    assert "blocked" in capsys.readouterr().err


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


@pytest.mark.parametrize("name", [
    "DATABASE_URL", "POSTGRES_PASSWORD", "MYSQL_CONNECTION_URL", "MONGODB_URI",
    "AWS_SECRET_ACCESS_KEY", "AZURE_CLIENT_SECRET", "GOOGLE_APPLICATION_CREDENTIALS",
    "CLOUDFLARE_API_TOKEN", "S3_SECRET_ACCESS_KEY", "R2_ACCESS_KEY_ID",
    "REDIS_URL", "SUPABASE_SERVICE_KEY", "PRISMA_DATABASE_URL", "PAYMENTS_SERVICE_TOKEN",
])
def test_production_credential_names_are_blocked(name):
    from evaluation.isolation import forbidden_environment_names
    assert name in forbidden_environment_names({name: "dummy-value"})


@pytest.mark.parametrize("name", ["PATH", "PYTHONPATH", "PYTHONUNBUFFERED", "PYTHON_VERSION", "HOME", "LANG", "DDS_EVALUATION_ISOLATED"])
def test_harmless_runtime_names_are_not_blocked(name):
    from evaluation.isolation import forbidden_environment_names
    assert forbidden_environment_names({name: "dummy-value"}) == []


@pytest.mark.parametrize("field", ["CapEff", "CapPrm", "CapInh", "CapBnd", "CapAmb"])
def test_each_nonzero_capability_field_is_rejected(field):
    from evaluation.isolation import IsolationError, verify_capabilities
    fields = {name: "0000000000000000" for name in ["CapEff", "CapPrm", "CapInh", "CapBnd", "CapAmb"]}
    fields[field] = "0000000000000001"
    status = "\n".join(f"{name}:\t{value}" for name, value in fields.items())
    with pytest.raises(IsolationError): verify_capabilities(status)


def test_missing_capability_field_is_rejected():
    from evaluation.isolation import IsolationError, verify_capabilities
    status = "\n".join(f"{name}:\t0000000000000000" for name in ["CapEff", "CapPrm", "CapInh", "CapBnd"])
    with pytest.raises(IsolationError): verify_capabilities(status)


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


def test_cli_reports_cleanup_failure_without_pending_report(monkeypatch, tmp_path, capsys):
    from evaluation import cli
    image = tmp_path / "face.jpg"; image.write_bytes(b"fixture")
    manifest = tmp_path / "dataset.json"
    manifest.write_text(json.dumps({"dataset_id": "synthetic", "dataset_type": "synthetic", "authorization": "authorized", "cases": [{"id": "face", "path": "face.jpg", "sha256": digest(image), "expected_face_count": 0, "eligible": True}]}))
    artifact = approved_yunet(tmp_path)
    monkeypatch.setattr(cli, "check_environment", lambda **_kwargs: None)
    monkeypatch.setattr(cli, "load_manifest", lambda _path: {"yunet": artifact})
    monkeypatch.setattr(cli, "load_dataset", lambda _manifest, _root: [{"id": "face", "eligible": True, "expected_face_count": 0, "_path": image}])
    monkeypatch.setattr(cli, "YuNetAdapter", lambda *_args: type("Adapter", (), {"model_load_ms": 1.0, "detect": lambda _self, _path: (0, 0.0, 1.0)})())
    monkeypatch.setattr(cli, "cleanup_run", lambda _path: False)
    assert cli.main(["run-yunet", "--models", str(tmp_path / "models.json"), "--manifest", str(manifest), "--root", str(tmp_path), "--temp-root", str(tmp_path / "runs")]) == 2
    output = json.loads(capsys.readouterr().out)
    assert output["cleanup_status"] == "failed"
    assert "pending" not in output

