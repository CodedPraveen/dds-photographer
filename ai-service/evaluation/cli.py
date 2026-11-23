from __future__ import annotations

import argparse
import json
import os
import platform
import sys
from pathlib import Path

from .artifacts import ArtifactError, load_manifest, verify_status
from .cleanup import cleanup_run, cleanup_stale, create_run_dir
from .dataset import DatasetError, load_dataset, validate_image
from .isolation import IsolationError, check_environment
from .metrics import latency_summary
from .sface import SFaceBlocked
from .yunet import YuNetAdapter


def _common(parser):
    parser.add_argument("--models", type=Path, default=Path("models.json"))
    parser.add_argument("--model-dir", type=Path, default=Path("models"))


def main(argv=None) -> int:
    parser = argparse.ArgumentParser(description="DDS isolated CPU-only model evaluation; no downloads, DB, storage, or HTTP server. Windows: $env:DDS_EVALUATION_ISOLATED='1'; python -m evaluation.cli check-env")
    sub = parser.add_subparsers(dest="command", required=True)
    sub.add_parser("check-env")
    p = sub.add_parser("verify-models"); _common(p)
    p = sub.add_parser("validate-dataset"); p.add_argument("--manifest", type=Path, required=True); p.add_argument("--root", type=Path, required=True)
    p = sub.add_parser("run-yunet"); _common(p); p.add_argument("--manifest", type=Path, required=True); p.add_argument("--root", type=Path, required=True); p.add_argument("--temp-root", type=Path, default=Path("/tmp/evaluation"))
    p = sub.add_parser("run-sface"); _common(p); p.add_argument("--manifest", type=Path, required=True); p.add_argument("--root", type=Path, required=True)
    args = parser.parse_args(argv)
    try:
        if args.command == "check-env":
            check_environment(); print(json.dumps({"status": "ok", "python": platform.python_version()})); return 0
        if args.command == "validate-dataset":
            check_environment(dataset_root=args.root)
            cases = load_dataset(args.manifest, args.root)
            for case in cases:
                if case["eligible"]:
                    validate_image(case["_path"])
            print(json.dumps({"status": "ok", "cases": len(cases)}))
            return 0
        if args.command == "run-sface":
            raise SFaceBlocked("SFace evaluation is blocked until written licensing/provenance approval")
        check_environment(
            model_dir=getattr(args, "model_dir", None),
            dataset_root=getattr(args, "root", None),
            temp_root=getattr(args, "temp_root", None),
        )
        models = load_manifest(args.models) if args.command in {"verify-models", "run-yunet", "run-sface"} else {}
        if args.command == "verify-models":
            statuses = []
            for artifact in models.values():
                try:
                    statuses.append(verify_status(artifact, args.model_dir))
                except ArtifactError as exc:
                    statuses.append({"id": artifact.id, "status": "failed", "error": str(exc)})
            print(json.dumps({"status": "ok", "models": statuses}))
            return 0 if all(item["status"] != "failed" for item in statuses) else 2
        cases = load_dataset(args.manifest, args.root)
        artifact = models["yunet"]; adapter = YuNetAdapter(artifact, args.model_dir)
        run_dir = create_run_dir(args.temp_root); cleanup_stale(args.temp_root)
        try:
            eligible = [case for case in cases if case["eligible"]]
            results = [adapter.detect(case["_path"]) for case in eligible]
            expected = [int(case.get("expected_face_count", -1)) for case in eligible]
            actual = [result[0] for result in results]
            report = {
                "run_id": run_dir.name,
                "model": {"id": artifact.id, "version": artifact.version, "sha256": artifact.sha256},
                "dataset_id": json.loads(args.manifest.read_text(encoding="utf-8"))["dataset_id"],
                "case_count": len(eligible),
                "detected_count": sum(count == 1 for count in actual),
                "expected_count_matches": sum(a == e for a, e in zip(actual, expected)),
                "false_detection_cases": sum(e == 0 and a > 0 for a, e in zip(actual, expected)),
                "missed_detection_cases": sum(e > 0 and a == 0 for a, e in zip(actual, expected)),
                "confidence": {"max": max((result[1] for result in results), default=None)},
                "latency": latency_summary([result[2] for result in results]),
                "model_load_ms": adapter.model_load_ms,
                "cleanup_status": "pending",
            }
            (run_dir / "report.json").write_text(json.dumps(report), encoding="utf-8")
            report["cleanup_status"] = "complete" if cleanup_run(run_dir) else "failed"
            print(json.dumps(report)); return 0 if report["cleanup_status"] == "complete" else 2
        finally:
            if run_dir.exists(): cleanup_run(run_dir)
    except (IsolationError, ArtifactError, DatasetError, SFaceBlocked, KeyError) as exc:
        print(json.dumps({"status": "blocked", "error": str(exc)}), file=sys.stderr); return 2


if __name__ == "__main__":
    raise SystemExit(main())

