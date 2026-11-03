/**
 * Who is signing in: a teacher, kesiswaan staff, or a school operator/admin.
 */
export type PresensiLoginRole = 'admin' | 'teacher' | 'kesiswaan';

type LoginRoleField = {
  helpKey: 'login_email_help' | 'login_nip_help';
  icon: string;
  labelKey: 'login_email_label' | 'login_nip_label';
  placeholderKey: 'login_email_placeholder' | 'login_nip_placeholder';
  submitKey: 'login_submit_admin' | 'login_submit_teacher';
  type: 'email' | 'text';
};

/**
 * Credential-field copy and input type per role, mirroring the segmented control of the Stitch
 * login screen. The backend takes one `username`, so the NIP and the email share that field.
 */
export const LOGIN_ROLE_FIELDS: Record<PresensiLoginRole, LoginRoleField> = {
  admin: {
    helpKey: 'login_email_help',
    icon: 'alternate_email',
    labelKey: 'login_email_label',
    placeholderKey: 'login_email_placeholder',
    submitKey: 'login_submit_admin',
    type: 'email',
  },
  kesiswaan: {
    helpKey: 'login_nip_help',
    icon: 'gavel',
    labelKey: 'login_nip_label',
    placeholderKey: 'login_nip_placeholder',
    submitKey: 'login_submit_teacher',
    type: 'text',
  },
  teacher: {
    helpKey: 'login_nip_help',
    icon: 'badge',
    labelKey: 'login_nip_label',
    placeholderKey: 'login_nip_placeholder',
    submitKey: 'login_submit_teacher',
    type: 'text',
  },
};
