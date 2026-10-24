import { describe, expect, it } from 'vitest';
import {
  EMPTY_PENDAFTARAN_DRAFT,
  identityIssues,
  nextPendaftaranStep,
  otpCodeComplete,
} from '@/components/pendaftaran/pendaftaranState';

const VALID = {
  ...EMPTY_PENDAFTARAN_DRAFT,
  adminName: 'Drs. Hendra Pratama, M.Pd.',
  confirmPassword: 'HadirTerus2026',
  email: 'admin@smpn1sleman.sch.id',
  level: 'SMP',
  name: 'SMP Negeri 1 Sleman',
  npsn: '20501234',
  password: 'HadirTerus2026',
  phone: '081234567890',
  termsAccepted: true,
};

describe(identityIssues, () => {
  it('returns no issue for a complete form', () => {
    expect(identityIssues(VALID)).toStrictEqual({});
  });

  it('flags every empty required field', () => {
    const issues = identityIssues(EMPTY_PENDAFTARAN_DRAFT);

    expect(Object.keys(issues).toSorted()).toStrictEqual([
      'adminName',
      'confirmPassword',
      'email',
      'level',
      'name',
      'npsn',
      'password',
      'phone',
      'termsAccepted',
    ]);
  });

  it('rejects an NPSN that is not eight digits', () => {
    expect(identityIssues({ ...VALID, npsn: '2040123' }).npsn?.messageKey).toBe(
      'id_error_npsn_format',
    );
  });

  it('names the registered school for a duplicate NPSN', () => {
    const issues = identityIssues({ ...VALID, npsn: '20401234' });

    expect(issues.npsn?.messageKey).toBe('id_error_npsn_duplicate');
    expect(issues.npsn?.values).toStrictEqual({
      npsn: '20401234',
      school: 'SMP Negeri 1 Sleman',
    });
  });

  it('rejects an email outside the school domain format', () => {
    expect(identityIssues({ ...VALID, email: 'hendra@gmail' }).email).toBeDefined();
  });

  it('accepts both local and international WhatsApp formats', () => {
    expect(identityIssues({ ...VALID, phone: '0812-3456-7890' }).phone).toBeUndefined();
    expect(identityIssues({ ...VALID, phone: '+62 812 3456 7890' }).phone).toBeUndefined();
    expect(identityIssues({ ...VALID, phone: '12345' }).phone).toBeDefined();
  });

  it('requires eight characters of password', () => {
    expect(
      identityIssues({ ...VALID, confirmPassword: 'abc12345', password: 'abc1234' }).password
        ?.messageKey,
    ).toBe('id_error_password_length');
  });

  it('requires both password entries to match', () => {
    expect(
      identityIssues({ ...VALID, confirmPassword: 'HadirTerus2027' }).confirmPassword?.messageKey,
    ).toBe('id_error_password_mismatch');
  });

  it('requires the terms agreement', () => {
    expect(identityIssues({ ...VALID, termsAccepted: false }).termsAccepted).toBeDefined();
  });
});

describe(otpCodeComplete, () => {
  it('accepts exactly six digits', () => {
    expect(otpCodeComplete('471208')).toBeTruthy();
  });

  it('rejects anything shorter or non-numeric', () => {
    expect(otpCodeComplete('47120')).toBeFalsy();
    expect(otpCodeComplete('47120a')).toBeFalsy();
  });
});

describe(nextPendaftaranStep, () => {
  it('walks the wizard forward and back', () => {
    expect(nextPendaftaranStep('identitas', 'next')).toBe('dokumen');
    expect(nextPendaftaranStep('dokumen', 'next')).toBe('otp');
    expect(nextPendaftaranStep('otp', 'next')).toBe('selesai');
    expect(nextPendaftaranStep('otp', 'back')).toBe('dokumen');
    expect(nextPendaftaranStep('dokumen', 'back')).toBe('identitas');
  });

  it('holds at the first and last step', () => {
    expect(nextPendaftaranStep('identitas', 'back')).toBe('identitas');
    expect(nextPendaftaranStep('selesai', 'next')).toBe('selesai');
  });
});
