# PLAN.md — Integrasi Backend ↔ Frontend (Attendly/ISONADE)

> Cara pakai: tiap item yang selesai dikerjakan, ubah status baris tersebut
> (`TODO` → `IN_PROGRESS` → `DONE`, atau `BLOCKED` + catatan kendalanya) dan
> tambahkan tanggal di kolom Catatan. Item baru boleh ditambahkan di bawah.
> Status terakhir diperbarui: 2026-10-25.

## Legenda status

| Status | Arti |
|--------|------|
| DONE | Kode selesai, gate (types/tests/i18n) hijau |
| IN_PROGRESS | Sedang dikerjakan |
| PARTIAL | Ada sebagian, sisanya belum / perlu verifikasi |
| TODO | Belum dikerjakan |
| BLOCKED | Tertunda, butuh keputusan/informasi |

## A. Fitur selesai (terhubung penuh + gate hijau)

| ID | Fitur | Kontrak backend | Status | Catatan |
|----|-------|-----------------|--------|---------|
| A1 | Login backend (pengganti Clerk): sign-in, refresh, logout, profile | `POST /auth/login|refresh|logout`, `GET /auth/me` | DONE | 2026-10-25 |
| A2 | RBAC 6-peran di UI (filter nav shell, gating tombol/halaman) | matriks `roles` wave-2 | DONE | 2026-10-25 |
| A3 | Presensi guru: check-in/out GPS + riwayat | `POST /teacher-presence/check-in|check-out`, `GET /teacher-presence/today|history` | DONE | lint error tersisa → lihat C1 |
| A4 | Izin dispensasi: list, detail, dokumen, queue + verify | `GET /dispensations(/:id|/:id/document)`, `PATCH /dispensations/:id/verify` | DONE | siap |
| A5 | Piket & rotasi: roster, substitusi, rotasi+cancel, seragam, periode tugas | `GET/POST /duty-rotations`, `PATCH /duty-rotations/:id/cancel`, `POST /uniform-reports`, `PUT /duty-assignments/:id/end` | DONE | siap |
| A6 | Koreksi absensi + bukti upload/list/delete | `POST /attendance/records/:id/corrections`, `PUT/GET/DELETE .../corrections/evidence` | DONE | siap |
| A7 | Pengaturan: sanction rules CRUD+status, geofence read/write | `GET/PUT /sanction-rules`, `PUT /geofence` | DONE | siap |
| A8 | Master data siswa/guru: CRUD, pindah kelas, status, employment type, import Excel + confirm, export | `PUT /students/:id(/class|/status)`, `PATCH /teachers/:id/status`, `POST /imports/students|teachers` + confirm | DONE | siap |
| A9 | Portal murid: kehadiran, poin disiplin, dispensasi sendiri + buat permohonan | `GET/POST /my/*` | DONE | 2026-10-25 |
| A10 | #31 Akun login siswa (admin): buat/lihat/cabut, token invite sekali tampil | `POST/GET/DELETE /students/:id/account` | DONE | update `PATCH .../account` belum → B3 |
| A11 | #32 Reset kredensial guru (admin): modal token sekali pakai | `POST /users/:id/credential-reset` | DONE | 2026-10-25 |
| A12 | #33 Halaman aktivasi akun publik `/aktivasi` (prefill `?token=`, password ≥12) | `POST /auth/activate` | DONE | link dari sign-in sudah ada |
| A13 | #34 Viewer audit log (admin): filter, paginasi, payload JSON, nav + en/fr | `GET /audit-logs` | DONE | filter entity `attendance_record` sengaja tidak dipakai (literal belum terkonfirmasi di backend) |
| A14 | #35 Koreksi poin disiplin (admin): form poin + alasan di modal detail | `PATCH /discipline/records/:id/points` | DONE | 2026-10-25 |

## B. PARTIAL / perlu verifikasi

