import assert from "node:assert/strict";
import test from "node:test";

import { acceptAdminInvitation, assertInvitationAcceptable, changeAdminRoleOrActiveState, createAdminInvitation, normalizeAdminEmail } from "../src/features/admin/server/admin-management.mjs";

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

test("invitation creation normalizes email and sets exactly 24 hours", async () => {
  let created;
  const tx = { adminInvitation: { create: async ({ data }) => (created = data) } };
  await createAdminInvitation(tx, { inviterAdminId: "admin-1", email: " Invitee@Example.COM ", role: "ADMIN", tokenHash: "hash", now: new Date("2026-11-22T00:00:00Z") });
  assert.equal(created.inviteeEmail, "invitee@example.com");
  assert.equal(created.expiresAt.getTime() - created.createdAt.getTime(), 24 * 60 * 60 * 1000);
});

test("concurrent invitation acceptance allows only one update", async () => {
  const invitation = { tokenHash: "hash", status: "PENDING", expiresAt: new Date("2026-11-23T00:00:00Z") };
  const tx = { adminInvitation: {
    updateMany: async ({ data }) => { if (invitation.status !== "PENDING") return { count: 0 }; invitation.status = data.status; invitation.acceptedAdminId = data.acceptedAdminId; return { count: 1 }; },
    findUnique: async () => invitation,
  } };
  const results = await Promise.allSettled([acceptAdminInvitation(tx, { tokenHash: "hash", acceptedAdminId: "a", now: new Date("2026-11-22T00:00:00Z") }), acceptAdminInvitation(tx, { tokenHash: "hash", acceptedAdminId: "b", now: new Date("2026-11-22T00:00:00Z") })]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  assert.equal(results.filter((result) => result.status === "rejected").length, 1);
});

test("role changes use the shared advisory lock and preserve one active master", async () => {
  const admins = [{ id: "a", role: "MASTER_ADMIN", isActive: true }, { id: "b", role: "MASTER_ADMIN", isActive: true }];
  const locks = [];
  const makeTx = () => ({ $queryRaw: async () => locks.push("dds.admin-master-state"), adminUser: { findUnique: async ({ where }) => admins.find((admin) => admin.id === where.id), count: async ({ where }) => admins.filter((admin) => admin.id !== where.id.not && admin.role === where.role && admin.isActive === where.isActive).length, update: async ({ where, data }) => Object.assign(admins.find((admin) => admin.id === where.id), data) } });
  let tail = Promise.resolve();
  const runSerialized = (operation) => { const previous = tail; let release; tail = new Promise((resolve) => { release = resolve; }); return previous.then(async () => { try { return await operation(); } finally { release(); } }); };
  await Promise.all([runSerialized(() => changeAdminRoleOrActiveState(makeTx(), { adminId: "a", isActive: false })), runSerialized(() => changeAdminRoleOrActiveState(makeTx(), { adminId: "b", isActive: false }).catch(() => null))]);
  assert.equal(admins.filter((admin) => admin.role === "MASTER_ADMIN" && admin.isActive).length, 1);
  assert.deepEqual(locks, ["dds.admin-master-state", "dds.admin-master-state"]);
});
