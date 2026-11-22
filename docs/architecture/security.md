# Security and privacy

## 1. Current implemented security controls — IMPLEMENTED

- Gallery links are signed and contain gallery ID, nonce, token version, and a
  30-day expiry. Token version is checked against the gallery, allowing
  revocation.
- Gallery entry uses an HTTP-only signed cookie with 12-hour lifetime,
  SameSite=Lax, `/gallery` path scope, and Secure in production.
- Gallery and visitor authorization are revalidated server-side. Media IDs are
  resolved inside the validated gallery, and non-cover media requires a
  gallery-scoped visitor grant.
- Private gallery responses set no-store/no-index protections.
- The current gallery-entry form records name, mobile, email, and
  `GalleryVisitor.consent`. That consent means gallery entry only, not
  face-search consent.
- The Phase 5 admin foundation includes database-backed authentication, Argon2id
  password verification, TOTP verification, hashed session tokens, protected
  dashboard routes, login rate limiting, origin checking on the current upload
  route, and audit-event writes.
- The current upload route is a server-side multipart form upload, buffers one
  file, checks content signatures, and currently limits each file to 15 MB.
  It is not the approved direct-to-R2, resumable, 50 MB JPEG-only workflow.
- The storage abstraction has server-side Supabase and R2 adapters. Their
  presence does not prove production provisioning, private-bucket policy, or
  Phase 6 integration.

The current system has no Phase 6 upload-session authorization, signed browser
upload flow, object checksum completion contract, derivative authorization,
BullMQ worker, Trash workflow, role/invitation workflow, or face processing.

## 2. Phase 6 target security architecture — APPROVED / PLANNED

Next.js remains the frontend and backend authorization boundary. It authorizes
Admins, creates gallery-scoped signed R2 upload operations, verifies completed
objects, records database state, queues BullMQ jobs in the selected Upstash Redis
service, and issues short-lived guest delivery URLs. A separate worker in the
same repository reads private R2 originals and writes derivatives with Sharp.

R2 is a private bucket. Credentials remain server-only. No public bucket,
public object URL, Fastify service, standalone backend API, video pipeline, or
face-processing path is part of Phase 6.

## 3. Admin authentication and role authorization — APPROVED / PLANNED

The target roles are `ADMIN` and `MASTER_ADMIN`. Authorization is checked
server-side on every operation, not inferred from UI visibility.

- Admin may upload, process, publish, replace, and move photos to Trash.
- Only Master Admin may view Trash, restore, or permanently delete.
- The existing Admin becomes Master Admin through a one-time migration while
  retaining credentials and secure sessions.
- New Admins use single-use email invitations that expire after 24 hours and
  set their own password.
- Multiple Master Admins are allowed.
- The last active Master Admin cannot be deactivated or demoted.
- Role and account changes require confirmation and audit logging.

The existing Phase 5 authentication controls remain distinct from this planned
role and invitation extension.

## 4. Upload authorization and session ownership — APPROVED / PLANNED

Next.js creates or resumes an upload session only after validating the Admin and
gallery scope. The session records its creating Admin. Only that same Admin may
resume or cancel it, and authorization is revalidated on every session action.

Sessions expire seven days after last activity. Cleanup affects only unfinished
uploads and temporary multipart state. It must never delete a completed photo or
an object referenced by an accepted media/version record.

Upload authorization is gallery-scoped and short-lived. Direct browser transfer
does not grant permission to create accepted media; acceptance follows
server-side verification.

## 5. Private R2 storage and signed URLs — SELECTED_NOT_INTEGRATED / PLANNED

- Next.js generates signed R2 upload authorizations valid for 15 minutes.
- The browser uploads directly to the private R2 bucket.
- R2 access keys and signing credentials never reach the browser.
- Upload keys are gallery- and version-scoped.
- Guest derivative URLs also expire after 15 minutes.
- No public R2 bucket or public object URL is permitted.
- Signed URLs are not logged. Replayed or expired operations are rejected by
  expiry, scope, and server-side state checks.

## 6. Upload validation and server-side verification — APPROVED / PLANNED

The target accepts JPEG/JPG originals up to 50 MB. Up to 10 MB uses one upload;
larger files use 8 MB multipart parts. Failed parts retry independently.

Before an accepted media record or processing job exists, Next.js verifies:

1. the expected R2 object exists;
2. its size matches;
3. its SHA-256 checksum matches; and
4. its actual content is a valid JPEG.

Filename, browser MIME type, and browser completion response are untrusted.
Invalid, incomplete, failed, or abandoned uploads cannot become accepted media,
and cleanup is tracked and retryable. Processing is not enqueued before
verification succeeds.

Original bytes and camera metadata remain unchanged. Generated derivatives use
sRGB and strip GPS/location metadata. Signed URLs, credentials, passwords, raw
selfies, and sensitive image metadata are not logged unnecessarily.

## 7. Guest image delivery authorization — APPROVED / PLANNED

Guest event URLs lead to registration and authorization, not a public photo
listing. Before issuing a signed derivative URL, Next.js rechecks the gallery
token/visitor authorization and the media's gallery ownership.