| ID | Item | Status | Catatan |
|----|------|------|---------|
| B1 | Manajemen pengguna via UI: `GET/POST /users`, `PUT /users/:id/roles`, `PATCH /users/:id/status` — akun guru dibuat terselubung lewat master-guru, tapi belum ada halaman kelola user/role | DONE | 2026-10-25 — KEPUTUSAN scope: hanya endpoint + modal yang ada (provision guru/siswa, credential-reset, activate); tanpa halaman kelola user/role terpisah |
| B2 | Tahun ajaran & semester: edit semester (`PUT /terms/:id`) belum jelas punya UI | DONE | 2026-10-25 — KEPUTUSAN scope: HIDDEN; pemakaian read-only sebagai filter (master-siswa/kedisiplinan/rekap), ubah semester cukup lewat API |
| B3 | Update akun siswa (`PATCH /students/:id/account`) tersedia di backend, frontend baru POST/GET/DELETE | DONE | 2026-10-25 — KEPUTUSAN scope: hanya endpoint; ubah akun memakai pola revoke→provision (DELETE+POST), tanpa UI edit |
| B4 | Dashboard/beranda publik masih sebagian data mock | DONE | 2026-10-25 — semua kartu sudah server-data; satu-satunya sisa: jam piket tanpa endpoint log check-in → tetap placeholder "—" (tanpa angka palsu), sampai backend punya endpointnya |

## C. TODO lintas-cutting (gerbang mutu)

