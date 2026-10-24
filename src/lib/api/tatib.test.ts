import { describe, expect, it } from 'vitest';
import { ApiError } from '@/lib/api/client';
import type { DisciplineCategory } from '@/lib/api/dto';
import { buildCategoryPayload, categoryToRule, getApiErrorMessage } from '@/lib/api/tatib';
import type { TatibSaveVariables } from '@/lib/api/tatib';
import type { NewRuleInput } from '@/types/tatib';

const baseCategory: DisciplineCategory = {
  id: 'c1',
  code: 'PASAL-01',
  name: 'Keterlambatan Masuk Sekolah',
  description: 'Tidak hadir sebelum 06.45.',
  default_points: 2,
  is_active: true,
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z',
};

const input: NewRuleInput = {
  title: 'Membolos atau Keluar Kelas Tanpa Izin',
  detail: 'Meninggalkan jam pelajaran tanpa surat izin.',
  points: 10,
  procedure: 'Panggilan BK dan konferensi kasus.',
  authority: 'Guru BK',
  legalBasis: 'Permendikbud No. 12/2024',
};

describe('payload builder', () => {
  it('maps modal input to the discipline-category body', () => {
    const payload = buildCategoryPayload('PASAL-10', input);

    expect(payload.code).toBe('PASAL-10');
    expect(payload.name).toBe(input.title);
    expect(payload.default_points).toBe(10);
    expect(payload.description).toContain('Prosedur:');
    expect(payload.description).toContain('Dasar: Permendikbud No. 12/2024');
  });
});

describe('category mapper', () => {
  it('restores title, detail and points from a composite row', () => {
    const rule = categoryToRule({ ...baseCategory, ...buildCategoryPayload('PASAL-10', input) });

    expect(rule.code).toBe('PASAL-10');
    expect(rule.title).toBe(input.title);
    expect(rule.detail).toBe(input.detail);
    expect(rule.points).toBe(10);
    expect(rule.isActive).toBeTruthy();
  });

  it('restores procedure, authority and legal basis markers', () => {
    const rule = categoryToRule({ ...baseCategory, ...buildCategoryPayload('PASAL-10', input) });

    expect(rule.procedure).toBe(input.procedure);
    expect(rule.authority).toBe(input.authority);
    expect(rule.legalBasis).toBe(input.legalBasis);
  });

  it('falls back to the plain description for foreign-encoded categories', () => {
    const rule = categoryToRule(baseCategory);

    expect(rule.detail).toBe('Tidak hadir sebelum 06.45.');
    expect(rule.procedure).toBe('');
    expect(rule.authority).toBe('');
    expect(rule.legalBasis).toBe('');
    expect(rule.points).toBe(2);
  });

  it('defaults missing code and points from the backend row', () => {
    const rule = categoryToRule({ ...baseCategory, code: undefined, default_points: undefined });

    expect(rule.code).toBe('c1');
    expect(rule.points).toBe(0);
  });

  it('preserves multi-line procedure text', () => {
    const payload = buildCategoryPayload('PASAL-11', {
      ...input,
      procedure: 'Langkah satu.\nLangkah dua.',
    });
    const rule = categoryToRule({ ...baseCategory, ...payload });

    expect(rule.procedure).toBe('Langkah satu.\nLangkah dua.');
    expect(rule.detail).toBe(input.detail);
  });
});

describe('error message helper', () => {
  it('prefers the backend envelope message', () => {
    const error = new ApiError(403, 'forbidden', 'Anda tidak berhak mengubah kategori.');

    expect(getApiErrorMessage(error, 'fallback')).toBe('Anda tidak berhak mengubah kategori.');
  });

  it('uses the fallback for non-API errors', () => {
    expect(getApiErrorMessage(new Error('boom'), 'Gagal memuat.')).toBe('Gagal memuat.');
  });
});

describe('save mutation variables', () => {
  it('accepts a create and an edit payload', () => {
    const create: TatibSaveVariables = { code: 'PASAL-13', input, publish: true, editing: null };
    const edit: TatibSaveVariables = { ...create, editing: categoryToRule(baseCategory) };

    expect(create.editing).toBeNull();
    expect(edit.editing?.id).toBe('c1');
  });
});
