"use server";

import { redirect } from "next/navigation";

import {
  audit,
  createAdminSession,
  getCurrentAdmin,
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
  if (!checkLoginRateLimit(rateKey).allowed)
    return { error: "Too many attempts. Please try again later." };
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (
    !admin ||
    !(await verifyPassword(admin.passwordHash, password)) ||
    !verifyTotp(admin.totpSecret, code)
  ) {
    recordFailedLogin(rateKey);
    return { error: "Invalid sign-in details." };
  }
  clearLoginFailures(rateKey);
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

export async function createGallery(_previous, formData) {
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
