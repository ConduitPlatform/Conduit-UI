import { z } from 'zod';

export const DatabaseSettingsSchema = z.object({
  readPreference: z.enum([
    'primary',
    'primaryPreferred',
    'secondary',
    'secondaryPreferred',
    'nearest',
  ]),
  writeConcern: z.enum(['1', 'majority']),
  readConcern: z.enum([
    'local',
    'available',
    'majority',
    'linearizable',
    'snapshot',
  ]),
});
