import * as bcrypt from 'bcrypt';
import { createHmac, timingSafeEqual } from 'crypto';

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
