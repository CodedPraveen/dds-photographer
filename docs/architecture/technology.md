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
| Face matching | SFace | EVALUATION_ONLY |
| Video | Cloudflare Stream | ON_HOLD |

Installed packages do not prove feature implementation. See the existing detailed
technology record at `docs/design-system/architecture/17-tech-stack.md`.
