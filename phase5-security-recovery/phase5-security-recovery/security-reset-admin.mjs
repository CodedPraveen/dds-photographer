import "dotenv/config";

import { createHash } from "node:crypto";
import { createInterface } from "node:readline";
import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

import { encryptTotpSecret } from "../src/features/admin/server/totp-secrets.mjs";
import { PrismaClient } from "../src/generated/prisma/index.js";

function prompt(label, { secret = false } = {}) {
  if (!process.stdin.isTTY || (secret && !process.stdin.setRawMode)) {
    throw new Error("Run this recovery command in an interactive server terminal.");
  }

  if (!secret) {
    const rl = createInterface({ input: process.stdin, output: process.stdout });
    return new Promise((resolve) => rl.question(label, (answer) => {
      rl.close();
      resolve(answer);
    }));
  }

  return new Promise((resolve, reject) => {
    let value = "";
    process.stdout.write(label);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    const cleanup = () => {
      process.stdin.off("data", onData);
      process.stdin.setRawMode(false);
      process.stdout.write("\n");
    };
    const onData = (buffer) => {
      for (const char of buffer.toString("utf8")) {
        if (char === "\u0003") {
          cleanup();
          reject(new Error("Recovery cancelled."));
          return;
        }
        if (char === "\r" || char === "\n") {
          cleanup();
          resolve(value);
          return;
        }
        if (char === "\u007f" || char === "\b") value = value.slice(0, -1);
        else if (char >= " ") value += char;
      }
    };
    process.stdin.on("data", onData);
  });
}

const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error("Set DIRECT_URL or DATABASE_URL for the server-side recovery command.");
}

const email = (await prompt("Existing admin email: ")).trim().toLowerCase();
const password = await prompt("New password (hidden): ", { secret: true });
const confirmation = await prompt("Confirm new password (hidden): ", { secret: true });
const totpSecret = (await prompt("New authenticator secret, Base32 (hidden): ", { secret: true }))
  .replace(/\s/g, "")
  .toUpperCase();
const approval = await prompt('Type RESET to revoke all sessions and replace credentials: ');

if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
  throw new Error("Enter a valid admin email.");
}
if (password.length < 12) throw new Error("New password must be at least 12 characters.");
if (password !== confirmation) throw new Error("Password confirmation does not match.");
if (!/^[A-Z2-7]{16,}$/.test(totpSecret)) {
  throw new Error("Authenticator secret must be a valid Base32 string.");
}
if (approval !== "RESET") throw new Error("Recovery cancelled; credentials were not changed.");

const prisma = new PrismaClient({ adapter: new PrismaPg({ connectionString }) });
try {
  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) throw new Error("No existing admin account matches that email. No account was created.");

  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  const totpSecretEncrypted = encryptTotpSecret(totpSecret);
  const revokedAt = new Date();

  const result = await prisma.$transaction(async (tx) => {
    await tx.adminUser.update({
      where: { id: admin.id },
      data: { passwordHash, totpSecretEncrypted, totpSecret: null },
    });
    const sessions = await tx.adminSession.updateMany({
      where: { adminId: admin.id, revokedAt: null },
      data: { revokedAt },
    });
    await tx.adminAuditEvent.create({
      data: {
        adminId: null,
        action: "admin.security_reset",
        targetId: admin.id,
        metadata: { source: "server_cli", actor: "server_operator", sessionsRevoked: sessions.count },
      },
    });
    return sessions.count;
  });

  await prisma.$executeRaw`
    DELETE FROM "AdminLoginRateLimit"
    WHERE "keyHash" = ${createHash("sha256").update(email).digest("hex")}
  `;

  console.log(`Security reset completed for ${admin.email}. Revoked ${result} active session(s).`);
  console.log("Configure the new authenticator in your password manager and sign in again.");
} finally {
  await prisma.$disconnect();
}
