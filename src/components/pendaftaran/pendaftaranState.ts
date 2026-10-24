/**
 * Draft of the school registration wizard, one flat record of everything the three steps collect.
 */
export type PendaftaranDraft = {
  adminName: string;
  confirmPassword: string;
  email: string;
  level: string;
  name: string;
  npsn: string;
  password: string;
  phone: string;
  termsAccepted: boolean;
  waOptIn: boolean;
};

export type PendaftaranField = keyof PendaftaranDraft;

export type PendaftaranStep = 'dokumen' | 'identitas' | 'otp' | 'selesai';

/**
 * One failing field: the message key of the form copy plus the values the message interpolates.
 */
export type PendaftaranIssue = {
  messageKey:
    | 'id_error_email'
    | 'id_error_npsn_duplicate'
    | 'id_error_npsn_format'
    | 'id_error_password_length'
    | 'id_error_password_mismatch'
    | 'id_error_required'
    | 'id_error_terms'
    | 'id_error_phone';
  values?: Record<string, string>;
};

export type PendaftaranIssueMap = Partial<Record<PendaftaranField, PendaftaranIssue>>;

export const EMPTY_PENDAFTARAN_DRAFT: PendaftaranDraft = {
  adminName: '',
  confirmPassword: '',
  email: '',
  level: '',
  name: '',
  npsn: '',
  password: '',
  phone: '',
  termsAccepted: false,
  waOptIn: true,
};

// shortcut: no backend lookup exists yet, so the duplicate check reads this fixed register;
// replace with the NPSN availability endpoint once the public API route lands.
const REGISTERED_NPSN: Record<string, string> = {
  '20401234': 'SMP Negeri 1 Sleman',
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const OTP_LENGTH = 6;
const STEP_ORDER = ['identitas', 'dokumen', 'otp', 'selesai'] as const;

/**
 * Next step of the wizard for a navigation event.
 *
 * @param step - Current step.
 * @param event - User action moving through the wizard.
 * @returns Step to render, unchanged at either end of the flow.
 */
export function nextPendaftaranStep(
  step: PendaftaranStep,
  event: 'back' | 'next',
): PendaftaranStep {
  const index = STEP_ORDER.indexOf(step);
  const moved = event === 'next' ? index + 1 : index - 1;

  return STEP_ORDER[Math.min(Math.max(moved, 0), STEP_ORDER.length - 1)] ?? step;
}

/**
 * Validation failures of step one, keyed by field so the form can mark each input and the summary
 * banner can list them in order.
 *
 * @param draft - Current wizard draft.
 * @returns Issue per failing field; empty when the step may advance.
 */
export function identityIssues(draft: PendaftaranDraft): PendaftaranIssueMap {
  const issues: PendaftaranIssueMap = {};

  if (draft.name.trim() === '') {
    issues.name = { messageKey: 'id_error_required' };
  }

  const registeredSchool = REGISTERED_NPSN[draft.npsn];

  if (!/^\d{8}$/u.test(draft.npsn)) {
    issues.npsn = { messageKey: 'id_error_npsn_format' };
  } else if (registeredSchool !== undefined) {
    issues.npsn = {
      messageKey: 'id_error_npsn_duplicate',
      values: { npsn: draft.npsn, school: registeredSchool },
    };
  }

  if (draft.level === '') {
    issues.level = { messageKey: 'id_error_required' };
  }

  if (draft.adminName.trim() === '') {
    issues.adminName = { messageKey: 'id_error_required' };
  }

  if (!EMAIL_PATTERN.test(draft.email)) {
    issues.email = { messageKey: 'id_error_email' };
  }

  const phone = draft.phone.replaceAll(/\D/gu, '');
  if (phone.length < 9 || phone.length > 14 || !(phone.startsWith('0') || phone.startsWith('62'))) {
    issues.phone = { messageKey: 'id_error_phone' };
  }

  if (draft.password.length < 8) {
    issues.password = { messageKey: 'id_error_password_length' };
  }

  if (draft.confirmPassword === '') {
    issues.confirmPassword = { messageKey: 'id_error_required' };
  } else if (draft.confirmPassword !== draft.password) {
    issues.confirmPassword = { messageKey: 'id_error_password_mismatch' };
  }

  if (!draft.termsAccepted) {
    issues.termsAccepted = { messageKey: 'id_error_terms' };
  }

  return issues;
}

/**
 * Whether a typed one-time code is long enough to send.
 *
 * @param code - Digits collected from the six code boxes.
 * @returns True for exactly six digits.
 */
export function otpCodeComplete(code: string): boolean {
  return code.length === OTP_LENGTH && /^\d+$/u.test(code);
}
