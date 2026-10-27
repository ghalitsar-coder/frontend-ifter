# Fitur & Next-Action Buttons

Dokumen ini adalah daftar semua tombol di frontend yang sebelumnya **tidak punya next-action**
(tanpa modal, tanpa halaman tujuan, tanpa endpoint). Setiap entri mencatat status penanganan
saat ini, bentuk fitur yang seharusnya, konten minimum, dan dependensi backend, supaya
implementasi berikutnya tinggal mengerjakan spesifikasi — bukan mencari ulang.

Status:

- **wired** — sudah disambungkan ke tujuan yang nyata dan sudah ada.
- **disabled** — sudah ada di UI tapi sengaja dinonaktifkan (`disabled` + tooltip
  "Belum tersedia") sampai fiturnya dibangun.
- **decorative** — bagian mockup/preview, tidak pernah dimaksudkan interaktif.
- **removed** — artefak boilerplate, sudah dihapus.

## 1. Tombol yang sudah wired

| # | File | Label | Tujuan sekarang | Catatan next-action sebenarnya |
|---|------|-------|-----------------|--------------------------------|
| 1 | `src/components/landing/HeroSection.tsx` | Jadwalkan Demo Langsung | anchor `#daftar` (CtaSection) | Ke depan: form penjadwalan demo (`POST /demo-requests`) + halaman thank-you. Belum perlu sampai tim sales memakai kalender sendiri. |
| 2 | `src/components/landing/CtaSection.tsx` | Hubungi Tim Konsultan Kami | anchor `#daftar` | Sama seperti #1; bisa dipecah menjadi deep-link `?intent=konsultan` saat form demo punya beberapa intent. |
| 3 | `src/components/pendaftaran/PendaftaranSuccessStep.tsx` | Atur Shift & Jam Kerja | `Link /dashboard/pengaturan` | Halaman pengaturan sudah hidup (jam masuk/pulang, geofence). |
| 4 | `src/components/pendaftaran/PendaftaranSuccessStep.tsx` | Buka Wizard Unggah Data | `Link /dashboard/master-siswa` | Membuka halaman master siswa; wizard import nyata adalah `MasterSiswaImportModal` di halaman itu. |
| 5 | `src/components/pendaftaran/PendaftaranDocumentsStep.tsx` | Ganti Berkas | membuka input file yang sama dengan tombol unggah | Murni UX; tidak perlu backend. |

## 2. Tombol disabled — halaman statis & legal

| # | File | Label | Bentuk fitur | Konten minimum | Dependensi backend |
|---|------|-------|--------------|----------------|--------------------|
| 6 | `src/components/presensi/AttendlyShell.tsx` (footer) | Bantuan | **Halaman statis** `/help` (route group publik baru, Server Component) | Daftar FAQ singkat 8–12 butir, alur 3 langkah pakai (dari `WorkflowSection`), tautan WhatsApp/email kontak, pencarian teks sederhana | Tidak ada — copy saja; opsi: ambil FAQ dari tabel `help_articles` bila perlu CMS |
| 7 | `src/components/presensi/AttendlyShell.tsx` (footer) | Privasi | **Halaman statis** `/privacy` | Poin-poin: data siswa yang disimpan, dasar hukum UU PDP, retensi, hak orang tua (Portal Orang Tua), kontak DPO | Tidak ada |
| 8 | `src/components/presensi/AttendlyShell.tsx` (footer) | Ketentuan | **Halaman statis** `/terms` | Syarat layanan, masa uji coba 30 hari, batas penggunaan, penangguhan akun | Tidak ada |
| 9 | `src/app/[locale]/layout.tsx` | DemoBadge | **removed** | Artefak boilerplate Next.js Boilerplate Plus — sudah dihapus dari layout dan filanya dibuang | — |

## 3. Tombol disabled — pratinjau & berkas

