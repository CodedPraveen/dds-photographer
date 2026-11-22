# Technology decisions

| Area | Decision | Status |
| --- | --- | --- |
| Frontend and backend | Existing Next.js App Router | IMPLEMENTED |
| UI/language | React, JavaScript, Tailwind CSS v4 | IMPLEMENTED |
| Motion | React Three Fiber/Three.js + GSAP/ScrollTrigger | IMPLEMENTED |
| Database | Existing Supabase PostgreSQL + Prisma | IMPLEMENTED foundation |
| Private photo storage | Cloudflare R2 | SELECTED_NOT_INTEGRATED |
| Upload authorization | Next.js-generated signed R2 URLs | APPROVED / PLANNED |
| Background jobs | BullMQ 6.7.8 | FOUNDATION IMPLEMENTED; no photo jobs |
| Queue backend | Upstash Redis via ioredis 5.11.1 TCP/TLS | FOUNDATION IMPLEMENTED; live service unverified |
| Image processing | Sharp | Installed; worker not implemented |
| Photo worker | Separate process/container in same repository | APPROVED / PLANNED |
| Deployment | Docker Compose on AWS Lightsail VPS, 4 GB RAM target | APPROVED / PLANNED; not deployed |
| Reverse proxy | Nginx | APPROVED / PLANNED; not deployed |
| Wedding password | One shared password per wedding | SELECTED_NOT_INTEGRATED |
| Face detection | YuNet | SELECTED_NOT_INTEGRATED |
| Face recognition embeddings | SFace ONNX | SELECTED_NOT_INTEGRATED |
| Face image processing/inference | OpenCV | SELECTED_NOT_INTEGRATED |
| Face-search backend | Python + FastAPI/Uvicorn | SELECTED_NOT_INTEGRATED |
| Face embedding storage/search | PostgreSQL + pgvector | SELECTED_NOT_INTEGRATED |
| Video | Cloudflare Stream | ON_HOLD |

The BullMQ connection, queue, and worker factories are implemented locally, but
no photo jobs or worker deployment is implemented. R2, Upstash, the worker,
Lightsail, Nginx, and the Phase 6 upload workflow are not deployed or
production-verified. The face-recognition architecture is deferred from Phase 6 and not
integrated. Video remains on hold. See the detailed technology record at
`docs/design-system/architecture/17-tech-stack.md`, ADR-002, and the
[Phase 6 product specification](../product/MEDIA_PIPELINE.md).
