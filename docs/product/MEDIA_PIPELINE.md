# Phase 6 — Photo Upload and Processing Pipeline

**Status:** Approved target specification; implementation not complete  
**Scope:** Photos only  
**Last reconciled:** 2026-11-22

## 1. Purpose and scope

Phase 6 defines the photographer's photo upload, validation, processing,
publishing, replacement, deletion, and private guest-delivery workflow for a
single-photographer wedding/event gallery.

The current repository has gallery media records and local development media
behavior. Cloudflare R2, Redis + BullMQ, direct browser uploads, the processing
worker, derivative generation, resumable upload sessions, and the Phase 6 media
management workflow are **Planned / not implemented**. This document specifies
the approved target behavior; it does not change that implementation status.

Photos are the only media type in this phase. Video and Cloudflare Stream are
**On Hold**. Face detection, embeddings, face matching, biometric processing,
and guest photo matching are postponed and must not be added to the Phase 6
photo worker.

## 2. Status and implementation boundary

| Area                                                              | Status                        | Boundary                                                                     |
| ----------------------------------------------------------------- | ----------------------------- | ---------------------------------------------------------------------------- |
| Gallery media foundation                                          | **Implemented**               | Existing schema and routes remain the current source of truth.               |
| Gallery-scoped private access                                     | **Implemented**               | Existing signed token and visitor-cookie behavior remains in force.          |
| Admin authentication foundation                                   | **Partially implemented**     | Existing Phase 5 implementation is not the Phase 6 role/invitation workflow. |
| Cloudflare R2 private photo storage                               | **Selected / Not Integrated** | Target storage; no production R2 workflow is claimed.                        |
| Redis + BullMQ processing                                         | **Selected / Not Integrated** | Target queue and worker; no production worker is claimed.                    |
| Upload sessions, multipart upload, derivatives, publishing, Trash | **Planned**                   | Approved Phase 6 target behavior below.                                      |
| Face processing and guest photo matching                          | **Deferred / On Hold**        | No face data is processed in Phase 6.                                        |
| Video / Cloudflare Stream                                         | **On Hold**                   | Outside current scope.                                                       |

Existing routes, models, and behavior must not be described as providing the
planned workflow until implementation and verification exist.

## 3. Actors and permissions

| Actor        | Permissions                                                                                                                          |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| Admin        | Upload, resume/cancel own upload sessions, process, publish, replace, reorder, and move photos to Trash.                             |
| Master Admin | All Admin permissions, plus view Trash, restore, permanently delete, invite Admins, promote Admins, and manage role/account changes. |
| Guest        | Register for a gallery and view authorized published derivatives only. Guests never receive original-file access.                    |

The existing Admin account becomes Master Admin through a one-time migration and
retains its credentials. New Admin accounts are created through single-use email
invitations that expire after 24 hours; invitees set their own passwords.
Multiple Master Admins are allowed. A Master Admin may promote an Admin, but the
last active Master Admin may never be deactivated or demoted. Role and account
changes require confirmation and audit logging.

## 4. Upload workflow

1. An authorized Admin selects JPEG/JPG photos for one gallery.
2. The client shows per-photo and overall batch progress and performs early
   checks where possible; server validation remains authoritative.
3. Next.js issues a gallery-scoped signed R2 upload URL valid for 15 minutes.
4. Files up to 10 MB use a single upload. Files above 10 MB use multipart
   upload with 8 MB parts. Failed multipart parts retry independently.
5. The browser uploads directly to private R2 using controlled parallelism,
   initially targeting five concurrent uploads. Concurrency may adjust based on
   network and system performance.
6. The Admin can pause, resume, cancel, and retry. Successful files remain
   successful when other files fail; failed items can be retried without
   re-uploading completed items.
7. The server verifies the completed object before creating an accepted media
   record. A browser success response alone is insufficient.
8. Accepted originals enter background processing. Processing status is shown
   separately from publication status.

