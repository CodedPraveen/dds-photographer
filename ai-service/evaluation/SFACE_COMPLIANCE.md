# SFace Evaluation Compliance Record

Status: **Evaluation-only; blocked pending licensing and provenance approval.**

## Software package

The evaluation harness uses the CPU-only `opencv-contrib-python-headless` package
specified in `evaluation/requirements.txt`. Its package and OpenCV distribution
license must be reviewed separately from the ONNX model-weight license.

## Model artifact

- Identifier: `face_recognition_sface_2021dec.onnx`
- Intended source: OpenCV Zoo `models/face_recognition_sface`
- Provenance: record an immutable full Git commit SHA and independently verified SHA-256 before approval.
- Model-weight licensing: Apache-2.0 is declared in the model directory, but exact pretrained-weight scope, training-data provenance, commercial-use rights, and redistribution conditions remain unresolved.
- Commercial-use approval: **Not approved**.
- Manifest state: `BLOCKED_LICENSING_PROVENANCE`.

No model weights are included, downloaded, or loaded while this status remains blocked. This record is not legal advice and does not constitute legal approval.
