import assert from "node:assert/strict";
import test from "node:test";

import { assertInvitationAcceptable, normalizeAdminEmail } from "../src/features/admin/server/admin-management.mjs";

test("admin email normalization is consistent", () => {
  assert.equal(normalizeAdminEmail("  ADMIN@Example.COM "), "admin@example.com");
  assert.throws(() => normalizeAdminEmail("invalid"), /invalid/);
});

test("only pending, unexpired invitations are acceptable", () => {
  const now = new Date("2026-11-22T00:00:00Z");
  assert.doesNotThrow(() => assertInvitationAcceptable({ status: "PENDING", expiresAt: "2026-11-23T00:00:00Z" }, now));
  assert.throws(() => assertInvitationAcceptable({ status: "ACCEPTED", expiresAt: "2026-11-23T00:00:00Z" }, now), /no longer/);
  assert.throws(() => assertInvitationAcceptable({ status: "PENDING", expiresAt: "2026-11-21T00:00:00Z" }, now), /expired/);
});