Upload batches target 1,000–3,000 photos. An upload session belongs to the Admin
who created it; only that Admin may resume or cancel it. Sessions remain
resumable for seven days after last activity. Expired unfinished sessions are
cleaned up after seven days, without deleting completed photos.

## 5. File validation and duplicate detection

Only JPEG/JPG files are accepted. The server must validate actual file content,
not only the filename extension or browser MIME type, and must reject corrupt or
unsupported images. The original camera upload is preserved unchanged.

Before an accepted media record is created, server-side verification must confirm:

- the R2 object exists;
- the object size matches the upload declaration;
- the SHA-256 checksum matches; and
- the actual content is a valid JPEG.

Possible duplicates produce a warning using filename, file size, and SHA-256.
Duplicates are not blocked automatically; the Admin may continue or cancel.

## 6. Image processing and derivative specifications

Sharp runs in a separate background worker. Processing uses stream-based handling
where practical, dynamically manages concurrency using available CPU and RAM,
and imposes no fixed megapixel limit.

| Output          | Format | Requirements                                                     |
| --------------- | ------ | ---------------------------------------------------------------- |
| Original        | JPEG   | Preserve the uploaded file unchanged, including camera metadata. |
| Client download | JPEG   | Quality 92; this is the only guest download variant.             |
| Gallery image   | WebP   | Maximum dimension 2,000px; quality 80.                           |
| Thumbnail       | WebP   | Maximum dimension 500px; 4:3 center crop; quality 65.            |

Generated outputs automatically correct EXIF orientation, use sRGB, and strip
GPS/location metadata. Original camera metadata remains in the original only.
The system must not publish or expose an incomplete derivative. If processing
fails, the original is preserved safely for retry or recovery.

## 7. Processing states and retry behavior

Redis + BullMQ manage background jobs. Each photo receives three automatic retry
attempts. Processing status is separate from publication status, and every
derivative tracks its own status.

Successful derivatives are not regenerated unnecessarily. Failed derivatives
are retried independently where technically feasible. Admins can manually retry
processing failures without uploading the original again. Failed, unavailable,
or incomplete derivatives are never exposed to guests.

The target state model must distinguish at least upload verification, queued,
processing, ready, failed, published, and soft-deleted conditions, while keeping
derivative-level failures visible to the Admin. Exact schema additions remain
implementation work and must be proposed and migrated before use.

## 8. Publishing and guest delivery

Admins may publish individual photos or bulk-select photos after review. An
Admin may publish an original photo even when one or more derivatives have
failed, provided every derivative required for the selected guest operation is
available. The system must never return a broken guest URL for a missing
derivative.

Guest delivery remains private and gallery-authorized. Guest image URLs expire
after 15 minutes. Guests receive optimized gallery images and may download only
the quality-92 client-download JPEG, one photo at a time. ZIP downloads and
original-file access are not supported.

Guest event URLs must not expose a public photo listing. Every media lookup and
delivery authorization must remain scoped to the validated gallery and visitor
grant.

## 9. Replacement and version lifecycle

R2 objects use versioned keys:

```text
galleries/{galleryId}/{photoId}/versions/{versionId}/original.jpg
```

Derivative keys use equivalent version-specific paths. Replacements never
overwrite a previous version. The previous version is retained for 30 days
after replacement and then permanently deleted. Failed cleanup operations are
retried.

After successful replacement processing, the new version automatically becomes
active and published. If replacement processing fails, the previous published
version remains active. Incomplete replacement derivatives are never exposed.

## 10. Trash and permanent deletion

Photo deletion is a soft delete to Trash. Deleted photos disappear from guest
access immediately and remain restorable for 30 days. Only a Master Admin may
view Trash, restore an item, or permanently delete it earlier with mandatory
confirmation.

Permanent deletion removes originals, derivatives, thumbnails, and related
processing records. Storage cleanup is retried on failure. Deletion,
restoration, and permanent deletion are audit events. Cleanup must not remove a
newer active version or a completed photo outside the requested scope.

## 11. Guest registration and privacy boundary

