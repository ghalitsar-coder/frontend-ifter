# Absensi guru

Halaman `/dashboard/absen` menggunakan pemindai QR staf yang sudah ada di staging.
Guru dan admin dapat membuka halaman ini. Navigasi guru menyediakan tautan
"Absensi guru". Rute `/dashboard/scan-qr` tetap tersedia untuk alur staf lama.

Kamera menggunakan kamera belakang jika tersedia dan dihentikan setelah satu
QR terbaca atau ketika halaman ditinggalkan. Alternatifnya, pengguna dapat
mengunggah gambar QR berukuran maksimal 10 MB. Hasil masuk, terlambat, dan pulang
hanya ditampilkan setelah API mengonfirmasi pencatatan. Gambar diproses di browser;
hanya payload QR yang dikirim ke backend.

## Kontrak backend

Frontend meneruskan `POST /api/backend/v1/staff/attendance/scan` ke
`POST /v1/staff/attendance/scan` melalui proxy dan cookie httpOnly `ifter_token`.
Body mengikuti kontrak yang sudah dipakai staging:

```json
{ "payload": "nilai QR bertanda tangan dari petugas" }
```

Respons sukses memuat `data` dengan `staff_id`, `tipe_sesi` (`masuk` atau
`pulang`), `tanggal`, `status` (`hadir`, `terlambat`, atau `pulang`), dan
`waktu_scan`. Backend tetap bertanggung jawab memverifikasi tanda tangan JWT,
sekolah, identitas pegawai, masa berlaku QR, jadwal sesi, dan duplikasi pencatatan.
Frontend menampilkan pesan terjemahan berdasarkan kode error, tanpa menampilkan
pesan mentah backend.

Pemulihan halaman operator menggunakan `GET /v1/staff/qr-sessions/active` pada
backend. Endpoint ini mengembalikan sesi sekolah yang sedang berlangsung, atau
sesi berikutnya yang belum berakhir, dengan `data: null` jika tidak ada sesi.
Halaman mengambil ulang metadata sesi dan QR bertanda tangan setelah refresh,
tanpa membuat sesi baru atau menyimpan gambar QR lama di browser. Sesi yang
ditutup atau melewati jadwal tidak dipulihkan. Perubahan backend pendamping ada
pada branch `ghal/fix-qr-session-refresh` di repo `backend-ifter`.

## Verifikasi lokal

Basis implementasi: `origin/staging` pada commit `72619a9`. Node v24.22.3 dan npm
digunakan, tanpa perubahan dependensi atau file environment yang dilacak Git.

- Smoke test browser dengan backend lokal: login `guru1`, cookie httpOnly
  `ifter_token`, dan `/dashboard/presensi` merespons 200.
- `npm run test`: 75 test unit/UI lulus.
- `npm run check:i18n`: lulus, tanpa key hilang atau undefined.
- `PORT=3000 npm run test:e2e -- tests/e2e/TeacherAttendance.e2e.ts tests/e2e/StaffQrSession.e2e.ts --workers=1`:
  13 skenario lulus. Termasuk gambar QR nyata pada viewport 390px dan 1440px,
  kamera dengan stream uji, QR kedaluwarsa, penolakan kamera, dan gate role.
  Respons scan API dikendalikan test; hasil ini bukan bukti integrasi scan Go.
- Pemulihan sesi database lokal diuji lewat browser dengan tiga refresh:
  sesi yang sama dan QR tetap tampil, tanpa request pembuatan sesi duplikat
  atau error JavaScript. Test unit, integrasi PostgreSQL QR, dan `go vet` backend
  juga lulus.
- Screenshot 390px dan 1440px diperiksa. Alur sukses tidak menghasilkan console
  error atau overflow horizontal.
- Lint bertipe pada seluruh file TypeScript yang diubah dan ditambahkan lulus.

## Status verifikasi proyek

Pada pemeriksaan awal, proses backend lama belum menyediakan endpoint QR.
Proses tersebut sudah diganti dengan backend terbaru; pembuatan dan pemulihan
QR sekarang berhasil lewat API asli. Endpoint pemulihan sesi perlu disertakan
bersama perubahan frontend ketika diintegrasikan ke staging.

Staging juga sudah mengandung kegagalan pemeriksaan sebelum fitur ini dikerjakan:
`npm run check:types` masih melaporkan 11 deklarasi tidak terpakai pada enam file
modul kedisiplinan. `npm run lint` masih gagal pada kode bawaan kedisiplinan,
pendaftaran, presensi, dan komponen UI bersama. Konfigurasi pemeriksaan tetap
dipertahankan. Pemeriksaan global tersebut perlu diperbaiki terpisah; test fitur
dan lint bertipe pada file yang diubah lulus.
