import type { RuleSeverity, SanctionTier, TatibRule } from '@/types/tatib';

/**
 * Bound of each severity band in discipline points.
 */
const SEVERITY_BOUNDS: { severity: RuleSeverity; max: number }[] = [
  { severity: 'ringan', max: 15 },
  { severity: 'sedang', max: 25 },
  { severity: 'berat', max: 50 },
];

/**
 * Derive the severity band from a rule point weight.
 *
 * @param points - Point deduction of the rule.
 * @returns Severity band for the given weight.
 */
export function getRuleSeverity(points: number): RuleSeverity {
  const band = SEVERITY_BOUNDS.find((item) => points <= item.max);
  return band ? band.severity : 'kritis';
}

/**
 * Point thresholds that escalate sanctions from SP1 up to a plenary hearing.
 */
export const mockSanctionTiers: SanctionTier[] = [
  {
    id: 'sp1',
    label: 'SP1',
    threshold: 30,
    descriptionKey: 'tier_sp1_desc',
  },
  {
    id: 'sp2',
    label: 'SP2',
    threshold: 50,
    descriptionKey: 'tier_sp2_desc',
  },
  {
    id: 'sp3',
    label: 'SP3',
    threshold: 75,
    descriptionKey: 'tier_sp3_desc',
  },
  {
    id: 'pleno',
    label: 'Sidang Pleno',
    threshold: 100,
    descriptionKey: 'tier_pleno_desc',
  },
];

/**
 * Code of conduct catalog from the school handbook (Buku Saku v2.4).
 */
