import { zodResolver } from '@hookform/resolvers/zod';
import type { FieldValues, Resolver } from 'react-hook-form';
import type { output, ZodType } from 'zod';

/**
 * Bridges Zod 4 input/output inference with react-hook-form's Resolver typing.
 * Use instead of raw `zodResolver(schema)` when `useForm` is typed with `z.infer<typeof schema>`.
 */
export function rhfZodResolver<Schema extends ZodType>(
  schema: Schema
): Resolver<output<Schema> & FieldValues> {
  return zodResolver(schema as never) as Resolver<output<Schema> & FieldValues>;
}
