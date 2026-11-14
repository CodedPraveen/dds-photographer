# Technology decisions

| Area | Decision | Status |
| --- | --- | --- |
| Framework | Next.js App Router | IMPLEMENTED |
| UI/language | React, JavaScript, Tailwind CSS v4 | IMPLEMENTED |
| Motion | React Three Fiber/Three.js + GSAP/ScrollTrigger | IMPLEMENTED |
| Database | PostgreSQL + Prisma | IMPLEMENTED |
| Private photo storage | Cloudflare R2 | SELECTED_NOT_INTEGRATED |
| Background processing | Redis + BullMQ | SELECTED_NOT_INTEGRATED |
| Wedding password | One shared password per wedding | SELECTED_NOT_INTEGRATED |
| Face detection | YuNet | SELECTED_NOT_INTEGRATED |
| Face recognition embeddings | SFace ONNX | SELECTED_NOT_INTEGRATED |
| Face image processing/inference | OpenCV | SELECTED_NOT_INTEGRATED |
| Face-search backend | Python + FastAPI/Uvicorn | SELECTED_NOT_INTEGRATED |
| Face embedding storage/search | PostgreSQL + pgvector | SELECTED_NOT_INTEGRATED |
| Video | Cloudflare Stream | ON_HOLD |

Installed packages do not prove feature implementation. The face-recognition
architecture is selected but not integrated. See the detailed technology record
at `docs/design-system/architecture/17-tech-stack.md` and ADR-002.
