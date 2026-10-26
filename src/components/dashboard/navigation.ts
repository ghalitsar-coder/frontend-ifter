export const dashboardRoles = ['admin', 'guru', 'kepsek', 'tu'] as const;

export type DashboardRole = (typeof dashboardRoles)[number];

export type NavBadgeTone =
  | 'amber'
  | 'sick'
  | 'permission'
  | 'error'
  | 'pine'
  | 'muted'
  | 'surface'
  | 'present';

export type NavItem = {
  icon: string;
  label: string;
  href?: string;
  active?: boolean;
  badge?: { label: string; tone: NavBadgeTone; box?: boolean };
  dot?: 'amber' | 'absent';
  arrow?: boolean;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

export type RoleCallout =
  | { kind: 'mandate'; title: string; text: string }
  | { kind: 'approval'; title: string; period: string; text: string; action: string }
  | { kind: 'sync'; label: string; value: string };

export type RoleConfig = {
  workspace: string;
  activeClassName: string;
  activeIconClassName: string;
  sections: NavSection[];
  callout?: RoleCallout;
  user: { initials: string; name: string; meta: string; avatarClassName: string };
  headerRole: string;
};

export const roleConfigs: Record<DashboardRole, RoleConfig> = {
  admin: {
    workspace: 'Admin Workspace',
    activeClassName: 'bg-pine-hover text-on-primary',
    activeIconClassName: 'text-amber-gold',
    headerRole: 'Tim Piket & Admin',
    user: {
      initials: 'AS',
      name: 'Drs. Agus Subagyo',
      meta: 'Super Admin • 19780210...',
      avatarClassName: 'bg-amber-gold text-pine-deep',
    },
    sections: [
      {
        title: 'Pusat Kendali',
        items: [
          {
            icon: 'dashboard',
            label: 'Dashboard Utama',
            href: '/dashboard',
            active: true,
            dot: 'amber',
          },
          {
            icon: 'pending_actions',
            label: 'Koreksi & Audit Log',
            badge: { label: '4 Pending', tone: 'sick' },
          },
        ],
      },
      {
        title: 'Master Data & Rombel',
        items: [
          { icon: 'groups', label: 'Data Siswa & Rombel', arrow: true },
          { icon: 'badge', label: 'Data Guru & PTK' },
          { icon: 'assignment_ind', label: 'Jadwal Piket & Wali' },
        ],
      },
      {
        title: 'Presensi & Regulasi',
        items: [
          { icon: 'fact_check', label: 'Presensi Harian & Rekap' },
          { icon: 'gavel', label: 'Aturan & Sanksi (Poin)' },
          {
            icon: 'table_view',
            label: 'Import / Export Excel',
            badge: { label: 'XLSX', tone: 'surface', box: true },
          },
        ],
      },
      {
        title: 'Governance & Root',
        items: [
          { icon: 'manage_accounts', label: 'Manajemen Akun / RBAC' },
          { icon: 'settings', label: 'Pengaturan Sistem' },
        ],
      },
    ],
  },
  guru: {
    workspace: 'Wali Kelas Portal',
    activeClassName: 'bg-amber-gold font-semibold text-pine-deep shadow-sm',
    activeIconClassName: '',
    headerRole: 'Wali Kelas VIII A',
    user: {
      initials: 'SW',
      name: 'Siti Wahyuni, S.Pd.',
      meta: 'Wali Kelas VIII A • NIP 198205...',
      avatarClassName: 'bg-status-present text-pine-deep',
    },
    sections: [
      {
        title: 'Aktivitas Mengajar',
        items: [
          { icon: 'co_present', label: 'Dashboard Guru', href: '/dashboard?role=guru' },
          {
            icon: 'checklist_rtl',
            label: 'Presensi Kelas Binaan',
            active: true,
            badge: { label: '2 Belum', tone: 'pine' },
          },
          { icon: 'history', label: 'Riwayat & Rekap Kelas' },
        ],
      },
      {
        title: 'Perwalian Siswa',
        items: [
          {
            icon: 'group',
            label: 'Data Siswa Kelas Saya',
            badge: { label: '32', tone: 'muted' },
          },
          { icon: 'warning', label: 'Catat Pelanggaran Siswa', dot: 'absent' },
          { icon: 'summarize', label: 'Laporan Rapor & Absen' },
        ],
      },
      {
        title: 'Presensi Pribadi',
        items: [
          {
            icon: 'fingerprint',
            label: 'Presensi Mandiri Guru',
            badge: { label: '06:48 WIB', tone: 'present', box: true },
          },
        ],
      },
    ],
    callout: {
      kind: 'mandate',
      title: 'Lingkup Mandat',
      text: 'Hanya dapat mengubah absensi siswa kelas VIII A maksimal 2x24 jam sejak jam masuk.',
    },
  },
  kepsek: {
    workspace: 'Executive Suite',
    activeClassName: 'bg-pine-hover text-on-primary',
    activeIconClassName: 'text-amber-gold',
    headerRole: 'Kepala Sekolah',
    user: {
      initials: 'HM',
      name: 'Dra. Hj. Maimunah, M.Pd.',
      meta: 'Kepala Sekolah • Pembina Tk. I',
      avatarClassName: 'bg-secondary-fixed text-amber-dark',
    },
    sections: [
      {
        title: 'Ikhtisar Institusi',
        items: [
          { icon: 'insights', label: 'Dashboard Eksekutif', href: '/dashboard?role=kepsek' },
          {
            icon: 'draw',
            label: 'Pengesahan & TTD Resmi',
            active: true,
            badge: { label: '3 Perlu TTD', tone: 'amber' },
          },
        ],
      },
      {
        title: 'Evaluasi & Pengawasan',
        items: [
          {
            icon: 'supervisor_account',
            label: 'Evaluasi Kehadiran & Guru',
            badge: { label: '98.2%', tone: 'muted', box: true },
          },
          {
            icon: 'emergency_home',
            label: 'Monitoring Kasus Kritis (SP)',
            badge: { label: '2 SP2', tone: 'error' },
          },
        ],
      },
      {
        title: 'Laporan Eksternal Dinas',
        items: [
          { icon: 'query_stats', label: 'Rekap & Analitik Dinas' },
          { icon: 'account_balance', label: 'Profil & Akreditasi Sekolah' },
        ],
      },
    ],
    callout: {
      kind: 'approval',
      title: 'Dokumen Siap TTD',
      period: 'Bulan Okt 2026',
      text: 'Rekap Matriks Presensi 840 Siswa & 52 Guru telah diverifikasi TU.',
      action: 'Buka Meja TTD',
    },
  },
  tu: {
    workspace: 'Logistik & TU',
    activeClassName: 'bg-pine-hover text-on-primary',
    activeIconClassName: 'text-amber-gold',
    headerRole: 'Operator Dapodik & TU',
    user: {
      initials: 'BP',
      name: 'Bambang Prakoso',
      meta: 'Operator Dapodik & TU • NIP 1991...',
      avatarClassName: 'bg-status-permission text-pine-deep',
    },
    sections: [
      {
        title: 'Layanan Administrasi',
        items: [
          { icon: 'receipt_long', label: 'Dashboard Layanan TU', href: '/dashboard?role=tu' },
          {
            icon: 'mark_email_read',
            label: 'Verifikasi Berkas Izin & SK',
            active: true,
            badge: { label: '5 Berkas', tone: 'permission' },
          },
        ],
      },
      {
        title: 'Master & Dapodik',
        items: [
          { icon: 'badge', label: 'Master Siswa & NISN', arrow: true },
          { icon: 'badge', label: 'Master Guru & Pegawai' },
          {
            icon: 'upload_file',
            label: 'Import Excel Massal',
            badge: { label: '6 Gagal', tone: 'error' },
          },
        ],
      },
      {
        title: 'Dokumen & Arsip Cetak',
        items: [
          { icon: 'print', label: 'Cetak Buku Induk Siswa' },
          { icon: 'description', label: 'Legalisir Surat Sakit' },
        ],
      },
    ],
    callout: { kind: 'sync', label: 'Status Dapodik', value: 'Tersinkron' },
  },
};
