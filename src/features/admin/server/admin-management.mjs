import "server-only";

export function normalizeAdminEmail(email) {
  if (typeof email !== "string") throw new Error("Admin email is required.");
  const normalized = email.trim().toLowerCase();
  if (!normalized || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized)) {
    throw new Error("Admin email is invalid.");
  }
  return normalized;
}

export function assertInvitationAcceptable(invitation, now = new Date()) {
  if (!invitation || invitation.status !== "PENDING") {
    throw new Error("Invitation is no longer available.");
  }
  if (new Date(invitation.expiresAt) <= now) {
    throw new Error("Invitation has expired.");
  }
}

export async function createAdminInvitation(tx, { inviterAdminId, email, role, tokenHash, now = new Date() }) {
  const createdAt = new Date(now);
  return tx.adminInvitation.create({
    data: {
      inviterAdminId,
      inviteeEmail: normalizeAdminEmail(email),
      role,
      tokenHash,
      status: "PENDING",
      createdAt,
      expiresAt: new Date(createdAt.getTime() + 24 * 60 * 60 * 1000),
    },
  });
}

export async function acceptAdminInvitation(tx, { tokenHash, acceptedAdminId, now = new Date() }) {
  const result = await tx.adminInvitation.updateMany({
    where: { tokenHash, status: "PENDING", expiresAt: { gt: now } },
    data: { status: "ACCEPTED", acceptedAdminId, acceptedAt: now },
  });
  if (result.count !== 1) throw new Error("Invitation is unavailable, expired, or already used.");
  return tx.adminInvitation.findUnique({ where: { tokenHash } });
}

export async function changeAdminRoleOrActiveState(tx, { adminId, role, isActive }) {
  await tx.$queryRaw`SELECT pg_advisory_xact_lock(hashtext('dds.admin-master-state'))`;
  const current = await tx.adminUser.findUnique({ where: { id: adminId } });
  if (!current) throw new Error("Admin account not found.");

  const becomesLastActiveMaster =
    current.role === "MASTER_ADMIN" &&
    current.isActive &&
    ((role !== undefined && role !== "MASTER_ADMIN") || isActive === false);

  if (becomesLastActiveMaster) {
    const otherActiveMasters = await tx.adminUser.count({
      where: { role: "MASTER_ADMIN", isActive: true, id: { not: adminId } },
    });
    if (otherActiveMasters === 0) throw new Error("The last active Master Admin cannot be deactivated or demoted.");
  }

  return tx.adminUser.update({
    where: { id: adminId },
    data: { ...(role === undefined ? {} : { role }), ...(isActive === undefined ? {} : { isActive }) },
  });
}
