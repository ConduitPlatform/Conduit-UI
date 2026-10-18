import { AxiosError, type AxiosResponse } from 'axios';
import { describe, expect, it } from 'vitest';
import {
  ActionError,
  runAction,
  unwrapActionResult,
} from '@/lib/api/action-result';

const axiosFailure = (status: number, data: unknown) =>
  new AxiosError(
    `Request failed with status code ${status}`,
    'ERR_BAD_REQUEST',
    undefined,
    undefined,
    { status, data } as AxiosResponse
  );

describe('runAction', () => {
  it('wraps a resolved value', async () => {
    await expect(runAction(async () => 42)).resolves.toEqual({
      ok: true,
      data: 42,
    });
  });

  it('extracts conduitCode and message from the hermes error body', async () => {
    const result = await runAction(async () => {
      throw axiosFailure(409, {
        name: 'ALREADY_EXISTS',
        status: 409,
        message: 'Slug taken',
        conduitCode: 'REALM_SLUG_TAKEN',
      });
    });
    expect(result).toEqual({
      ok: false,
      code: 'REALM_SLUG_TAKEN',
      message: 'Slug taken',
      status: 409,
    });
  });

  it('falls back to a status-derived code and error.message', async () => {
    const result = await runAction(async () => {
      throw axiosFailure(412, undefined);
    });
    expect(result).toEqual({
      ok: false,
      code: 'FAILED_PRECONDITION',
      message: 'Request failed with status code 412',
      status: 412,
    });
  });

  it('reports a missing response as a network error', async () => {
    const result = await runAction(async () => {
      throw new AxiosError('connect ECONNREFUSED', 'ECONNREFUSED');
    });
    expect(result).toEqual({
      ok: false,
      code: 'NETWORK_ERROR',
      message: 'connect ECONNREFUSED',
    });
  });

  it('converts other errors to UNKNOWN', async () => {
    const result = await runAction(async () => {
      throw new Error('boom');
    });
    expect(result).toEqual({ ok: false, code: 'UNKNOWN', message: 'boom' });
  });

  it('lets Next.js control-flow errors (redirect) propagate', async () => {
    const redirectError = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/login;307;',
    });
    await expect(
      runAction(async () => {
        throw redirectError;
      })
    ).rejects.toBe(redirectError);
  });
});

describe('unwrapActionResult', () => {
  it('returns data or throws an ActionError carrying the code', () => {
    expect(unwrapActionResult({ ok: true, data: 'x' })).toBe('x');
    try {
      unwrapActionResult({
        ok: false,
        code: 'REALM_NESTED',
        message: 'nested',
        status: 400,
      });
      expect.unreachable();
    } catch (error) {
      expect(error).toBeInstanceOf(ActionError);
      expect(error).toMatchObject({
        code: 'REALM_NESTED',
        message: 'nested',
        status: 400,
      });
    }
  });
});
