import { z } from 'zod';

export const logsFormSchema = z.object({});

export type logsFormSchemaT = z.infer<typeof logsFormSchema>;
