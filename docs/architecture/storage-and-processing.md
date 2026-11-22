# Photo storage and processing

## 1. Current implementation — IMPLEMENTED / partial

The repository currently has a gallery media foundation, not the complete Phase 6
pipeline.

- `GalleryMedia` records belong to one gallery and currently store
  `storageProvider`, `storageKey`, `mimeType`, `sizeBytes`, dimensions,
  ordering, cover state, and timestamps. No Phase 6 upload-session, version,
  derivative, processing-job, or Trash schema is implemented.
- The implemented admin route is
  `POST /api/admin/galleries/[id]/media`. It requires the current Admin,
  rejects a mismatched request origin, accepts one multipart form field named
  `file`, buffers it in the Next.js process, uploads it server-side, and
  creates a media record.
- The current route limit is 15 MB per file. Its content-signature check
  recognizes JPEG, PNG, WebP, GIF, and AVIF; it does not enforce the approved
  JPEG/JPG-only, 50 MB Phase 6 policy. The browser MIME type and extension are
  not the authoritative validation, but the current route does not perform the
  complete Phase 6 object-size/checksum/JPEG verification contract.
- `src/lib/storage` provides a server-only provider abstraction. The
  Supabase adapter can upload, delete, and download through a configured
  Supabase service-role client. The R2 adapter can upload, delete, and download
  through an S3-compatible Cloudflare R2 client using server-only credentials.
- The selected provider is controlled by `STORAGE_PROVIDER`, defaulting to
  Supabase outside production and R2 in production. A provider adapter existing
  in source does not prove that R2 is provisioned, configured, private, or
  deployed. The current route performs a server-side PUT; it does not generate
  signed browser upload URLs or implement direct browser-to-R2 transfer.
- Gallery delivery resolves media inside the validated gallery. Non-development
  production storage delivery remains unverified/not integrated in the current
  repository state, and the complete private derivative-delivery workflow is
  not implemented.
- Sharp is installed and approved for image processing, but no separate photo
  worker or derivative pipeline is implemented. Redis, BullMQ, Upstash Redis,
  upload sessions, multipart completion, processing states, and cleanup jobs
  are not present. The Docker configuration contains the Next.js app and
  PostgreSQL services only; it does not claim an R2, Redis, or worker service.

## 2. Target architecture and service boundaries — APPROVED / PLANNED

The approved target keeps Next.js as both frontend and backend and adds a
separate worker process/container from the same repository.

| Boundary | Responsibility | Status |
| --- | --- | --- |
| Next.js App Router/server | Admin authorization, gallery scoping, signed upload authorization, completion verification, media records, publication controls, guest authorization | **APPROVED / PLANNED** |
| Supabase PostgreSQL | Existing system database; target media/session/status/version records remain database-backed | **IMPLEMENTED database / target schema changes PLANNED** |
| Private Cloudflare R2 bucket | Originals and derivatives; no public bucket or public object URLs | **SELECTED_NOT_INTEGRATED** |
| Upstash Redis | Queue backend selected for BullMQ, subject to compatibility validation | **SELECTED_NOT_INTEGRATED / DECISION_REQUIRED validation** |
| BullMQ photo jobs | Durable processing queue, retries, and job state coordination | **SELECTED_NOT_INTEGRATED** |
| Separate photo worker | Sharp validation and derivative generation using server-only R2 credentials | **APPROVED / PLANNED** |

No Fastify and no separate backend API application are part of this design.
Next.js remains the backend boundary for HTTP actions. The worker is a separate
process/container, not a new application architecture.

Phase 6 excludes face detection, embeddings, biometric processing, matching,
guest photo matching, and video. Cloudflare Stream remains **ON_HOLD**.

## 3. R2 bucket and object-key strategy — SELECTED_NOT_INTEGRATED / PLANNED

Use a private Cloudflare R2 bucket. Credentials are server-only. Browsers receive
short-lived signed operations, never bucket credentials, public object URLs, or
unscoped internal keys.

