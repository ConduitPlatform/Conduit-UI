import { z } from 'zod';

/** Matches fields used by LogsFilterForm (levels/modules may be string or string[] from multi-select). */
export const logsFormSchema = z.object({
  limit: z.number(),
  level: z.union([z.string(), z.array(z.string())]).optional(),
  module: z.union([z.string(), z.array(z.string())]).optional(),
  startDate: z.date(),
  endDate: z.date(),
  timeRange: z.string().optional(),
});

export type logsFormSchemaT = z.infer<typeof logsFormSchema>;