| ID | Item | Status | Catatan |
|----|------|--------|---------|
| C1 | Bersihkan 30 error lint repo-wide — semuanya di file wave-2 lama: `presensi-guru.ts/.test` (9), `DispensationQueueCard` (6), `izin-dispensasi.ts/.test` (3), `piket.ts/.test` (3), `SettingsSanctionsPanel` (2), `master-guru.test` (2), `PiketUniformForm`, `PiketRotationModal`, `SettingsGeofencePanel`, `CorrectionHashModal`, `master-siswa.test` (1 each) | DONE | 2026-10-25 — `npm run lint` exit 0 (0 errors + format oxfmt bersih di 10 file); types & 303 tests tetap hijau |
| C2 | `npm run check:i18n` bersih total: hapus/rapikan key `PiketPage.rot_*` yang unused (warning, exit masih 0) | DONE | 2026-10-25 — 58 key `PiketPage.rot_*` + 14 key dead lain (MasterGuru/MasterSiswa/Piket toast, Dashboard sisa Hello.tsx) dihapus dari en/fr; `status_badge_*` dipertahankan dengan membuat pemanggilan `t()` statis; exit 0 tanpa warning unused keys |
| C3 | Review diff wave-2 frontend bersama user, lalu commit + push ke branch `ghal/feat-frontend-ifter` (NEVER main; tanya sebelum `--no-verify`) | DONE | 2026-10-25 — review per fitur disetujui user; 3 commit (`e894cbb` api, `1e6caf8` ui, `a2a4780` PLAN.md), push branch `ghal/feat-frontend-ifter-ghal` lalu fast-forward merge ke `ghal/feat-frontend-ifter`. `--no-verify` dipakai atas izin user karena pre-commit knip sudah merah sejak HEAD (→ C4) |
| C4 | Perbaiki `knip` (pre-commit hook): 58 unused files + unused deps/exports warisan template shadcn — sudah merah sejak sebelum wave-2 | DONE | 2026-10-25 — 58 file template tak terpakai dihapus (ui/* shadcn, Hello, hooks sisa, lib/utils & highlighter), 8 deps dihapus + lockfile disinkron (`npm install`), 8 unused exports ui dipangkas; `knip.config.ts` kini `ignore` glob `src/lib/api/**`, `src/data/**`, `src/types/**` agar API publik wave-2 tidak dituntut hapus; `npm run check:deps` exit 0 |

## D. Backend — sisa wave-2 (repo isonade)

| ID | Item | Status | Catatan |
|----|------|--------|---------|
| D1 | #27 Verifikasi migrasi from-scratch (down-all + up-all) & penomoran | DONE | 2026-10-25 — DB scratch `isonade-mig-scratch` (postgres:16, port 5455): audit 000001–000015 lengkap (pasangan up/down, tanpa gap/duplikat), `down-all → up-all` 2× berturut-turut sukses; tidak ada file yang perlu diperbaiki. Catatan: port 5432 dipakai kontainer proyek lain |
| D2 | #28 Perluasan e2e suite untuk paket wave-2 | DONE | 2026-10-25 — `e2e/tests/api.e2e.ts` diperluas ke grup wave-2 (20/20 pass 2 run beruntun), masuk commit `383f615` |
| D3 | #29 Cek drift `docs/API_ADDENDUM.md` vs realita rute | DONE | 2026-10-25 — addendum divalidasi terhadap register_* internal/transport/http, commit `15c1dde` |

## E. Gate verifikasi (jalankan ulang sebelum commit)

- `npm run check:types` — PASS (2026-10-25)
- `npm test` (vitest) — 33 files / 345 tests PASS (2026-10-25, pohon ter-commit)
- `npm run check:i18n` — exit 0, bersih tanpa warning unused keys (2026-10-25) ✅
- `npm run check:deps` (knip) — exit 0 (2026-10-25) ✅
- `npm run lint` — exit 0, 0 warnings/0 errors, format bersih (2026-10-25) ✅

## F. Roadmap pasca-MVP (keputusan user 2026-10-25: TANPA pengecualian, semua PRD §7 & §11 dikejar)

Urutan kerja: Wave 3 → 4 → 5 → 6. Alasannya: Wave 3 menutup lubang acceptance-criteria MVP (§8) yang jadi prasyarat semua wave berikutnya; Wave 6 (multi-tenant) terakhir karena mengubah skema semua migrasi.

| Wave | ID | Item | Status | Dependensi |
|------|----|------|--------|------------|
| 3 | F1 | FR-C04 UI manajemen kelas (CRUD + arsip + tingkat + wali kelas) | DONE | 2026-10-25 — halaman `/dashboard/kelas` + panel Kelas/Stats/Toolbar/Form/Homeroom/Siswa; tulis digating `master_data`; kapasitas sengaja tidak dipalsukan (tak ada field BE) |
| 3 | F2 | FR-E04 UI aturan absensi: kalender libur, tahun ajaran/semester, hari operasional | DONE | 2026-10-25 — panel Kalender Libur + Tahun Ajaran/Semester di Pengaturan; hari operasional = toggle Senin–Minggu yang menulis satu baris `schedules` per hari terpilih |
| 3 | F3 | FR-A02 UI aktif/nonaktif akun (`PATCH /users/:id/status`) | DONE | 2026-10-25 — badge status akun + modal konfirmasi di master guru (admin saja) |
| 3 | F4 | FR-C03 catatan administratif siswa (skema BE + FE) | DONE | 2026-10-25 — seksi "Catatan Administratif" di detail cepat siswa (admin/staff_tu), cap 2000 karakter |
| 3 | F5 | Bukti lampiran koreksi absensi (FE konsumsi `/corrections/:id/evidence`) | DONE | 2026-10-25 — unggah setelah koreksi tersimpan + daftar/unduh/hapus bukti |
| 3 | F6 | Label tombol export presensi "PDF" → sesuai format asli (XLSX) | PARTIAL | 2026-10-25 — kode selesai di working tree (`AttendanceManager` + `AttendanceToolbar`), belum di-commit: key locale `AttendancePage.download_pdf`/`toast_pdf_generating` harus dihapus dari `en.json`/`fr.json` yang sedang diedit user; commit setelah merge user |
| 4 | F7 | Portal orang tua (`/parent/*`, tautan akun ortu → siswa) | TODO | F3, skema guardian-account |
| 4 | F8 | Absensi per mata pelajaran (JP): skema jadwal + recording + rekap | TODO | migrasi besar |
| 4 | F9 | Notifikasi otomatis web-push (subscription + kirim saat event) | TODO | — |
| 4 | F10 | Manajemen perangkat (registry perangkat RFID/gate) | TODO | — |
| 5 | F11 | Backend RFID tap (ingest tap + stream gate, konsumsi registry F10) | TODO | F10 + perangkat keras |
| 5 | F12 | Integrasi WhatsApp (adapter provider di balik config; kredensial user needed) | TODO | akun Meta/Twilio |
| 6 | F13 | API publik + webhook keluar | TODO | F10 |
| 6 | F14 | Offline attendance (PWA service worker + antrean sync) | TODO | F11 |
| 6 | F15 | Multi-tenant + subscription billing | TODO | terakhir — refactor skema |

Catatan: F7/F9/F14 adalah item yang §7 dulu mengecualikan; karena user memutuskan tanpa pengecualian, §7 PRD secara praktis dianggap usang (revisi dokumen adalah tugas user, bukan agen).