Guests receive only available optimized derivatives: the gallery WebP and the
quality-92 download JPEG. Originals and ZIP downloads are never available.
Missing or incomplete derivatives produce no URL and no broken guest response.
Private media responses must not be publicly cached.

## 8. Guest registration and consent separation — APPROVED / PLANNED

Registration includes selfie capture/upload, name, email, mobile, Terms and
Conditions, and a separate optional affirmative consent for future face
matching. No OTP is required. A same-gallery, same-email registration updates
the existing record.

Selfies are retained for one day and contact details for 90 days. Consent
evidence is separate from `GalleryVisitor.consent`; the latter remains
gallery-entry consent only. Face consent is unchecked by default, and declining
it cannot block ordinary gallery access. Phase 6 performs no face detection,
embedding, biometric processing, matching, or guest photo matching.

## 9. Retention and deletion security — APPROVED / PLANNED

Replacements write new versioned R2 keys. If replacement processing fails, the
old published version remains active. The old version is retained for 30 days
after replacement and then removed by retryable cleanup that protects the
current active version.

Photo deletion is a soft delete to Trash for 30 days and removes guest access
immediately. Only Master Admin may restore or permanently delete. Permanent
deletion covers originals, derivatives, thumbnails, and processing records.
Storage failures are retried; deletion, restoration, permanent deletion, and
cleanup outcomes are audited.

## 10. Audit events and abuse prevention — APPROVED / PLANNED

Audit role/account changes, invitation acceptance/revocation, upload-session
actions, upload verification failures, publishing, replacement, Trash,
restoration, permanent deletion, and cleanup failures. Do not put secrets or
raw signed URLs in audit metadata.

Apply existing and target rate limits to admin login, upload authorization,
completion verification, guest registration, signed delivery issuance, and
destructive actions. Require confirmation for role changes and permanent
deletion. Use idempotency for upload completion, processing jobs, retries, and
cleanup.

## 11. Threats and failure handling

| Threat                                  | Required control                                                                                                |
| --------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Unauthorized Admin access               | Existing authentication/MFA/session controls; server-side role checks; revocation and rate limits.              |
| Admin role escalation                   | Explicit role authorization, confirmation, audit logging, and last-Master-Admin protection.                     |
| Cross-gallery object access             | Gallery-scoped records, keys, authorization, and delivery checks.                                               |
| Forged upload completion                | Server-side R2 existence, size, SHA-256, and JPEG validation.                                                   |
| Malicious or corrupt JPEG               | Actual content decoding/validation before acceptance or processing; preserve original on failure.               |
| Replayed/expired signed URL             | 15-minute expiry plus gallery/session/object state validation.                                                  |
| Upload-session takeover                 | Bind session actions to the creating Admin and revalidate each action.                                          |
| Duplicate/replayed processing jobs      | Version/derivative idempotency keys and independent status reconciliation.                                      |
| Missing derivative delivery             | Check derivative readiness before issuing a URL; fail closed.                                                   |
| Public cache or R2 exposure             | Private bucket, server-only credentials, no-store/private delivery, no public URLs.                             |
| Unauthorized restore/permanent deletion | Master Admin authorization, confirmation, audit, and version-aware cleanup.                                     |
| Cleanup deletes active version          | Check current active version before every deletion; retry safely.                                               |
| Sensitive log leakage                   | Redaction and structured logging that excludes credentials, URLs, passwords, selfies, and unnecessary metadata. |

Storage outages, worker crashes, failed derivatives, replacement failures, and
cleanup failures must preserve successful work, keep the previous published
version active where applicable, and expose only authorized complete content.

## 12. Acceptance criteria

The target security architecture is accepted when verified implementation proves:

1. Current controls remain accurate and are not represented as Phase 6 features.
2. Admin roles, invitations, session ownership, and server-side authorization
   enforce the approved permissions.
3. Upload authorization is gallery-scoped, private, 15-minute, direct-to-R2,
   and limited to the creating Admin's seven-day session.
4. Completion rejects missing, mismatched, checksum-invalid, corrupt, or
   non-JPEG objects before media acceptance or queueing.
5. Guest delivery rechecks authorization, expires after 15 minutes, exposes only
   ready optimized derivatives, and never exposes originals or ZIPs.
6. Replacement, Trash, retention, cleanup, and destructive actions are
   version-aware, auditable, retryable, and fail closed.
7. Logging, caching, rate limits, and consent handling satisfy the privacy
   boundaries above.
8. No Phase 6 code path processes biometric or face data.

## 13. Deferred security features

- Face detection, embeddings, biometric processing, face matching, and guest
  photo matching.
- Video and Cloudflare Stream.
- Any public photo hosting or original-file guest delivery.
- Shared wedding-password implementation and its final rotation/abuse policy,
  which remains a separate selected/pending feature.
- Production verification of R2 provisioning, Upstash/BullMQ compatibility,
  worker deployment, retention jobs, backups, and incident recovery.

See [auth flow](../diagrams/04-auth-authorization-flow.mmd),
[gallery flow](../diagrams/05-private-gallery-access-flow.mmd), and
[storage architecture](storage-and-processing.md).
