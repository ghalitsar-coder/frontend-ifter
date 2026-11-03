import { describe, expect, it } from 'vitest';
import { DisciplineApiError } from '@/services/disciplineApi';

describe('DisciplineApiError', () => {
  it('correctly constructs with code, message and status', () => {
    const err = new DisciplineApiError({
      code: 'invalid_points',
      message: 'Points must be non-negative',
      status: 422,
    });

    expect(err.name).toBe('DisciplineApiError');
    expect(err.code).toBe('invalid_points');
    expect(err.message).toBe('Points must be non-negative');
    expect(err.status).toBe(422);
    expect(err instanceof Error).toBe(true);
  });
});
