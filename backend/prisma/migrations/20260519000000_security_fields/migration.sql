-- AlterTable: add security and audit fields to users
ALTER TABLE "users"
  ADD COLUMN "emailVerified"     BOOLEAN      NOT NULL DEFAULT false,
  ADD COLUMN "emailVerifiedAt"   TIMESTAMP(3),
  ADD COLUMN "lastLoginAt"       TIMESTAMP(3),
  ADD COLUMN "loginAttempts"     INTEGER      NOT NULL DEFAULT 0,
  ADD COLUMN "lockedUntil"       TIMESTAMP(3),
  ADD COLUMN "passwordChangedAt" TIMESTAMP(3);

-- CreateIndex: performance indexes for common query patterns
CREATE INDEX "users_role_idx"      ON "users"("role");
CREATE INDEX "users_isActive_idx"  ON "users"("isActive");
CREATE INDEX "users_deletedAt_idx" ON "users"("deletedAt");