Guest registration for a gallery includes selfie capture/upload, name, email,
mobile, Terms and Conditions, and a separate explicit consent choice for future
face matching. No OTP is required. A repeat registration for the same gallery
and email updates the existing registration rather than creating a duplicate.

Selfies are retained for one day; contact information is retained for 90 days.
Consent evidence is separate from gallery-entry consent. The face-matching
choice is optional, affirmative, unchecked by default, purpose-specific, and
must not control ordinary gallery access. Phase 6 does not process selfies for
face matching, create embeddings, or perform guest photo matching. Face matching
and its data lifecycle are deferred to a later approved phase.

## 12. Failure and recovery behavior

The Admin-facing workflow must identify unsupported/corrupt files, size or
batch-limit failures, interrupted uploads, failed completion verification,
temporary storage failures, processing failures, derivative failures, and media
removed during processing.

- Retry only failed uploads, multipart parts, jobs, or derivatives where possible.
- Preserve successful batch items and the original during downstream failures.
- Make retries idempotent and avoid duplicate media records.
- Keep a previous published version active during a failed replacement.
- Retry storage cleanup and surface unresolved cleanup failures for operations.
- Never expose incomplete, missing, cross-gallery, or unauthorized content.

## 13. Security requirements

- Keep R2 private; never expose bucket credentials or internal object keys to browsers.
- Use short-lived, gallery-scoped upload authorization and 15-minute delivery URLs.
- Authorize every upload session, media operation, and guest delivery server-side.
- Bind upload-session resume/cancel rights to the creating Admin.
- Validate content, size, checksum, object existence, and JPEG decodability server-side.
- Apply rate limits, audit events, confirmation, and authorization to role/account,
  publishing, replacement, Trash, restoration, and permanent deletion actions.
- Do not use gallery-entry consent as face-search consent.
- Keep selfies and contact data on their stated retention schedules and do not
  process biometric data in Phase 6.
- Isolate gallery object keys and prevent identifiers from another gallery from
  retrieving media.
- Do not cache private guest photos publicly or log secrets, passwords, tokens,
  or selfie data unnecessarily.

## 14. Acceptance criteria

Phase 6 is accepted only when verified implementation demonstrates that:

1. JPEG-only, 50 MB-per-photo uploads reject invalid content and preserve valid
   originals unchanged.
2. Single and multipart uploads use the approved thresholds, checksum/object
   verification, independent part retries, resumability, cancellation, and
   partial-success behavior.
3. Duplicate warnings, per-photo progress, overall progress, and controlled
   concurrency work for the 1,000–3,000-photo target batch.
4. Sharp produces the specified derivatives with orientation correction, sRGB,
   GPS stripping, and independently tracked statuses.
5. BullMQ retries each photo three times, supports safe manual/derivative retry,
   and does not regenerate successful outputs unnecessarily.
6. Individual/bulk publishing, 15-minute private URLs, optimized downloads,
   no original access, and no ZIP downloads are enforced.
7. Versioned replacement, 30-day previous-version retention, safe rollback on
   failure, Trash restoration, permanent deletion, cleanup retries, and audit
   events are verified.
8. Admin/Master Admin permissions, invitations, confirmations, last-Master-
   Admin protection, and audit logging are enforced.
9. Guest registration retention and separate optional face-search consent are
   implemented without any Phase 6 face processing or access dependency.
10. Unit, integration, security, and end-to-end tests cover authorization,
    isolation, failure recovery, retention, and privacy boundaries.

## 15. Deferred features

- Video upload, playback, and Cloudflare Stream (**On Hold**).
- Face detection, embeddings, face matching, biometric processing, and guest
  photo matching (**Deferred / Evaluation Only architecture; not Phase 6**).
- Public photo hosting, original-file guest access, and ZIP downloads.
- Any multi-studio SaaS, payments, booking, or other outside-scope product work.

R2 provisioning, Redis/BullMQ deployment, worker topology, schema/migration
changes, exact API contracts, retention-job operations, and production
infrastructure remain implementation and verification work. They must not be
reported as implemented until source, migrations, configuration, tests, and
deployment evidence confirm them.
