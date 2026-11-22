# Database architecture

## 1. Current schema — IMPLEMENTED

The authoritative current schema is `prisma/schema.prisma` and the migrations
under `prisma/migrations/`. The following models and fields exist today.

### Gallery

- `id`: primary key, CUID.
- `title`: required.
- `isActive`: required Boolean, default `true`.
- `tokenVersion`: required Int, default `1`.
- `opensAt`, `closesAt`: nullable DateTime.
- `createdAt`, `updatedAt`: timestamps; `updatedAt` is updated by Prisma.
- Relations: one-to-many `media` and `visitors`.

### GalleryMedia

- `id`: primary key, CUID.
- `galleryId`: required foreign key to `Gallery), with cascade delete.
- `storageProvider`: `StorageProvider` enum, default `SUPABASE`; enum values
  are `SUPABASE` and `R2`.
- `storageKey`: required internal object key, not a public URL.
- `altText`: required.
- `mimeType`, `sizeBytes`, `width`, `height`: nullable.
- `sortOrder`: required Int, default `0`.
- `isCover`: required Boolean, default `false`.
- `createdAt`, `updatedAt`: timestamps.
- Index: `[galleryId, sortOrder]`.

### GalleryVisitor

- `id`: primary key, CUID.
- `galleryId`: required foreign key to `Gallery), with cascade delete.
- `name`, `mobile`, `email`: required.
- `consent`: required Boolean.
- `consentedAt`: required DateTime.
- `createdAt`, `updatedAt`: timestamps.
- Constraint: unique `[galleryId, email]).
- Index: `[galleryId]`.

`GalleryVisitor.consent` and `consentedAt` represent gallery-entry consent
only. They are not face-search consent and must not be reused for biometric
processing or selfie consent evidence.

### AdminUser

- `id`: primary key, CUID.
- `email`: required and unique.
- `passwordHash`: required.
- `totpSecret`, `totpSecretEncrypted`: nullable.
- `createdAt`, `updatedAt`: timestamps.
- Relations: one-to-many `sessions` and `auditEvents`.

The current model does not have a role, active/deactivated state, invitation
state, or invitation token.

### AdminSession

- `id`: primary key, CUID.
- `adminId`: required foreign key to `AdminUser), cascade delete.
- `tokenHash`: required and unique.
- `lastSeenAt`: required DateTime, default `now()`.
- `expiresAt`, `revokedAt`: DateTime fields; `revokedAt` nullable.
- `createdAt`: timestamp.
- Indexes: `[adminId, revokedAt]` and `[expiresAt]`.

### AdminAuditEvent

- `id`: primary key, CUID.
- `adminId`: nullable foreign key to `AdminUser), set null on admin deletion.
- `action`, `targetId`: `action` required; `targetId` nullable.
- `metadata`: nullable JSON.
- `createdAt`: timestamp.
- Indexes: `[createdAt]` and `[adminId, createdAt]`.

### AdminLoginRateLimit

- `keyHash`: primary key.
- `windowStartedAt`: required DateTime.
- `failures`: required Int, default `0`.
- `cooldownUntil`: nullable DateTime.
- `updatedAt`: timestamp updated by Prisma.
- No relation to `AdminUser) is defined.

No upload session, uploaded-file, media-version, derivative, processing-job,
Trash, invitation, role, face-search-consent, or biometric model exists today.

## 2. Phase 6 target — APPROVED / PROPOSED

The following entities and fields are a database proposal for the approved Phase 6
workflow. They are not present in `prisma/schema.prisma), have no migration,
and must not be described as implemented. Exact names and enum representations
require schema review before implementation.

### Admin roles and invitations

Add a role field to `AdminUser) with exactly `ADMIN` and `MASTER_ADMIN`.
A proposed nullable/unique invitation relation may be represented by an
`AdminInvitation` entity because invitations have their own expiry, single-use,
and audit lifecycle.

Proposed invitation concepts:

- ID, inviter Admin ID, normalized invitee email, role to grant.
- Single-use token hash, created/accepted/expired timestamps, 24-hour expiry.
- Accepted Admin ID or equivalent link to the created account.
- Status such as pending, accepted, expired, revoked.
- Indexes on token hash, email/status, and expiry.
- Never store the raw invitation token.

The existing Admin becomes `MASTER_ADMIN) through a one-time migration while
retaining credentials and secure sessions. New invitees set their own password.
Multiple Master Admins are permitted. A transaction/authorization rule must
prevent deactivation or demotion of the last active Master Admin. Role and
account changes write `AdminAuditEvent) records.

### UploadSession

Propose an `UploadSession) entity for one Admin and one Gallery:

- ID, `adminId), `galleryId), status, created/last-activity/expiry timestamps.
- Cancellation and completion timestamps or equivalent terminal state.
- Progress/session metadata sufficient to resume and report batch progress.
- Relations to per-file upload records.
- Indexes for owner/session lookup and expiry cleanup.

Only the creating Admin may resume or cancel. An unfinished session expires
seven days after last activity. Cleanup must select only unfinished sessions and
must not delete any accepted/completed photo.

### UploadFile

Propose an `UploadFile) entity for each selected original:

- ID, `uploadSessionId), original filename, file size, SHA-256 checksum.
- Upload mode: `SINGLE) or `MULTIPART).
- R2 object key and optional R2 multipart upload ID.
- Upload, verification, and failure status/details.
- Part progress/status metadata only where needed to resume or retry.
- Created/updated/completed timestamps.

Do not mirror every transient multipart detail that R2 can provide. Store enough
state to identify the upload, retry failed parts, complete/abort it, and prove
server-side verification. The accepted media/version relation is created only
after object existence, size, checksum, and valid-JPEG verification succeed.

### MediaVersion

Retain `GalleryMedia) as the stable photo identity and propose a
`MediaVersion) child entity:

- ID/version ID, `mediaId), gallery ownership, and version number or unique ID.
- Version-specific original object key.
- Replacement predecessor relation where applicable.
- Created/replaced timestamps and previous-version retention deadline.
- Processing summary/state and separate publication state.
- Active/current-version designation enforced so one version is current per photo.

Canonical original key:

```text
galleries/{galleryId}/{photoId}/versions/{versionId}/original.jpg
```

Derivative keys use the same gallery/photo/version scope. Replacements insert a
new version and never overwrite the old one. The new version becomes active and
published only after successful required processing. If it fails, the previous
published version remains active. Replaced versions are retained for 30 days;
cleanup must never delete the current active version.

### MediaDerivative

Propose one `MediaDerivative) row per `MediaVersion) and derivative type:
`ORIGINAL), `DOWNLOAD), `GALLERY), or `THUMBNAIL). The original row
represents the unchanged original object; it does not mean the original is
rewritten by Sharp.

Each row should contain the version relation, type, version-specific R2 key,
format, dimensions/size/checksum where useful, processing status, failure
details, and timestamps. Processing status is independent from publication
status.

Target outputs:

| Type | Output | Requirements |
| --- | --- | --- |
| ORIGINAL | JPEG | Unchanged bytes and camera metadata. |
| DOWNLOAD | JPEG | Quality 92. |
| GALLERY | WebP | Maximum dimension 2,000px, quality 80. |
| THUMBNAIL | WebP | Maximum dimension 500px, 4:3 center crop, quality 65. |

Derivative processing statuses should cover `QUEUED), `PROCESSING),
`READY), `FAILED), and `RETRYING). Publication belongs to the photo/version
publication state, not derivative generation; a separate delivery eligibility
or published-at field may be used if required. Deleted/soft-deleted state
should be represented through the owning media/version lifecycle rather than
making a successful derivative appear processing-ready.

### ProcessingJob

Propose a `ProcessingJob) entity for durable database visibility of the
photo-version processing workflow:

- BullMQ job ID and a unique idempotency key.
- Media version ID.
- Job status, attempt count, and whether a retry was automatic or manual.
- Failure/error details, started/completed timestamps, and created/updated timestamps.
- Optional last-queued/last-attempt timestamps.

BullMQ remains the queue authority; PostgreSQL must not duplicate every internal
BullMQ field. A unique constraint on the idempotency key (for example, version
plus processing generation) prevents duplicate logical jobs. The job has three
automatic processing attempts per photo. Successful derivatives must not be
regenerated unnecessarily, and failed derivatives may be retried independently
where technically feasible.

## 3. Lifecycle, constraints and deletion proposal

- Gallery ownership must be preserved on every upload, media, version, derivative,
  and job lookup. Cross-gallery IDs must not authorize access.
- Upload-session cleanup is limited to expired unfinished sessions and unaccepted
  upload objects. Accepted photos are never removed by that cleanup.
- Soft deletion moves the stable photo identity to Trash for 30 days and removes
  guest access immediately. Only Master Admin may restore or permanently delete.
- Permanent deletion removes the original, all derivatives/thumbnails, and
  associated processing records. Storage cleanup is retryable and auditable.
- Deletion must be version-aware and protect the current active version from
  replacement-retention cleanup.
- Existing Gallery cascade behavior and AdminSession/AdminAuditEvent delete
  behavior remain current until a reviewed migration changes them.
- Proposed migrations must be additive and forward-only, with explicit indexes,
  uniqueness, foreign-key actions, backfill/one-time Master Admin conversion,
  rollback/recovery planning, and backup verification. No migration is created
  by this documentation step.

## 4. Status boundary and unresolved decisions

**IMPLEMENTED:** Current Prisma models and constraints described in section 1.

**APPROVED / PROPOSED:** Phase 6 role, invitation, upload, version, derivative,
processing-job, Trash, and lifecycle concepts described in section 2.

**SELECTED_NOT_INTEGRATED:** R2 and Redis/BullMQ services remain selected but
not integrated.

**DECISION_REQUIRED:** Final table/field names, enum strategy, upload-session
metadata shape, exact publication versus
delivery-eligibility representation, Trash/version foreign-key behavior,
other retention cleanup scheduling, and Upstash/BullMQ compatibility.

Step 5 uses the existing `UploadFile.multipartUploadId` and `partMetadata`
fields for multipart identity and lifecycle/recovery state. R2 owns part state.
Expired multipart cleanup is a retryable operator command. Scheduling is deferred.

The Phase 6 foundation fields are present in the repository schema. Deployment
of the existing migrations must be verified separately.