The canonical original key is:

```text
galleries/{galleryId}/{photoId}/versions/{versionId}/original.jpg
```

Derivatives use equivalent version-specific paths, for example:

```text
galleries/{galleryId}/{photoId}/versions/{versionId}/download.jpg
galleries/{galleryId}/{photoId}/versions/{versionId}/gallery.webp
galleries/{galleryId}/{photoId}/versions/{versionId}/thumbnail.webp
```

Every object is owned by exactly one gallery and photo version. The database
records the active version and derivative metadata/status; object-key input must
never be accepted without gallery-scoped authorization. Replacements create new
version IDs and never overwrite old objects.

## 4. Upload authorization and direct-upload flow — APPROVED / PLANNED

An authenticated Admin selects JPEG/JPG files for a gallery. Next.js validates
the Admin's authority and gallery scope, creates or resumes an upload session,
and generates a signed R2 upload authorization valid for 15 minutes.

The browser uploads directly to the private R2 bucket. The initial client
concurrency target is five uploads, dynamically adjusted according to network
and system performance. The UI reports each photo and the total batch, supports
pause, resume, cancel, retry, and partial success, and targets batches of
1,000–3,000 photos.

The original limit is 50 MB per photo. A browser MIME type, filename, or upload
success response is not proof of validity. The server must verify the completed
object before accepting a media record.

## 5. Single and multipart upload behavior — APPROVED / PLANNED

- Files up to and including 10 MB use a single signed upload.
- Files above 10 MB and up to 50 MB use multipart upload with 8 MB parts.
- Failed multipart parts retry independently; completed parts are not uploaded
  again unnecessarily.
- Pause preserves resumable state. Resume reuses the same session while it is
  valid. Cancel aborts the incomplete upload and schedules/executes safe
  multipart cleanup.
- An incomplete single upload or multipart upload must not create an accepted
  media record.
- Multipart completion must be explicitly finalized server-side after the
  browser reports part completion. Stale multipart uploads must be aborted and
  their temporary objects cleaned up without touching completed photos.
- R2 lifecycle rules or an equivalent cleanup job should remove abandoned
  multipart state; the exact R2 lifecycle configuration remains an operational
  implementation detail to verify before deployment.

## 6. Server-side completion verification — APPROVED / PLANNED

Before creating an accepted photo/media record, Next.js must verify all of the
following against R2:

1. The expected object exists.
2. The object size matches the declared and recorded size.
3. The SHA-256 checksum matches the client/session checksum.
4. The object content decodes as a valid JPEG.

The browser's completion response is only an input to this verification. Failed
verification leaves the object unaccepted and the upload/session failure
visible to the Admin. The system must clean up an unaccepted object when safe,
or retain it only under an explicitly tracked cleanup state; cleanup failure
must be retried and audited. Do not enqueue processing before verification
succeeds.

## 7. Upload sessions, resume and cleanup — APPROVED / PLANNED

An upload session records its creating Admin, gallery, selected files, transfer
mode, part state, checksums, object keys, and activity timestamps. It expires
seven days after last activity. Only the Admin who created it may resume or
cancel it.

Expiration cleanup aborts unfinished multipart uploads and removes only
unaccepted temporary objects/session state. It must never delete a completed
photo or an object referenced by an accepted media/version record. Successful
files remain available when other batch items fail, and retrying failed files
must not create duplicate accepted media records.

The exact session and cleanup models, indexes, idempotency keys, and migration
are **PLANNED** and must be approved and implemented separately; this document
does not alter the Prisma schema.

## 8. Queue and worker architecture — SELECTED_NOT_INTEGRATED / PLANNED

After successful upload verification and accepted-record creation, Next.js enqueues
a BullMQ photo-processing job in Upstash Redis. Upstash Redis is the selected
service, but its BullMQ compatibility, connection mode, TLS behavior, command
support, persistence, limits, and operational fit must be validated before
implementation. This is **DECISION_REQUIRED**, not an assumed compatibility
claim.

