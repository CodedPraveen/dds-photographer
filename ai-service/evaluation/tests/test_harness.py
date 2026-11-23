import hashlib
import json
from pathlib import Path

import pytest

from evaluation.artifacts import Artifact, ArtifactError, load_manifest, verify_artifact, verify_status
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
    assert cli.main(["run-sface", "--manifest", str(manifest), "--root", str(tmp_path)]) == 2
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

