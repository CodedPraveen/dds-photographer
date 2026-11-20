import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import {
  decryptTotpSecret,
  encryptTotpSecret,
} from "../src/features/admin/server/totp-secrets.mjs";
import { PrismaClient } from "../src/generated/prisma/client/index.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  }),
});
try {
  const admins = await prisma.adminUser.findMany({
    where: { totpSecret: { not: null } },
  });
  for (const admin of admins) {
    const encrypted = encryptTotpSecret(admin.totpSecret);
    if (decryptTotpSecret(encrypted) !== admin.totpSecret)
      throw new Error(`TOTP migration verification failed for ${admin.id}.`);
    await prisma.adminUser.update({
      where: { id: admin.id },
      data: { totpSecretEncrypted: encrypted },
    });
  }
  console.log(
    `Migrated ${admins.length} admin TOTP secret(s). Verify backups before removing totpSecret.`,
  );
} finally {
  await prisma.$disconnect();
}
