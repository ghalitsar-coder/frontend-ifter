import { describe, expect, it } from 'vitest';
import { buildAuditLogQuery, formatAuditPayload, formatAuditTimestamp } from '@/lib/api/audit';

describe('audit query builder', () => {
  it('drops blank filters and converts the 1-based page to an offset', () => {
    const query = buildAuditLogQuery(
      { action: '  ', entity_type: 'student', from: '', to: '2026-10-01' },
      3,
      25,
    );

    expect(query).toStrictEqual({
      limit: 25,
      offset: 50,
      entity_type: 'student',
      to: '2026-10-01',
    });
  });

  it('clamps the page to at least 1', () => {
    expect(buildAuditLogQuery({}, 0, 10).offset).toBe(0);
  });
});

describe('audit payload formatting', () => {
  it('returns pretty JSON for present payloads and empty string for absent ones', () => {
    expect(formatAuditPayload({ a: 1 })).toBe('{\n  "a": 1\n}');
    expect(formatAuditPayload(null)).toBe('');
    expect(formatAuditPayload(null)).toBe('');
  });
});

describe('audit timestamp formatting', () => {
  it('passes the raw string through when unparseable', () => {
    expect(formatAuditTimestamp('bukan-tanggal')).toBe('bukan-tanggal');
  });

  it('formats a valid RFC3339 timestamp as date + HH:mm', () => {
    const label = formatAuditTimestamp('2026-10-01T03:24:00Z');
    expect(label).toMatch(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/u);
  });
});