export const mockTatibRules: TatibRule[] = [
  {
    id: 'tatib-01',
    code: 'PASAL-01',
    title: 'Keterlambatan Masuk Sekolah (H-15 Menit)',
    detail: 'Tidak di gerbang sekolah sebelum pukul 06.45 tanpa alasan medis/khusus.',
    points: 2,
    procedure:
      'Kompetensi piket memberi teguran lisan, mencatat kehadiran, dan menyita waktu bermain 10 menit.',
    authority: 'Guru Piket',
    legalBasis: 'Permendikbud No. 12/2024',
    isActive: true,
  },
  {
    id: 'tatib-02',
    code: 'PASAL-02',
    title: 'Tidak Memakai Atribut Lengkap Sekolah',
    detail: 'Seragam tidak sesuai ketentuan, kaos kaki, sabuk, badge, atau dasi tidak dikenakan.',
    points: 3,
    procedure:
      'Pembinaan langsung piket, pencatatan di buku kedisiplinan, dan penggantian atribut cadangan di koperasi.',
    authority: 'Guru Piket',
    legalBasis: 'Permendikbud No. 12/2024',
    isActive: true,
  },
  {
    id: 'tatib-03',
    code: 'PASAL-03',
    title: 'Tidak Mengerjakan Tugas Akademik',
    detail: 'Tidak menyelesaikan tugas wajib mata pelajaran tanpa alasan yang sah.',
    points: 5,
    procedure: 'Guru mata pelajaran memberi tugas susulan dan mencatat pada jurnal kelas.',
    authority: 'Guru Mata Pelajaran',
    legalBasis: 'Kurikulum Operasional Sekolah',
    isActive: true,
  },
  {
    id: 'tatib-04',
    code: 'PASAL-07',
    title: 'Penggunaan Gawai / Game Saat KBM Tanpa Izin',
    detail:
      'Mengaktifkan perangkat elektronik, bermain gim, atau menonton hiburan di jam pelajaran.',
    points: 5,
    procedure:
      'Penyitaan gawai sementara sampai jam pulang, pencatatan, dan edukasi etika digital.',
    authority: 'Guru Mata Pelajaran',
    legalBasis: 'Permendikbud No. 12/2024',
    isActive: true,
  },
  {
    id: 'tatib-05',
    code: 'PASAL-10',
    title: 'Membolos atau Keluar Kelas Tanpa Izin',
    detail: 'Meninggalkan jam pelajaran tanpa surat izin dari guru mata pelajaran atau BK.',
    points: 10,
    procedure:
      'Panggilan BK, konferensi kasus, serta surat pernyataan siswa yang ditandatangani wali kelas.',
    authority: 'Guru BK',
    legalBasis: 'Permendikbud No. 12/2024',
    isActive: true,
  },
  {
    id: 'tatib-06',
    code: 'PASAL-12',
    title: 'Meninggalkan Area Sekolah Saat KBM',
    detail: 'Keluar pagar sekolah pada jam belajar tanpa izin tertulis dari piket atau BK.',
    points: 10,
    procedure:
      'Penjemputan oleh guru piket, wawancara BK, konferensi kasus dengan wali kelas, dan surat pernyataan siswa.',
    authority: 'Guru BK',
    legalBasis: 'Tata Tertib Sekolah Pasal 12',
    isActive: true,
  },
  {
    id: 'tatib-07',
    code: 'PASAL-15',
    title: 'Plagiarisme & Kecurangan Ujian',
    detail: 'Menyalin karya tulis, menyontek, atau memalsukan hasil asesmen akademik.',
    points: 15,
    procedure:
      'Asesmen ulang bersyarat, pembinaan integritas akademik, dan pemberitahuan resmi ke orang tua.',
    authority: 'Wakasek Kurikulum',
    legalBasis: 'Kurikulum Operasional Sekolah',
    isActive: true,
  },
  {
    id: 'tatib-08',
    code: 'PASAL-18',
    title: 'Membawa / Menghisap Rokok & Vape di Sekolah',
    detail:
      'Membawa, menyimpan, atau menggunakan rokok konvensional maupun vape di lingkungan sekolah.',
    points: 25,
    procedure:
      'Penyitaan barang, pemanggilan orang tua, konseling berhenti merokok di puskesmas, dan surat komitmen bermeterai.',
    authority: 'Wakasek Kesiswaan',
    legalBasis: 'Perda Kawasan Tanpa Rokok',
    isActive: true,
  },
  {
    id: 'tatib-09',
    code: 'PASAL-21',
    title: 'Membawa / Mengonsumsi Minuman Keras & Zat Adiktif',
    detail:
      'Membawa atau mengonsumsi minuman beralkohol, obat terlarang, atau zat adiktif lainnya.',
    points: 30,
    procedure:
      'Penyitaan barang, pemanggilan orang tua, rujukan rehabilitasi, dan pelaporan kepada pihak berwenang bila diperlukan.',
    authority: 'Kepala Sekolah',
    legalBasis: 'UU No. 35/2009 Narkotika',
    isActive: true,
  },
  {
    id: 'tatib-10',
    code: 'PASAL-24',
    title: 'Perkelahian, Intimidasi & Perundungan Siber',
    detail: 'Kekerasan fisik, ancaman, pengucilan, atau perundungan daring terhadap warga sekolah.',
    points: 50,
    procedure:
      'Investigasi tim penanganan kasus, konseling korban & pelaku, skorsing 7 hari, dan pendampingan psikolog.',
    authority: 'Kepala Sekolah',
    legalBasis: 'Permendikbudristek No. 46/2023',
    isActive: true,
  },
  {
    id: 'tatib-11',
    code: 'PASAL-29',
    title: 'Merusak Fasilitas Laboratorium & Sarana Sekolah',
    detail:
      'Mengakibatkan kerusakan dinding, meja, komputer, proyektor, atau peralatan laboratorium.',
    points: 50,
    procedure:
      'Penggantian kerusakan material oleh orang tua, kerja sosial, dan pencatatan pada rapor karakter.',
    authority: 'Wakasek Sarana Prasarana',
    legalBasis: 'Tata Tertib Sekolah Pasal 29',
    isActive: true,
  },
  {
    id: 'tatib-12',
    code: 'PASAL-31',
    title: 'Membawa Senjata Tajam atau Alat Berbahaya',
    detail: 'Membawa senjata tajam, petasan, atau alat lain yang membahayakan warga sekolah.',
    points: 60,
    procedure:
      'Penyitaan barang, pemanggilan orang tua, skorsing, dan pelaporan kepada kepolisian setempat.',
    authority: 'Kepala Sekolah',
    legalBasis: 'UU No. 12/1951 Senjata Tajam',
    isActive: true,
  },
];
