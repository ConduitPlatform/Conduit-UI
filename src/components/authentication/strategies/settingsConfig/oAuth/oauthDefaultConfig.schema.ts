import { z } from 'zod';

/**
 * Pure (no 'use client') so server modules, such as the realm helpers, can compose it.
 * Re-exported from `oauthDefaultConfig.tsx` for the existing form components.
 */
export const oauthDefaultConfig = z.object({
  enabled: z.boolean().default(false),
  clientId: z.string().default(''),
  clientSecret: z.string().default(''),
  redirect_uri: z.string().default(''),
  accountLinking: z.boolean().default(true),
});
