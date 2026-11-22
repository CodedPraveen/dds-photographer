import "dotenv/config";

import { cleanupExpiredMultipart } from "../src/features/admin/server/multipart-upload.js";
import { prisma } from "../src/features/admin/server/prisma.js";
import { getMultipartStorage } from "../src/lib/storage/index.js";

try {
  const result = await cleanupExpiredMultipart(
    prisma,
    await getMultipartStorage(),
  );
  console.log(result);
  if (result.failed) process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
