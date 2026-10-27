# Admin Platform — Product Specification

**Status:** Planned; not implemented  
**Last reconciled:** 2026-10-27

## 1. Purpose

The admin platform is the photographer's private workspace for managing wedding/event galleries and their photos. It is a future capability; no admin authentication, dashboard, or gallery-management UI is currently implemented.

This is an internal tool for one photographer/business, not a multi-tenant SaaS control plane.

## 2. Primary actor

**Photographer / administrator**
- Needs to create and manage event galleries.
- Needs to upload, order, publish, and remove photos.
- Needs to configure guest access, shared password, availability, and QR delivery.
- Needs to close, reopen, extend, or revoke a gallery according to the approved lifecycle policy.

No separate editor, staff role, client account, or multi-studio role hierarchy is approved by the current product decisions.

## 3. Planned navigation areas

The precise information architecture is not yet approved. The following are product capability groups, not confirmed screen names:
- Dashboard / gallery overview.
- Gallery list and gallery details.
- Create/edit gallery.
- Photo upload and media ordering.
- Guest access settings.
- QR/link sharing.
- Gallery lifecycle controls.

Do not build unapproved screens or role structures based solely on this outline.

## 4. Core workflows

### 4.1 Admin access
1. Photographer opens the admin area.
2. System authenticates the photographer.
3. System authorizes access to admin actions.
4. Session expires or can be explicitly ended.

Admin authentication method, MFA, recovery, session duration, and account provisioning are open decisions. Admin access must be implemented before exposing management operations.

### 4.2 Create a gallery
1. Photographer starts a new wedding/event gallery.
2. Enters a title and any approved display metadata.
3. Configures availability dates if required.
4. Sets the shared password for that wedding.
5. Saves the gallery in a non-public/draft state until ready.
6. Adds photos and reviews the gallery.
7. Publishes/activates it and generates the private link/QR.

Draft/publish states and exact metadata fields require confirmation. Current `Gallery` model has title, isActive, tokenVersion, opensAt, and closesAt; do not imply it already supports all future workflow states.

### 4.3 Manage photos
1. Photographer selects a gallery.
2. Adds photos through the future upload workflow.
3. Reviews validation/processing results.
4. Sets cover photo and ordering.
5. Publishes only successfully processed media.
6. Removes or replaces media when needed.

Upload and processing implementation is not present. See `MEDIA_PIPELINE.md`.

### 4.4 Manage guest access
- Set/change the one shared password for the wedding.
- Rotate or revoke a compromised password.
- View/copy the gallery link.
- Generate and download/print a QR code.
- Extend gallery availability according to approved policy.
- Close, reopen, deactivate, or revoke access.

The exact relationship between closing a gallery, invalidating links, and invalidating visitor cookies must be defined. Existing `tokenVersion` supports gallery-link revocation; do not assume it alone revokes every already-issued visitor cookie unless verified and designed.

### 4.5 Review gallery status
The admin should be able to distinguish at minimum:
- Draft/not published (if approved).
- Active and available.
- Scheduled/not yet open.
- Expired/closed.
- Deactivated/revoked.
- Upload/processing incomplete or failed.

The final status model is open and must align with the data model and lifecycle policy.

## 5. Product requirements

- Only the authorized photographer/admin can access admin routes and mutations.
- Guest routes never expose admin controls.
- Every mutation is validated server-side.
- Destructive actions require clear confirmation and report their effect.
- Passwords are never displayed after saving.
- Link/QR sharing must not expose storage credentials or private object keys.
- Admin actions affecting access should provide clear feedback.
- Gallery/media ownership remains scoped to the selected gallery.
- Admin activity affecting passwords, publication, expiry, and revocation should be auditable.

## 6. Not specified / open decisions

- Authentication provider or password-based login.
- MFA requirement and account recovery.
- Session lifetime and device/session revocation.
- Admin roles (single-owner assumption only).
- Dashboard metrics and analytics.
- Draft/publish model and whether galleries can be scheduled.
- Gallery metadata beyond current title/availability.
- Guest/visitor list visibility and export permissions.
- Audit log detail and retention.
- Bulk upload limits and batch operations.
- Exact close/reopen/revoke behavior.

## 7. Explicit exclusions

- Multi-tenant studio management.
- Staff/editor/client role hierarchy unless separately approved.
- Billing, subscriptions, payments, or SaaS provisioning.
- Video management while video remains on hold.
- Face-search administration until privacy and production approval are complete.

## 8. Acceptance boundary

This document defines the intended product behavior, not the engineering design. Authentication provider, session storage, R2 upload authorization, worker concurrency, database indexes, deployment topology, and backup implementation belong in Priority 4 engineering specifications.
