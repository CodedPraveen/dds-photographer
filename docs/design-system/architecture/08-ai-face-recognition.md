# Face Recognition Architecture

**Status:** Selected / not implemented

```text
Next.js Frontend
       |
       v
FastAPI Backend (Python/Uvicorn)
       v
OpenCV image processing and model inference
       v
YuNet face detection (boxes + landmarks)
       v
Face alignment / cropping
       v
SFace ONNX embeddings
       v
PostgreSQL + pgvector similarity search
       v
Matching faces returned to the authorized frontend
```

YuNet locates faces; it does not identify people. SFace generates embeddings; it
does not independently perform gallery-wide identity matching. pgvector performs
similarity retrieval of candidate embeddings. Similarity thresholds require
experimental validation and are not production values.

OpenCV runs both models and handles loading, resizing, color conversion, cropping,
alignment, and preprocessing. MTCNN, PyTorch, and Torchvision are alternatives
considered and excluded from the initial implementation. SFace ONNX is not run
through PyTorch.

This is a selected target architecture, not an implemented feature. No upload,
processing, embedding storage, search API, or FastAPI service exists yet. Face
embeddings are biometric data and require separate optional affirmative consent,
gallery-scoped authorization, protection, retention, withdrawal, and deletion.