| # | File | Label | Bentuk fitur | Konten minimum | Dependensi backend |
|---|------|-------|--------------|----------------|--------------------|
| 10 | `src/components/izin-dispensasi/DispensationLetterModal.tsx` | Lihat berkas (ikon eye) | **Modal viewer** reuse pola `AttendanceDocumentModal` | Judu; isi: `<img>` untuk gambar / `<iframe>` untuk PDF dari URL berkas; tombol unduh + tutup | Kontrak `GET /files/:id` (atau URL presigned) yang mengembalikan berkas upload; field `file_url`/`file_id` perlu ada di payload surat dispensasi |
| 11 | `src/components/izin-dispensasi/AttendanceStatementModal.tsx` | Lihat berkas (ikon eye) | Modal viewer yang sama dengan #10 | Satu komponen `FilePreviewModal` dipakai bersama | sama dengan #10 |
| 12 | `src/components/izin-dispensasi/MedicalCertificateModal.tsx` | Lihat berkas (ikon eye) | Modal viewer yang sama dengan #10 | sama | sama dengan #10 |
| 13 | `src/components/pendaftaran/PendaftaranDocumentsStep.tsx` | Lihat Pratinjau | Modal viewer (sama dengan #10) atas berkas yang baru diunggah wizard | thumbnail + tombol buka penuh | Wizard pendaftaran perlu menyimpan `document_url` per berkas di state/`GET /registrations/:id/documents` |

## 4. Tombol disabled — dukungan & notifikasi

| # | File | Label | Bentuk fitur | Konten minimum | Dependensi backend |
|---|------|-------|--------------|----------------|--------------------|
| 14 | `src/components/pendaftaran/PendaftaranOtpStep.tsx` | Hubungi Helpdesk | **Halaman `/help`** (entri #6) dengan anchor kontak, atau deep-link WhatsApp nomor resmi | Kanal nyata (bukan nomor fiktif), jam operasional, SLA respon | Tidak ada (konten statis) — tapi butuh nomor resmi dari bisnis |
| 15 | `src/components/pendaftaran/PendaftaranDocumentsStep.tsx` | Bantuan / support | sama dengan #14 | sama | sama |
| 16 | `src/components/pendaftaran/PendaftaranSuccessStep.tsx` | Chat WhatsApp Tim Kami (`wa.me/62812…`) | Ganti nomor fiktif dengan nomor resmi lalu enable link eksternal | Nomor resmi + template pesan "Halo, saya baru mendaftar uji coba {school}" | Tidak ada |
| 17 | `src/components/pendaftaran/PendaftaranSuccessStep.tsx` | Uji Coba Kirim Notifikasi | **Endpoint test-notification** + tombol menjadi aksi async | Toast hasil kirim; contoh payload ke guru PJ; rate-limit 1x/menit | `POST /schools/:id/notification-test` (gateway WA/OTP yang sama dipakai notifikasi presensi) |
| 18 | `src/components/pendaftaran/PendaftaranSuccessStep.tsx` | Panduan Admin (PDF) | **Aset statis** `public/assets/docs/panduan-admin.pdf` + `<a download>` | PDF panduan 10–20 halaman (setup kelas, import, role) | Tidak ada |
| 19 | `src/components/pendaftaran/PendaftaranSuccessStep.tsx` | Kirim Akses (form invite) | **Wizard invite staf** — kembangkan dari `ParentAccountCreateModal` yang sudah ada | Input email + role dropdown (guru/staf/tu), kirim invitation, daftar undangan pending + resend | `POST /users` (role staff) atau `POST /invitations` + token aktivasi; reuse modul akun orang tua |

## 5. Tombol disabled — upload & tab

| # | File | Label | Bentuk fitur | Konten minimum | Dependensi backend |
|---|------|-------|--------------|----------------|--------------------|
| 20 | `src/components/master-siswa/MasterSiswaAddModal.tsx` | Unggah Foto | **File input + preview** dalam form tambah siswa; hasil URL ikut terkirim di payload simpan | crop/preview, batas ukuran (mis. 2 MB), format jpg/png | `PUT /students/:id/photo` multipart (pola `apiUpload` yang sudah ada untuk import Excel) |
| 21 | `src/components/master-guru/TeacherJournalPanel.tsx` | Unggah bukti | Upload multi-berkas per entri jurnal + daftar bukti dengan unduh/hapus | progress upload, tipe berkas dibatasi, max N berkas | endpoint jurnal perlu kolom `attachments[]`; `POST /journal-entries/:id/attachments` |
| 22 | `src/components/izin-dispensasi/DispensationCategoryCard.tsx` | Tab kategori kedua (belum aktif) | Mengaktifkan filter kategori dispensasi ekstra (mis. "Keperluan Dinas") | hanya tinggal mengarahkan `category` ke query queue | Tidak ada — backend sudah menerima parameter kategori |

## 6. Dekoratif (sengaja tidak dibuat interaktif)

| # | File | Unsur | Perlakuan |
|---|------|-------|-----------|
| 23 | `src/components/landing/HeroSection.tsx` | Tombol "Tandai Semua Hadir" di kartu mock presensi | `aria-hidden` + `tabIndex={-1}` — bagian screenshot mockup, bukan UI nyata |
| 24 | `src/components/kedisiplinan/DisciplineSidebar.tsx` | Ikon aksi dengan `onClick` mock | tetap — sudah terdokumentasi lewat komentar `shortcut:` di file; nanti disambungkan ke dialog kedisiplinan yang sudah ada (`DisciplineRecordModal`) |

## Urutan implementasi yang disarankan

1. **Halaman Bantuan/Privasi/Ketentuan** (#6–8) — tanpa backend, menutup 3 footer link,
   sekaligus menjadi tujuan helpdesk (#14–15).
2. **`FilePreviewModal` bersama** (#10–13) — satu komponen membuka 4 tombol pratinjau;
   butuh kontrak berkas `GET /files/:id` dari backend.
3. **Invite staf** (#19) — paling tinggi nilainya untuk onboarding sekolah; pola UI sudah ada.
4. **Upload foto siswa & bukti jurnal** (#20–21) — sama-sama multipart, kerjakan berurutan.
5. **Sisanya** mengikuti kesiapan backend/aset (nomor WA resmi, PDF panduan, endpoint test notif).
