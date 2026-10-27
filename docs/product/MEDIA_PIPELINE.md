# Photo Media Pipeline — Product Specification

**Status:** Planned; not implemented  
**Last reconciled:** 2026-10-27

## 1. Purpose and scope

The media pipeline allows the photographer to add photographs to a private wedding/event gallery and makes validated, processed images available to authorized guests.

Current scope is photos only. Cloudflare R2 is selected for private photo storage and Redis + BullMQ are selected for background jobs, but neither is integrated. Cloudflare Stream/video is on hold.

## 2. Actors

- Photographer/admin initiates uploads and manages media.
- Uploading browser selects files and reports progress.
- Processing service validates and prepares photo variants.
- Gallery guest views authorized published photos.

## 3. Intended product workflow

1. Admin opens a specific gallery.
2. Admin selects one or more photo files.
3. Interface validates basic selection constraints and communicates unsupported files before upload where possible.
4. System authorizes the upload for that gallery.
5. Browser uploads files to the private storage workflow.
6. System verifies upload completion and associates each accepted original with the intended gallery.
7. Background processing validates/decodes the image and prepares approved derivatives.
8. Admin sees per-file status: queued, processing, ready, or failed.
9. Admin can retry a recoverable failure without creating duplicate gallery media.
10. Admin sets cover and ordering, then publishes the ready photos.
11. Authorized guests view the published variants through gallery-scoped delivery.

This workflow is target behavior, not current functionality.

## 4. Product requirements

### File selection and validation
- Communicate accepted formats and size/count limits before implementation ships.
- Reject unsupported or corrupt files with a useful per-file explanation.
- Do not trust filename extension or browser-supplied MIME type as proof of file content.
- Define duplicate-file behavior.
- Define whether animated formats, RAW files, HEIC, and very large panoramas are supported; these are currently open.

No accepted-format list, maximum file size, batch size, or total gallery quota has been approved in the available product decisions. Do not invent numeric limits.

### Upload progress
- Show per-file progress and overall batch progress.
- Allow users to distinguish uploading from processing.
- Preserve successful files when another file in the batch fails.
- Clearly identify which files need retry.
- Avoid losing the entire batch because of one file error.

### Processing
Future processing may include:
- Safe image decoding and validation.
- Orientation correction.
- Metadata extraction where approved.
- Thumbnail and display derivative generation.
- Preservation of an original according to retention policy.
- Derivative dimensions/quality appropriate to the gallery experience.

Exact derivative sizes, formats, metadata stripping/retention, and original-file policy remain open.

### Media management
- Associate every media item with exactly one gallery.
- Support a cover designation and deterministic sort order.
- Allow the photographer to remove, replace, reorder, and publish media.
- Prevent unprocessed or failed media from appearing as ready guest content.
- Preserve gallery-scoped access on every media request.

## 5. Failure and recovery behavior

The admin must be able to understand:
- Unsupported format.
- File too large or batch limit exceeded (once limits are approved).
- Upload interrupted.
- Upload completion not verified.
- File corrupt or unsafe to decode.
- Processing job failed.
- Storage temporarily unavailable.
- Derivative generation failed.
- Media removed before processing completes.

A retry must not create duplicate media records or publish incomplete derivatives. If only part of a batch succeeds, successful items remain available for review while failed items remain clearly identified.

## 6. Privacy and delivery

- Store originals and derivatives in private Cloudflare R2 storage when integrated.
- Never expose bucket credentials or raw internal storage keys to browsers.
- Guest delivery must verify gallery and visitor authorization.
- A media identifier from another gallery must not be usable to retrieve an object.
- Public caching must not make private event photos publicly retrievable.
- Define metadata treatment, including location/GPS and camera metadata, before public guest delivery.

## 7. Current implementation boundary

Current Prisma `GalleryMedia` contains `galleryId`, `storageKey`, `altText`, `sortOrder`, and `isCover`. The current gallery media route resolves media inside the validated gallery. Development media is generated as placeholders; non-development storage delivery returns 503 because production storage integration is not implemented.

No production upload UI, R2 integration, processing job model, worker, derivatives pipeline, or processing dashboard is implemented.

## 8. Open decisions

- Supported file formats, including HEIC/RAW/animated formats.
- Maximum file size, batch size, gallery quota, and upload concurrency.
- Duplicate detection and replacement semantics.
- Original retention and derivative policy.
- Metadata extraction and GPS/EXIF stripping.
- Derivative dimensions, formats, and quality.
- Whether guests can download originals or only optimized display images.
- Upload cancellation and partial batch recovery behavior.
- Failed-job visibility and retry limits from a user perspective.
- Deletion propagation to derivatives, caches, and backups.

## 9. Out of scope

- Video upload or playback.
- Public photo hosting.
- Face detection/embedding/matching as part of ordinary photo processing.
- AI enhancement or editing unless separately approved.
