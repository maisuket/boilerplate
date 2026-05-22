import * as bcrypt from 'bcrypt';
import { createHmac, createHash, randomBytes, timingSafeEqual } from 'crypto';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePasswords(plaintext: string, hashed: string): Promise<boolean> {
  return bcrypt.compare(plaintext, hashed);
}

/**
 * HMAC-SHA256 for refresh tokens.
 * Fast (sync) and safe for already-random strings.
 * Requires server-side secret so DB leaks alone cannot be exploited.
 */
export function hashToken(token: string, secret: string): string {
  return createHmac('sha256', secret).update(token).digest('hex');
}

export function compareTokens(plaintext: string, hashed: string, secret: string): boolean {
  const computed = hashToken(plaintext, secret);
  const hashedBuf = Buffer.from(hashed, 'hex');
  const computedBuf = Buffer.from(computed, 'hex');
  if (hashedBuf.length !== computedBuf.length) return false;
  return timingSafeEqual(hashedBuf, computedBuf);
}

/** Generates a 32-byte cryptographically secure random token (64 hex chars). */
export function generateSecureToken(): string {
  return randomBytes(32).toString('hex');
}

/** SHA-256 hash for high-entropy verification/reset tokens (no secret needed). */
export function hashVerificationToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
