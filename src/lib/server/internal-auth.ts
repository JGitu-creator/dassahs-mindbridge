import crypto from 'crypto';

/**
 * Token used for server-to-server calls (e.g. chat → refund) so that
 * privileged endpoints cannot be invoked directly by browsers.
 * Derived from the service role key; the raw key is never sent.
 */
export function getInternalToken(): string {
  const secret = process.env.SUPABASE_SERVICE_ROLE_KEY ?? '';
  if (!secret) return '';
  return crypto.createHmac('sha256', secret).update('prism-internal-refund').digest('hex');
}

export function isValidInternalToken(token: string | null): boolean {
  const expected = getInternalToken();
  if (!expected || !token || token.length !== expected.length) return false;
  return crypto.timingSafeEqual(Buffer.from(token), Buffer.from(expected));
}
