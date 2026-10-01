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

  it('rethrows static-generation bailouts so next build can mark the route dynamic', async () => {
    const dynamic = Object.assign(
      new Error(
        "Dynamic server usage: Route /settings/user-settings couldn't be rendered statically because it used `cookies`."
      ),
      { digest: 'DYNAMIC_SERVER_USAGE' }
    );
    await expect(
      withAdminApiError(async () => {
        throw dynamic;
      })
    ).rejects.toBe(dynamic);
  });

  it('rethrows a static-generation bailout nested as an error cause', async () => {
    const dynamic = Object.assign(new Error('Dynamic server usage: cookies'), {
      digest: 'DYNAMIC_SERVER_USAGE',
    });
    const wrapped = new Error('wrapper', { cause: dynamic });
    await expect(
      withAdminApiError(async () => {
        throw wrapped;
      })
    ).rejects.toBe(dynamic);
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
