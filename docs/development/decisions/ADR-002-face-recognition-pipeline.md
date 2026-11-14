# ADR-002: Face-recognition pipeline

- **Status:** Approved target architecture; not implemented
- **Date:** 2026-11-15

## Decision

Use YuNet for face detection and landmarks; OpenCV for image loading, resizing,
color conversion, cropping, alignment, preprocessing, and running both models;
SFace ONNX for face embeddings; a separate Python FastAPI service served by
Uvicorn; and PostgreSQL with pgvector for embedding storage and similarity search.

The target flow is: Next.js → FastAPI → OpenCV → YuNet → aligned face region →
SFace ONNX → PostgreSQL/pgvector → similarity candidates → authorized frontend.
YuNet detects, SFace embeds, and pgvector retrieves similar embeddings; none
independently proves identity. Models are pretrained inference models.

MTCNN, PyTorch, and Torchvision were considered but are excluded from the initial
implementation. SFace ONNX runs through OpenCV, not PyTorch.

## Consequences and boundaries

This is selected but not integrated: no current route, service, schema, embedding,
or search feature is implemented. Similarity thresholds require experimental
validation. Embeddings are biometric data and require separate optional
affirmative consent, gallery-scoped authorization, isolation, retention,
withdrawal, deletion, and security review before implementation.
