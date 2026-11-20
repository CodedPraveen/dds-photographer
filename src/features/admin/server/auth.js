import "server-only";

import { createHash, randomBytes } from "node:crypto";

import argon2 from "argon2";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "./prisma";
import { decryptTotpSecret } from "./totp-secrets.mjs";

const COOKIE = "dds_admin_session";
const IDLE_MS = 12 * 60 * 60 * 1000;
const ABSOLUTE_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token) {
  return createHash("sha256").update(token).digest("hex");
}

export async function createAdminSession(adminId) {
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await prisma.adminSession.create({
    data: {
      adminId,
      tokenHash: hashToken(token),
      lastSeenAt: now,
      expiresAt: new Date(now.getTime() + ABSOLUTE_MS),
    },
  });
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/admin",
    maxAge: ABSOLUTE_MS / 1000,
  });
}

export async function getCurrentAdmin() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const session = await prisma.adminSession.findUnique({
    where: { tokenHash: hashToken(token) },
    include: { admin: true },
  });
  if (!session || session.revokedAt || session.expiresAt <= new Date())
    return null;
  if (session.lastSeenAt.getTime() + IDLE_MS <= Date.now()) return null;
  await prisma.adminSession.update({
    where: { id: session.id },
    data: { lastSeenAt: new Date() },
  });
  return { ...session.admin, sessionId: session.id };
}

export async function requireAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");
  return admin;
}

export async function revokeCurrentSession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token)
    await prisma.adminSession.updateMany({
      where: { tokenHash: hashToken(token), revokedAt: null },
      data: { revokedAt: new Date() },
    });
  (await cookies()).delete(COOKIE);
}

export async function revokeAllSessions(adminId) {
  await prisma.adminSession.updateMany({
    where: { adminId, revokedAt: null },
    data: { revokedAt: new Date() },
  });
}
export async function verifyPassword(hash, password) {
  return argon2.verify(hash, password);
}
export async function hashPassword(password) {
  return argon2.hash(password, { type: argon2.argon2id });
}
export async function audit(adminId, action, targetId, metadata) {
  await prisma.adminAuditEvent.create({
    data: { adminId, action, targetId, metadata },
  });
}

export function getAdminTotpSecret(admin) {
  if (admin.totpSecretEncrypted)
    return decryptTotpSecret(admin.totpSecretEncrypted);
  throw new Error("Admin TOTP secret requires secure migration.");
}
