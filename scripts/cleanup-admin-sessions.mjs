import "dotenv/config";

import { PrismaPg } from "@prisma/adapter-pg";

import { PrismaClient } from "../src/generated/prisma/client/index.js";

const prisma = new PrismaClient({
  adapter: new PrismaPg({
    connectionString: process.env.DIRECT_URL || process.env.DATABASE_URL,
  }),
});
const now = new Date();
const idleCutoff = new Date(now.getTime() - 12 * 60 * 60 * 1000);
try {
  const result = await prisma.adminSession.deleteMany({
    where: {
      OR: [
        { revokedAt: { not: null } },
        { expiresAt: { lte: now } },
        { lastSeenAt: { lte: idleCutoff } },
      ],
    },
  });
  console.log(`Deleted ${result.count} expired or revoked admin sessions.`);
} finally {
  await prisma.$disconnect();
}
