# Security and Privacy Requirements

> Updated 2026-10-26. This document records current controls and required
> future controls. It is an engineering specification, not legal advice.
> Confirm legal applicability and commencement with qualified Indian counsel.

## 1. Current implemented controls

- Signed gallery-link token with a random nonce, 30-day expiry, gallery ID,
  and token version.
- Gallery token-version check supports revoking previously issued links.
- Signed visitor access token with 12-hour expiry.
- Visitor cookie is HTTP-only, SameSite=Lax, scoped to `/gallery`, and Secure
  in production.
- Visitor input is trimmed and validated server-side; email is normalized.
- Visitor upsert is unique per `(galleryId, email)`.
- Media IDs are resolved only inside the validated gallery.
- Non-cover media requires a valid gallery-scoped visitor grant.
- Private media responses use no-store and no-index headers.
- Development preview route is unavailable in production or when
  `DATABASE_URL` is configured.

The current `GalleryVisitor.consent` and `consentedAt` fields document the
existing gallery-entry consent. They are not face-search consent.

## 2. Selected guest-password requirement — not implemented

The owner selected one shared password per wedding gallery.

Requirements for implementation:
- Store only a modern password hash; never store or return plaintext.
- Compare passwords server-side using a suitable password-hashing library.
- Rate-limit attempts and add temporary abuse controls.
- Support admin rotation and immediate revocation.
- Avoid logging passwords or including them in URLs, analytics, or error data.
- Keep password verification separate from gallery-link validation and
  visitor access authorization.
- A shared password is a gallery gate, not proof of a unique guest identity.

## 3. Face-search consent — mandatory product requirement before processing

Face matching is limited to SFace evaluation. No face-search feature is
currently implemented or approved for production.

Before collecting a selfie/face image or creating, storing, comparing, or
otherwise processing a face embedding or match result:
- Present a clear, standalone notice in plain language.
- Itemize the personal data to be collected or used.
- State the specific face-search purpose and how the processing enables it.
- Explain retention, deletion, sharing/processor involvement, and how to
  withdraw consent, as applicable to the final design.
- Obtain a separate, affirmative, optional choice.
- Use an unchecked-by-default control; no preselected checkbox.
- Do not bury the notice in general terms or rely on a hidden terms link.
- Do not bundle face-search permission with gallery entry, the wedding
  password, or unrelated purposes.
- Do not deny ordinary gallery access when a guest declines face search.
- Record the notice version/text, purpose, data categories, affirmative action,
  timestamp, gallery/visitor scope, and later withdrawal.
- Provide a withdrawal path and delete or de-identify face-search data in
  accordance with the approved retention policy.

A guest's general gallery-entry consent must never be interpreted as permission
for face search. Consent must be specific to the face-search purpose.

## 4. India DPDP Act — commencement and design note

Section 6(1) of the Digital Personal Data Protection Act, 2023 describes
consent as free, specific, informed, unconditional, and unambiguous, with a
clear affirmative action. A pre-ticked checkbox does not evidence a fresh
affirmative choice. A hidden or bundled terms link is not a substitute for a
clear notice that enables an informed choice.

**Commencement caveat as at 2026-10-26:** The Central Government's
commencement notification, G.S.R. 843(E), dated 13 November 2025, schedules
Section 6(1)–(8) and Section 6(10) to commence 18 months after publication
(13 May 2027, calculated from the notification date). Section 6(9) has a
separate one-year commencement. The DPDP Rules, 2025 similarly phase in
Rule 3 (the standalone notice requirements) 18 months after publication.
Therefore, do not state in project documentation that all Section 6 and
Rule 3 requirements are already in force on 26 October 2026.

The product should nevertheless implement the face-search consent flow to
this standard from the outset, rather than waiting for the commencement date.
Re-check the latest Gazette notifications, corrigenda, rules, and legal advice
before launch and before making a legal-compliance claim.

Official sources:
- DPDP Act, 2023, Section 6:
  https://www.indiacode.nic.in/handle/123456789/20062
- Gazette of India, G.S.R. 843(E), 13 November 2025 (commencement notification):
  https://www.meity.gov.in/static/uploads/2025/11/c56ceae6c383460ca69577428d36828b.pdf
- DPDP Rules, 2025, G.S.R. 846(E):
  https://www.meity.gov.in/static/uploads/2025/11/53450e6e5dc0bfa85ebd78686cadad39.pdf

## 5. Face-search data lifecycle

Before production approval, specify:
- Whether selfies are processed transiently or retained.
- Whether face crops and embeddings are stored; if so, encryption and
  gallery-level isolation.
- Who can initiate a search and which gallery it can search.
- Match thresholds, false-positive handling, and a clear warning that matches
  may be inaccurate.
- Model provenance, license, accuracy evaluation, and bias testing for SFace.
- Retention periods for source images, embeddings, match results, and logs.
- Withdrawal, deletion, backup-expiry, and incident-response behavior.

Never use face data from one wedding to search another wedding without a
separately approved purpose and consent model.

## 6. Future media and platform controls

Before R2/worker/admin implementation, define:
- Private buckets and server-only credentials.
- Short-lived, scoped upload authorization and completion verification.
- File type/content validation, size limits, malware considerations, and
  safe image decoding.
- Gallery-scoped authorization on every media read.
- Redis/BullMQ job authentication, idempotency, retries, and worker isolation.
- Admin authentication, authorization, session protection, and audit logs.
- Rate limits for login, password checks, uploads, and search.
- Backup encryption, restoration tests, deletion propagation, and incident
  response.

## 7. Security review checklist

- [ ] No secrets or private object keys reach client bundles.
- [ ] No plaintext passwords are stored or logged.
- [ ] Gallery token expiry and revocation are tested.
- [ ] Gallery and media IDs cannot be mixed across galleries.
- [ ] Visitor access is scoped to the correct gallery.
- [ ] Face-search consent is separate, optional, affirmative, and auditable.
- [ ] Declining face search does not block ordinary gallery access.
- [ ] Withdrawal and deletion are tested before face search ships.
- [ ] Current legal commencement status is rechecked before launch.
