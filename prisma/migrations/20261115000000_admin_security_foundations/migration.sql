ALTER TABLE "AdminUser" ALTER COLUMN "totpSecret" DROP NOT NULL;

ALTER TABLE "AdminUser" ADD COLUMN "totpSecretEncrypted" TEXT;

CREATE TABLE "AdminLoginRateLimit" (
    "keyHash" TEXT NOT NULL,
    "windowStartedAt" TIMESTAMP(3) NOT NULL,
    "failures" INTEGER NOT NULL DEFAULT 0,
    "cooldownUntil" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "AdminLoginRateLimit_pkey" PRIMARY KEY ("keyHash")
);
