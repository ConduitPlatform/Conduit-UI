import { describe, expect, it } from 'vitest';
import {
  FILTER_UNSAFE_MESSAGE,
  isSafeOperatorFilter,
  parseOperatorFilterJson,
} from './operator-filter';

describe('operator filter allowlist', () => {
  it('accepts equality, comparisons, bounded membership, and $and', () => {
    expect(isSafeOperatorFilter({ published: true })).toBe(true);
    expect(isSafeOperatorFilter({ status: { $eq: 'live' } })).toBe(true);
    expect(isSafeOperatorFilter({ count: { $gte: 1, $lte: 10 } })).toBe(true);
    expect(isSafeOperatorFilter({ status: { $in: ['draft', 'live'] } })).toBe(
      true
    );
    expect(
      isSafeOperatorFilter({
        $and: [{ published: true }, { score: { $gt: 0 } }],
      })
    ).toBe(true);
  });

  it('rejects arbitrary $ keys, regex, and oversized membership lists', () => {
    expect(isSafeOperatorFilter({ $where: 'this.admin === true' })).toBe(false);
    expect(isSafeOperatorFilter({ $or: [{ a: 1 }] })).toBe(false);
    expect(isSafeOperatorFilter({ title: { $regex: '.*' } })).toBe(false);
    expect(isSafeOperatorFilter({ title: { $exists: true } })).toBe(false);
    expect(
      isSafeOperatorFilter({
        status: { $in: Array.from({ length: 33 }, () => 'a') },
      })
    ).toBe(false);
    expect(isSafeOperatorFilter({ __proto__: { admin: true } })).toBe(false);
    expect(parseOperatorFilterJson('{"__proto__":{"admin":true}}').ok).toBe(
      false
    );
  });

  it('parses JSON with the same backend-safe operators', () => {
    expect(parseOperatorFilterJson('')).toEqual({
      ok: true,
      filter: undefined,
    });
    expect(parseOperatorFilterJson('{"status":"draft"}')).toEqual({
      ok: true,
      filter: { status: 'draft' },
    });
    expect(parseOperatorFilterJson('{"$where":"1==1"}')).toEqual({
      ok: false,
      error: FILTER_UNSAFE_MESSAGE,
    });
    expect(parseOperatorFilterJson('[1]')).toEqual({
      ok: false,
      error: 'Filter must be a JSON object.',
    });
  });
});
