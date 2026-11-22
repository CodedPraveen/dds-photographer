"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { createGalleryLinkToken } from "@/features/private-gallery/server/gallery-access";

import {
  audit,
  createAdminSession,
  getAdminTotpSecret,
  getCurrentAdmin,
  hashPassword,
  revokeCurrentSession,
  verifyPassword,
} from "./auth";
import { prisma } from "./prisma";
import {
  checkLoginRateLimit,
  clearLoginFailures,
  recordFailedLogin,
} from "./rate-limit.mjs";
import { verifyTotp } from "./totp.mjs";

export async function login(_previous, formData) {
  const email = String(formData.get("email") || "")
    .trim()
    .toLowerCase();
  const password = String(formData.get("password") || "");
  const code = String(formData.get("code") || "");
  const rateKey = email || "unknown";
  if (!(await checkLoginRateLimit(prisma, rateKey)).allowed)
    return { error: "Too many attempts. Please try again later." };
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (
    !admin ||
    !(await verifyPassword(admin.passwordHash, password)) ||
    !verifyTotp(getAdminTotpSecret(admin), code)
  ) {
    await recordFailedLogin(prisma, rateKey);
    return { error: "Invalid sign-in details." };
  }
  await clearLoginFailures(prisma, rateKey);
  await createAdminSession(admin.id);
  await audit(admin.id, "admin.login", null, null);
  redirect("/admin");
}

export async function logout() {
  const admin = await getCurrentAdmin();
  if (admin) await audit(admin.id, "admin.logout", null, null);
  await revokeCurrentSession();
  redirect("/admin/login");
}

export async function changePassword(_previous, formData) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized." };
  const current = String(formData.get("currentPassword") || "");
  const next = String(formData.get("newPassword") || "");
  const confirmation = String(formData.get("confirmPassword") || "");
  if (!(await verifyPassword(admin.passwordHash, current)))
    return { error: "Current password is incorrect." };
  if (next.length < 12)
    return { error: "New password must be at least 12 characters." };
  if (next !== confirmation) return { error: "New passwords do not match." };
  await prisma.$transaction(async (tx) => {
    await tx.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash: await hashPassword(next) },
    });
    await tx.adminSession.updateMany({
      where: { adminId: admin.id, revokedAt: null },
      data: { revokedAt: new Date() },
    });
    await tx.adminAuditEvent.create({
      data: {
        adminId: admin.id,
        action: "admin.password_change",
        targetId: admin.id,
      },
    });
  });
  return { success: "Password changed. Sign in again." };
}

export async function createGallery(formData) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized." };
  const title = String(formData.get("title") || "").trim();
  if (!title || title.length > 160)
    return { error: "Enter a gallery title up to 160 characters." };
  const gallery = await prisma.gallery.create({ data: { title } });
  await audit(admin.id, "gallery.create", gallery.id, null);
  redirect(`/admin/galleries/${gallery.id}`);
}

export async function updateGallery(id, formData) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized." };
  const title = String(formData.get("title") || "").trim();
  if (!title || title.length > 160)
    return { error: "Enter a gallery title up to 160 characters." };
  const gallery = await prisma.gallery.update({
    where: { id },
    data: { title, isActive: formData.get("isActive") === "on" },
  });
  await audit(admin.id, "gallery.update", gallery.id, null);
  redirect(`/admin/galleries/${id}`);
}

export async function revokeGallery(id) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized." };
  const gallery = await prisma.gallery.update({
    where: { id },
    data: { isActive: false, tokenVersion: { increment: 1 } },
  });
  await audit(admin.id, "gallery.revoke", gallery.id, null);
  revalidatePath(`/admin/galleries/${id}`);
  redirect(`/admin/galleries/${id}`);
}

export async function deleteGallery(id) {
  const admin = await getCurrentAdmin();
  if (!admin) return { error: "Unauthorized." };
  await prisma.gallery.delete({ where: { id } });
  await audit(admin.id, "gallery.delete", id, null);
  revalidatePath("/admin/galleries");
  redirect("/admin/galleries");
}
