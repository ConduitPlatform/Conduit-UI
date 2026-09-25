import { describe, expect, it } from 'vitest';
import {
  formatAdminApiError,
  isNextNavigationError,
  withAdminApiError,
} from '@/lib/logic/api-error';

describe('formatAdminApiError', () => {
  it('prefers the API response message from axios-like errors', () => {
    expect(
      formatAdminApiError({
        message: 'Request failed with status code 500',
        response: {
          status: 500,
          data: {
            message:
              'Admin validation failed: username: Path `username` is required.',
          },
        },
      })
    ).toBe('Admin validation failed: username: Path `username` is required.');
  });
});

describe('withAdminApiError', () => {
  it('rethrows Next.js navigation errors unchanged', async () => {
    const redirect = Object.assign(new Error('NEXT_REDIRECT'), {
      digest: 'NEXT_REDIRECT;replace;/login;307;',
    });
    await expect(
      withAdminApiError(async () => {
        throw redirect;
      })
    ).rejects.toBe(redirect);
    expect(isNextNavigationError(redirect)).toBe(true);
  });

  it('converts axios-like failures into a plain Error so Server Actions can serialize them', async () => {
    const axiosLike = {
      message: 'Request failed with status code 500',
      response: {
        status: 500,
        data: { message: 'Username already exists' },
      },
    };
    await expect(
      withAdminApiError(async () => {
        throw axiosLike;
      })
    ).rejects.toEqual(
      expect.objectContaining({ message: 'Username already exists' })
    );
    await expect(
      withAdminApiError(async () => {
        throw axiosLike;
      })
    ).rejects.toBeInstanceOf(Error);
  });
});
