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

  it('rejects primitive JWT claims', () => {
    for (const claims of [null, true, 12, 'guru']) {
      expect(
        decodeBackendToken(`${encodeSegment({ alg: 'HS256' })}.${encodeSegment(claims)}.signature`),
      ).toBeNull();
    }
  });

  it('drops non-string role entries', () => {
    const token = makeToken({ roles: ['guru', 7, null] });

    expect(decodeBackendToken(token)?.roles).toStrictEqual(['guru']);
  });
});

describe(isAllowedPage, () => {
  it('admits teachers and administrators to personal attendance', () => {
    expect(isAllowedPage(['guru'], 'absen')).toBeTruthy();
    expect(isAllowedPage(['admin'], 'absen')).toBeTruthy();
    expect(isAllowedPage(['school_admin'], 'absen')).toBeTruthy();
  });

  it('admits kesiswaan to personal attendance', () => {
    expect(isAllowedPage(['kesiswaan'], 'absen')).toBeTruthy();
  });

  it('denies other roles access to teacher attendance', () => {
    for (const roles of [[], ['tu'], ['kepala_sekolah']]) {
      expect(isAllowedPage(roles, 'absen')).toBeFalsy();
    }
  });

  it('allows kesiswaan only on kedisiplinan and guru on presensi', () => {
    expect(isAllowedPage(['guru'], 'presensi')).toBeTruthy();
    expect(isAllowedPage(['kesiswaan'], 'kedisiplinan')).toBeTruthy();
  });

  it('denies TU access to teacher attendance', () => {
    expect(isAllowedPage(['tu'], 'presensi')).toBeFalsy();
  });

  it.each(['guru', 'admin', 'school_admin', 'kepsek', 'tu'])(
    'denies %s access to kedisiplinan',
    (role) => {
      expect(isAllowedPage([role], 'kedisiplinan')).toBeFalsy();
    },
  );

  it('treats any role containing admin as allowed on general restricted pages', () => {
    expect(isAllowedPage(['school_admin'], 'presensi')).toBeTruthy();
  });

  it('allows every signed-in role on unrestricted dashboard pages', () => {
    expect(isAllowedPage(['tu'], '')).toBeTruthy();
    expect(isAllowedPage(['kepsek'], 'segera')).toBeTruthy();
  });
});