The worker runs as a separate process/container from the same Next.js repository.
It consumes photo jobs, reads originals from private R2 using server-only
credentials, runs Sharp, writes versioned derivatives to R2, and updates
database status. It does not expose a new HTTP backend API and does not use
Fastify.

Worker operations require:

- bounded concurrency adapted to available CPU and RAM;
- graceful shutdown and job lock/lease handling;
- structured logs without secrets or sensitive image data;
- health/readiness visibility suitable for deployment monitoring; and
- recovery of interrupted jobs through BullMQ retry/recovery behavior.

Worker deployment topology, resource limits, autoscaling, and health checks are
**PLANNED** and must not be described as deployed.

## 9. Image processing and derivative outputs — APPROVED / PLANNED

Sharp is the approved library. The worker preserves the original bytes and
camera metadata, and writes these outputs:

| Output | Format | Specification |
| --- | --- | --- |
| Original | JPEG | Unchanged. |
| Download | JPEG | Quality 92. |
| Gallery | WebP | Maximum dimension 2,000px, quality 80. |
| Thumbnail | WebP | Maximum dimension 500px, 4:3 center crop, quality 65. |

Generated derivatives automatically correct EXIF orientation, use sRGB, and
strip GPS/location metadata. Stream-based processing is preferred where
practical. No fixed megapixel limit is imposed. Processing concurrency adapts
to CPU and RAM availability.

The original is never rewritten or deleted as a consequence of derivative
failure. A failed derivative leaves the original safe for retry, and no
incomplete derivative is published or delivered to guests.

## 10. Job lifecycle, idempotency and retry — APPROVED / PLANNED

Processing is queued only after successful upload verification. Processing
status is separate from publication status, and each derivative has an
independent status.

The target lifecycle is:

```text
verified -> queued -> processing -> derivative-ready/failed
                                      |
                                      v
                              published when authorized
```

Each photo receives three automatic processing attempts. Failed derivatives may
be retried independently where technically feasible. Successful derivatives
are not regenerated unnecessarily. An Admin can manually retry processing
without uploading the original again.

Jobs must be idempotent by photo version and derivative type. A retry must
reconcile existing object/checksum/status state before writing, avoid duplicate
records, and never mark a derivative ready until its object write and metadata
update succeed. Publication is a separate authorized action; missing or
incomplete derivatives are never available to guests.

## 11. Replacement and version retention — APPROVED / PLANNED

A replacement creates a new photo version and new version-specific original and
derivative keys. The previous version is never overwritten.

The replacement becomes active and published only after its required processing
succeeds. If processing fails, the previous published version remains active
and guest-visible. The incomplete replacement is never exposed.

The previous version is retained for 30 days after replacement, then permanently
removed by retryable cleanup. Cleanup must check that the object/version is no
longer current before deletion and must never delete the current active version.

## 12. Trash, deletion and storage cleanup — APPROVED / PLANNED

Deleting a photo is a soft delete to Trash for 30 days. Guest access is removed
immediately after the soft-delete state is committed. Only a Master Admin may
restore a Trash item or permanently delete it, with required confirmation.

Permanent deletion removes the original, all derivatives and thumbnails, and
associated processing records. Storage deletion is retryable and must be
idempotent. Database state must distinguish a requested/deleting/failed cleanup
from a completed permanent deletion so an operational retry cannot delete an
unrelated newer version. Deletion, restoration, and permanent deletion are
audit events.

## 13. Security and privacy boundaries

- The R2 bucket is private; no public bucket policy or public object URL is used.
- R2 credentials and signing authority remain server-only.
- Upload authorization, session operations, media operations, publication, and
  delivery are gallery-scoped and Admin/visitor-authorized.
- Signed upload authorization lasts 15 minutes. Guest delivery URLs also expire
  after 15 minutes.
