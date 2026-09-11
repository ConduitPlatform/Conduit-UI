import { z } from 'zod';
import { parseDotPath, RESERVED_SOCKET_EVENTS } from '@/lib/event-relays/path';

export const EventRelayFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Name is required')
    .max(64, 'Name must be at most 64 characters')
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9 _.-]{0,63}$/,
      'Name must start with a letter or number'
    ),
  notes: z.string().max(256).optional(),
  active: z.boolean(),
  busEvent: z
    .string()
    .trim()
    .min(1, 'Bus event is required')
    .max(128)
    .regex(
      /^[A-Za-z0-9][A-Za-z0-9_.:-]{0,127}$/,
      'Use an exact channel name with no wildcards'
    )
    .refine(value => !value.includes('*'), 'Wildcards are not supported'),
  socketEvent: z
    .string()
    .trim()
    .min(1, 'Socket event is required')
    .max(64)
    .regex(/^[A-Za-z][A-Za-z0-9_:-]{0,63}$/, 'Socket event name is invalid')
    .refine(
      value => !RESERVED_SOCKET_EVENTS.has(value),
      'This socket event name is reserved'
    ),
  resourceType: z
    .string()
    .trim()
    .min(1, 'Resource type is required')
    .regex(/^[A-Za-z][A-Za-z0-9_]{0,63}$/, 'Resource type is invalid'),
  resourceIdPath: z
    .string()
    .trim()
    .min(1, 'Resource ID path is required')
    .superRefine((value, ctx) => {
      try {
        parseDotPath(value);
      } catch (err) {
        ctx.addIssue({
          code: 'custom',
          message: err instanceof Error ? err.message : 'Invalid path',
        });
      }
    }),
  permission: z
    .string()
    .trim()
    .min(1, 'Permission is required')
    .regex(/^[A-Za-z][A-Za-z0-9_]{0,63}$/, 'Permission is invalid'),
  messageTemplate: z.string().trim().min(1, 'Message template is required'),
  samplePayload: z.string().optional(),
});

export type EventRelayFormValues = z.infer<typeof EventRelayFormSchema>;

export function parseJsonField(value: string, label: string): unknown {
  try {
    return JSON.parse(value);
  } catch {
    throw new Error(`${label} must be valid JSON`);
  }
}
