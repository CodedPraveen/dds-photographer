# Photo storage and processing

## Current behavior — IMPLEMENTED

The repository has gallery media records and a local development adapter. The
non-development media route returns 503 for storage keys because production object
storage delivery is not integrated.

## Target direction — SELECTED_NOT_INTEGRATED / PLANNED

Cloudflare R2 is selected for private photos. Redis + BullMQ is selected for photo
processing only. The target requires gallery-scoped authorization, server-only
credentials, short-lived upload authorization, content/type/size validation,
metadata extraction, derivatives, idempotency, retries, failure recovery, and
object lifecycle rules. These are specifications, not implemented services.

See [upload/storage flow](../diagrams/06-photo-upload-storage-flow.mmd).

`DECISION_REQUIRED`: bucket/object layout, derivative formats, upload completion
contract, retention, malware handling, worker topology, retry limits, and deletion.