- Only JPEG/JPG originals up to 50 MB are accepted at the target boundary.
- Validate object existence, size, SHA-256, and actual JPEG decoding server-side.
- Do not grant guest original-file access or ZIP downloads.
- Do not expose incomplete or missing derivatives.
- Do not use gallery-entry consent as face-search consent. No face data is
  processed in Phase 6.
- Do not log credentials, signed URLs, passwords, selfie data, or unnecessary
  sensitive image metadata.
- Enforce retention, deletion, gallery isolation, audit, and rate-limit
  controls as part of implementation and security verification.

## 14. Failure handling and recovery

The target must surface and recover from unsupported/corrupt files, size
violations, interrupted transfers, failed multipart completion, checksum or
object mismatch, storage outages, worker crashes, derivative failures,
replacement failures, and cleanup failures.

Recovery rules are:

- retry only the failed upload part, job, derivative, or cleanup operation where
  possible;
- preserve successful batch items and the original through downstream failure;
- use idempotency to prevent duplicate accepted records and duplicate work;
- keep the previous published version active during failed replacement;
- abort and clean up incomplete multipart state without deleting completed media;
- keep unresolved cleanup visible to operations and retryable;
- remove guest access immediately after soft deletion; and
- fail closed for cross-gallery, unauthorized, incomplete, or missing objects.

## 15. Dependencies, operational requirements and acceptance criteria

### Dependencies and status

| Dependency / requirement | Status |
| --- | --- |
| Supabase PostgreSQL database | **IMPLEMENTED** foundation; Phase 6 schema changes are planned |
| Existing storage abstraction and Supabase/R2 adapters | **IMPLEMENTED** code; provider provisioning/integration remains unverified |
| Cloudflare R2 private bucket and signing configuration | **SELECTED_NOT_INTEGRATED** |
| Upstash Redis BullMQ compatibility validation | **DECISION_REQUIRED** |
| BullMQ and separate worker process/container | **SELECTED_NOT_INTEGRATED / PLANNED** |
| Sharp derivative worker | **APPROVED / PLANNED** |
| Prisma migrations for sessions, versions, derivatives, statuses, Trash | **PLANNED** |
| Video / Cloudflare Stream | **ON_HOLD** |
| Face detection, embeddings, matching | **ON_HOLD / deferred from Phase 6** |

Before deployment, verify the selected R2 and Upstash services, credentials,
private access policies, queue connectivity/TLS, worker resource limits,
health checks, logs, alerts, retry behavior, backups, retention jobs, and
restore/deletion procedures. Do not claim Lightsail, R2, Upstash, BullMQ, or the
worker is deployed without evidence.

### Acceptance criteria

The architecture is ready for implementation when:

1. Every target requirement in `docs/product/MEDIA_PIPELINE.md` maps to an
   authorized Next.js, R2, database, BullMQ, or worker responsibility.
2. The current route and provider limitations above remain explicitly separate
   from the target.
3. Direct upload, 15-minute authorization, 50 MB JPEG-only validation, 10 MB
   single-upload threshold, 8 MB multipart parts, independent part retries,
   five-upload initial concurrency, batch progress, pause/resume/cancel, and
   seven-day session ownership are testable.
4. Completion verification rejects missing, mismatched, checksum-invalid, or
   non-JPEG objects before record creation or queueing.
5. The worker produces the four specified outputs with metadata/privacy rules,
   three automatic attempts, independent derivative status, idempotency, and
   manual retry.
6. Version replacement, 30-day retention, Trash, permanent deletion, retryable
   cleanup, current-version protection, and audit behavior are testable.
7. Guest delivery remains private, short-lived, gallery-scoped, derivative-only,
   and fails closed for unavailable objects.
8. Upstash/BullMQ compatibility and worker deployment assumptions are verified
   before implementation rather than inferred from package or service names.

No Prisma schema, migration, source code, dependency, deployment, or diagram
change is authorized by this documentation-only step.

