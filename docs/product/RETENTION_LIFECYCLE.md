# Gallery Retention and Lifecycle — Product Specification

**Status:** Partially implemented foundation; policy decisions pending  
**Last reconciled:** 2026-10-27

## 1. Purpose

Define how a wedding/event gallery moves from creation to availability, closure, extension, revocation, and eventual deletion. This document separates access expiry from data retention so that closing a gallery does not accidentally imply that its data has been deleted.

## 2. Distinct time concepts

These concepts must remain separate:

| Concept | Current/selected state | Meaning |
| --- | --- | --- |
| Gallery availability | `opensAt` / `closesAt` fields exist | Whether the gallery is currently available |
| Gallery-link token expiry | Implemented: 30 days | Lifetime of a signed link token |
| Visitor access cookie | Implemented: 12 hours | Lifetime of a visitor's gallery-scoped grant |
| Gallery retention | Not defined | How long photos and related records remain stored |
| Permanent deletion | Not defined | When data is removed from primary storage, derivatives, and backups |

Extending gallery availability must not silently extend existing link tokens or visitor cookies unless an explicit policy says so. A new link or fresh visitor authorization may be required.

## 3. Current lifecycle controls

The current `Gallery` model includes:
- `isActive`
- `tokenVersion`
- `opensAt`
- `closesAt`

The current token validator rejects inactive galleries and galleries outside their configured availability window. Token-version mismatch supports revocation of previously issued gallery-link tokens.

No admin interface currently exists to manage these fields. Extendable expiry is selected as a product direction, but the operational policy is not yet defined.

## 4. Intended lifecycle states

The following are conceptual states for product discussion, not a claim that the database currently has a lifecycle enum:

1. **Created / draft** — gallery record exists but is not shared.
2. **Scheduled** — configured to open in the future, if scheduling is approved.
3. **Active** — available to authorized guests.
4. **Extended** — availability end has been moved later under the approved policy.
5. **Closed / expired** — guests can no longer enter or view content.
6. **Revoked / deactivated** — access is intentionally invalidated, potentially before the scheduled end.
7. **Pending deletion** — retained only during an approved grace period, if any.
8. **Deleted** — primary data and derivatives removed; backup expiry handled according to policy.

Final states, transitions, and labels require owner approval.

## 5. Intended lifecycle workflow

### Create and publish
- Photographer creates the gallery in the future admin platform.
- Gallery remains unavailable until intentionally activated/published.
- Availability dates and shared password are configured.
- Photos are uploaded, processed, reviewed, and published.
- Link/QR is generated and shared.

### Extend
- Photographer chooses a new end date within the approved maximum.
- System confirms the new availability.
- System determines whether existing links remain valid or must be reissued.
- Visitor cookies remain governed by their own expiry unless policy explicitly changes it.

### Close
- Gallery becomes unavailable to guests at the configured end or through admin action.
- New page and media requests are denied.
- Existing links must not bypass the closed state.
- The system communicates a safe unavailable/expired state.

### Reopen
- Only an authorized admin may reopen a gallery.
- Reopening must follow the approved policy for links, passwords, and visitor grants.
- The system must not accidentally reactivate a revoked credential.

### Revoke
- Photographer can invalidate a compromised/shared link or access credential.
- Existing signed gallery-link tokens must fail after token-version revocation.
- Whether visitor cookies are also invalidated immediately must be explicitly designed and tested.

### Delete
- Deletion must account for originals, derivatives, metadata, guest records, consent evidence, job state, caches, and backups.
- The UI must explain what will be deleted and whether a recovery/grace period applies.
- Deletion completion must be verifiable.

## 6. Retention categories

The final retention policy must specify a duration and deletion trigger for each category:

| Data category | Current existence | Policy |
| --- | --- | --- |
| Original photos | Future R2 pipeline | Open |
| Display derivatives/thumbnails | Future pipeline | Open |
| Gallery metadata | Current `Gallery` model | Open |
| Guest name/mobile/email | Current `GalleryVisitor` model | Open |
| Gallery-entry consent evidence | Current visitor fields | Open |
| Face-search consent evidence | Not implemented | Separate policy required before face search |
| Selfies/crops/embeddings/match results | Not implemented | No collection until approved |
| Upload/processing records | Future | Open |
| Security/admin audit events | Future | Open |
| Backups | Production policy not established here | Open |

Do not invent retention durations or imply that closing a gallery automatically deletes these records.

## 7. Required product behavior

- Clearly distinguish unavailable, expired, revoked, and deleted states where safe to do so.
- Never expose private media after access is closed or revoked.
- Do not delete data merely because a link token expires.
- Do not keep data indefinitely without an approved policy.
- Ensure deletion includes derivatives and relevant replicas/caches.
- Define backup expiry and restoration behavior so deleted data is not silently reintroduced.
- Keep consent records purpose-specific; gallery-entry consent and face-search consent remain separate.

## 8. Open policy decisions

- Default gallery availability period.
- Maximum gallery lifetime.
- Who can extend and how often.
- Whether extensions require a reason or audit event.
- Whether reopening is allowed after manual closure or revocation.
- Whether revocation invalidates visitor cookies immediately.
- Grace period before permanent deletion.
- Retention for gallery metadata and guest personal data.
- Retention for gallery-entry consent evidence.
- Retention and deletion for originals/derivatives.
- Backup retention and deletion propagation.
- Legal hold or exception handling.
- Guest notification before expiry/deletion.

These decisions require owner approval and, where appropriate, legal advice. Until approved, preserve the fields and behavior already implemented; do not add guessed defaults.
