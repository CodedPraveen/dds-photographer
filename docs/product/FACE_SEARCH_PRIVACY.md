# Face Search — Product and Privacy Specification

**Status:** Evaluation only; not production-approved  
**Last reconciled:** 2026-10-27

## 1. Purpose and boundary

Face search is a possible future way for an event guest to locate photographs in a specific wedding/event gallery that may contain them.

SFace is being evaluated only. There is no production face-search feature, no approved production model, and no permission to begin collecting or processing face-search data.

Ordinary gallery access must work without face search.

## 2. Non-negotiable product principles

1. Face search is optional.
2. Consent is separate from gallery-entry consent.
3. The opt-in control is unchecked by default.
4. A clear notice appears before any selfie, face crop, embedding, or match processing.
5. Declining face search does not reduce gallery access or photo visibility.
6. Consent can be withdrawn.
7. Withdrawal and deletion behavior must be designed and tested before launch.
8. SFace evaluation is not production approval.

## 3. Distinguish current consent from future consent

Current `GalleryVisitor.consent` and `consentedAt` represent gallery-entry consent only. They must never be reused or interpreted as permission for:
- Selfie/image capture for face search.
- Face crop extraction.
- Face embedding generation or storage.
- Comparing a guest's face to gallery photographs.
- Returning or storing match results.

A separate, purpose-specific consent record and lifecycle are required.

## 4. Intended optional guest journey — not implemented

1. Guest enters the gallery through the ordinary access flow.
2. If face search is offered, the guest sees a standalone notice explaining the feature and relevant data processing.
3. Guest can choose to opt in or continue without face search.
4. The opt-in control is unchecked by default and requires an affirmative action.
5. If the guest declines, the gallery remains fully usable.
6. If the guest opts in, only then may the approved face-search flow collect/process the specified input.
7. Results are clearly described as possible matches, not guaranteed identification.
8. Guest can withdraw permission through a clear route.
9. Withdrawal triggers the approved stop-processing and deletion workflow.

The exact screen, copy, supported input, and result experience are not approved.

## 5. Notice requirements

Before asking for consent, explain in plain language:
- What image or face-related data will be collected or used.
- The specific purpose of matching within the selected event gallery.
- Whether the source selfie is transient or retained.
- Whether face crops, embeddings, and results are created or stored.
- Who processes the data and relevant service providers.
- How long each data category is retained.
- How to withdraw consent and request deletion.
- Any known limitations, including possible false matches.

The notice must be visible at the point of choice. A general privacy-policy link alone is insufficient for the intended experience.

## 6. Consent evidence

The future system should retain evidence sufficient to establish:
- Gallery and visitor scope.
- Specific purpose and categories of data.
- Exact notice text or immutable notice version.
- Clear affirmative action and timestamp.
- Consent state.
- Withdrawal timestamp and outcome.
- Deletion status for source and derived data.

The consent model must be separate from the existing gallery-entry fields. A conceptual `GalleryFaceSearchConsent` name appears in architecture notes but is not a current Prisma model.

## 7. Model evaluation requirements

Before selecting a production model, evaluate:
- SFace provenance, license, and permitted commercial use.
- Accuracy on the intended image types and event conditions.
- False-positive and false-negative behavior.
- Performance across varied lighting, pose, age, and demographic groups.
- Threshold selection and uncertainty communication.
- Security and isolation of embeddings and match data.
- Operational cost and failure behavior.

No threshold, accuracy claim, or production suitability has been established. Do not promise identification accuracy.

## 8. Data lifecycle requirements

A production proposal must define lifecycle behavior for:
- Guest-provided selfie/source image.
- Face crops.
- Face embeddings.
- Match candidates and results.
- Consent evidence.
- Security/audit logs.
- Backups and derived copies.

For each category, specify whether it is created, where it is stored, who can access it, encryption/isolation, retention period, deletion triggers, backup expiry, and withdrawal handling.

Do not retain biometric/face-derived data indefinitely by default. Do not use face data across galleries or events without a separately approved purpose and consent model.

## 9. Withdrawal and deletion

The product must provide a clear withdrawal path. On withdrawal:
- Stop future face-search processing for that consent scope.
- Prevent new searches using the withdrawn consent.
- Delete or de-identify the source and derived face-search data according to the approved policy.
- Track deletion completion, including derivatives and backups as defined.
- Preserve only the minimum consent/audit evidence that is approved to retain.
- Do not revoke ordinary gallery access merely because face-search consent is withdrawn.

Exact deletion timing and legal retention exceptions are open and require owner/legal approval.

## 10. User-facing safety and quality

- Present results as possible matches, not identity verification.
- Provide a clear way to report an incorrect match.
- Do not expose another guest's private information through results.
- Do not allow search to cross gallery boundaries.
- Provide a non-face-search route to browse the gallery.
- Do not imply that every photograph of a person will be found.

## 11. Launch gate

Face search must remain disabled until all are approved:
- [ ] Product owner explicitly approves production launch.
- [ ] Model provenance/license and evaluation reviewed.
- [ ] Notice and separate optional opt-in approved.
- [ ] Consent evidence model implemented.
- [ ] Withdrawal flow implemented and tested.
- [ ] Source/derived-data retention and deletion implemented and tested.
- [ ] Gallery isolation and authorization reviewed.
- [ ] False-match handling and user messaging approved.
- [ ] Security/privacy/legal review completed.

## 12. Legal note

This is a product privacy specification, not legal advice or a claim of compliance. Confirm applicable Indian data-protection requirements, commencement dates, notices, and retention obligations with qualified counsel before launch. Re-check current official notifications rather than relying on an old summary.
