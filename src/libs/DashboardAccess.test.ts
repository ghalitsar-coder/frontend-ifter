import { describe, expect, it } from 'vitest';
import { decodeBackendToken, isAllowedPage } from './DashboardAccess';

function encodeSegment(value: unknown): string {
  return btoa(JSON.stringify(value)).replaceAll('+', '-').replaceAll('/', '_').replaceAll('=', '');
}

function makeToken(claims: Record<string, unknown>): string {
  return `${encodeSegment({ alg: 'HS256' })}.${encodeSegment(claims)}.signature`;
}

const HOUR_MS = 3_600_000;

describe(decodeBackendToken, () => {
  it('reads roles and liveness from the JWT payload', () => {
    const token = makeToken({ exp: Math.floor((Date.now() + HOUR_MS) / 1000), roles: ['guru'] });

    expect(decodeBackendToken(token)).toStrictEqual({ expired: false, roles: ['guru'] });
  });

  it('marks a past exp as expired', () => {
    const token = makeToken({ exp: Math.floor((Date.now() - HOUR_MS) / 1000), roles: ['guru'] });

    expect(decodeBackendToken(token)?.expired).toBeTruthy();
  });

  it('returns null for a missing or unreadable cookie', () => {
    expect(decodeBackendToken()).toBeNull();
    expect(decodeBackendToken('not-a-jwt')).toBeNull();
  });

  it('drops non-string role entries', () => {
    const token = makeToken({ roles: ['guru', 7, null] });

    expect(decodeBackendToken(token)?.roles).toStrictEqual(['guru']);
  });
});

describe(isAllowedPage, () => {
  it('allows guru and admin on the workbench pages', () => {
    expect(isAllowedPage(['guru'], 'presensi')).toBeTruthy();
    expect(isAllowedPage(['admin'], 'kedisiplinan')).toBeTruthy();
  });

  it('denies other roles on restricted pages', () => {
    expect(isAllowedPage(['tu'], 'presensi')).toBeFalsy();
    expect(isAllowedPage(['kepsek'], 'kedisiplinan')).toBeFalsy();
  });

  it('treats any role containing admin as allowed', () => {
    expect(isAllowedPage(['school_admin'], 'presensi')).toBeTruthy();
  });

  it('allows every signed-in role on unrestricted dashboard pages', () => {
    expect(isAllowedPage(['tu'], '')).toBeTruthy();
    expect(isAllowedPage(['kepsek'], 'segera')).toBeTruthy();
  });
});
