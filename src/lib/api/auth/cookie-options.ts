'use server';

import jwt from 'jsonwebtoken';
import type { ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';

const DEFAULT_COOKIE_MAX_AGE = 72000;

export function getCookieMaxAgeFromToken(token: string): number {
  const decoded = jwt.decode(token) as { exp?: number } | null;
  if (decoded?.exp) {
    return Math.max(decoded.exp - Math.floor(Date.now() / 1000), 0);
  }
  return DEFAULT_COOKIE_MAX_AGE;
}

export function buildSessionCookieOptions(
  value: string,
  tokenForMaxAge?: string
): Partial<ResponseCookie> {
  return {
    value,
    httpOnly: true,
    maxAge: tokenForMaxAge
      ? getCookieMaxAgeFromToken(tokenForMaxAge)
      : DEFAULT_COOKIE_MAX_AGE,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
  };
}
