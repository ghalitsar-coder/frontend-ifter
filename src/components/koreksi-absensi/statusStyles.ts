import type { AttendanceStatus } from '@/types/attendanceCorrection';

/**
 * Badge styles per attendance code, aligned with the Stitch audit palette.
 */
export const attendanceStatusStyles: Record<AttendanceStatus, string> = {
  alpa: 'border-pastel-red bg-pastel-red/45 text-red-800',
  izin: 'border-pastel-blue bg-pastel-blue/45 text-pine-deep',
  sakit: 'border-pastel-yellow bg-pastel-yellow/55 text-amber-dark',
  hadir: 'border-pastel-mint bg-pastel-mint/55 text-pine-deep',
  dispensasi: 'border-pastel-lavender bg-pastel-lavender/35 text-purple-800',
};

/**
 * Avatar background tones cycled across audit rows.
 */
export const auditAvatarTones = [
  'bg-pastel-mint text-pine-deep',
  'bg-pastel-blue text-pine-deep',
  'bg-pastel-yellow text-amber-dark',
  'bg-pastel-red text-red-800',
  'bg-pastel-lavender text-purple-800',
];
