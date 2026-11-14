import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";
import argon2 from "argon2";

import { encryptTotpSecret } from "../src/features/admin/server/totp-secrets.mjs";
import { PrismaClient } from "../src/generated/prisma/client/index.js";

const [email, password, totpSecret] = process.argv.slice(2);
if (!email || !password || !totpSecret)
  throw new Error(
    "Usage: node scripts/provision-admin.mjs EMAIL PASSWORD BASE32_TOTP_SECRET",
  );
if (password.length < 12)
  throw new Error("Password must be at least 12 characters.");
const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  }),
});
const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
const totpSecretEncrypted = encryptTotpSecret(totpSecret);
const admin = await prisma.adminUser.upsert({
  where: { email: email.toLowerCase() },
  update: { passwordHash, totpSecretEncrypted, totpSecret: null },
  create: { email: email.toLowerCase(), passwordHash, totpSecretEncrypted },
});
await prisma.adminSession.updateMany({
  where: { adminId: admin.id, revokedAt: null },
  data: { revokedAt: new Date() },
});
console.log(
  `Provisioned ${admin.email}. Store the TOTP secret securely and remove it from shell history.`,
);
await prisma.$disconnect();
