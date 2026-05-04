import { randomBytes } from 'crypto';

/**
 * Generate a URL-safe random token suitable for the brief-completion link
 * given to visitors after they submit a consultation request.
 *
 * Uses 32 bytes (256 bits) of entropy, base64url-encoded — long enough that
 * brute-forcing a valid token is computationally infeasible.
 */
export function generateBriefToken(): string {
  return randomBytes(32).toString('base64url');
}
