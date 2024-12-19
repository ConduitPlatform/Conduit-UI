import { z } from 'zod';

export enum ParamsEnum {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  ObjectId = 'objectId',
  Date = 'date',
  JSON = 'json',
}

export enum ReturnTypesEnum {
  String = 'string',
  Number = 'number',
  Boolean = 'boolean',
  JSON = 'json',
}

const bodyParams = z
  .array(
    z.object({
      required: z.boolean(),
      isArray: z.boolean(),
      params: z.object({
        name: z.string(),
        type: z.nativeEnum(ParamsEnum),
      }),
    })
  )
  .optional();

const queryParams = z
  .array(
    z.object({
      required: z.boolean(),
      isArray: z.boolean(),
      params: z.object({
        name: z.string(),
        type: z.nativeEnum(ParamsEnum),
      }),
    })
  )
  .optional();

const urlParams = z
  .array(
    z.object({
      params: z.object({
        name: z.string(),
        type: z.nativeEnum(ParamsEnum), // exclude 'json' and 'date'
      }),
    })
  )
  .optional();

const returnTypes = z
  .object({
    name: z.string(),
    type: z.nativeEnum(ReturnTypesEnum),
  })
  .optional();

const httpOptions = z.discriminatedUnion('verb', [
  z.object({
    verb: z.literal('GET'),
    queryParams,
    urlParams,
    returnTypes,
  }),
  z.object({
    verb: z.literal('POST'),
    bodyParams,
    queryParams,
    urlParams,
    returnTypes,
  }),
  z.object({
    verb: z.literal('PUT'),
    bodyParams,
    queryParams,
    urlParams,
    returnTypes,
  }),
  z.object({
    verb: z.literal('DELETE'),
    queryParams,
    urlParams,
    returnTypes,
  }),
  z.object({
    verb: z.literal('PATCH'),
    bodyParams,
    queryParams,
    urlParams,
    returnTypes,
  }),
]);

export const WebhookOptions = z.object({
  functionType: z.literal('webhook'),
  middlewares: z.array(z.string()),
  verb: z.union([
    z.literal('GET'),
    z.literal('POST'),
    z.literal('PUT'),
    z.literal('DELETE'),
    z.literal('PATCH'),
  ]),
  http: httpOptions,
});
export const RequestOptions = z.object({
  functionType: z.literal('request'),
  middlewares: z.array(z.string()),
  verb: z.union([
    z.literal('GET'),
    z.literal('POST'),
    z.literal('PUT'),
    z.literal('DELETE'),
    z.literal('PATCH'),
  ]),
  http: httpOptions,
});
export const EventOptions = z.object({
  functionType: z.literal('event'),
  eventName: z.string(),
});
export const CronOptions = z.object({
  functionType: z.literal('cron'),
  cronString: z.string(),
});
export const SocketOptions = z.object({
  functionType: z.literal('socket'),
});
export const MiddlewareOptions = z.object({
  functionType: z.literal('middleware'),
});
export const schema = z.object({
  functionName: z.string(),
  functionType: z.union([
    z.literal('request'),
    z.literal('webhook'),
    z.literal('event'),
    z.literal('cron'),
    z.literal('socket'),
    z.literal('middleware'),
  ]),
  timeout: z.coerce
    .number()
    .nonnegative({ message: 'Timeout can not be a negative number' })
    .min(0)
    .optional(),
  functionCode: z.string(),
  options: z.discriminatedUnion('functionType', [
    WebhookOptions,
    RequestOptions,
    EventOptions,
    CronOptions,
    SocketOptions,
    MiddlewareOptions,
  ]),
});
