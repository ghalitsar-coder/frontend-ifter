import type { SystemSettings } from '@/types/settings';

/**
 * Factory defaults applied on first install and by the reset action.
 */
export const defaultSystemSettings: SystemSettings = {
  presence: {
    gateOpen: '06:30',
    onTimeUntil: '07:00',
    lateToleranceMinutes: 15,
    gateClose: '07:15',
    dismissalWeekday: '14:30',
    dismissalFriday: '11:30',
  },
  geofence: {
    radiusMeters: 150,
    centerLat: -6.48329,
    centerLng: 106.84291,
    detectFakeGps: true,
    requireSelfieLiveness: true,
  },
  notifications: {
    autoSendOnCheckIn: true,
    checkInTemplate:
      'Yth. Bapak/Ibu Wali Murid dari {nama_siswa} ({kelas}), kami menginformasikan bahwa ananda telah hadir di sekolah pada pukul {jam_absen} WIB. Terima kasih atas perhatiannya.',
    sanctionTemplate:
      'Pemberitahuan resmi SMP Negeri 1 Harapan Bangsa: Ananda {nama_siswa} telah mencapai akumulasi {total_poin} poin tata tertib. Diharapkan kehadiran Bapak/Ibu pada {tanggal_sidang}.',
    gatewayQuota: 1200,
  },
};

/**
 * Allowed geofence radius range in meters.
 */
export const GEOFENCE_RADIUS_RANGE = { min: 50, max: 250, step: 10 };
