# Team & Personal Feature Branching Workflow Guide

Dokumen ini adalah panduan standar alur kerja (*workflow*) Git dan branching untuk pengembang **ghal** (`ghalitsar`) serta panduan bagi **AI Assistant** (Antigravity, Claude Code, Cursor, dll.) dalam mengembangkan fitur di repositori **Frontend** (`frontend-ifter`) maupun **Backend**.

---

## 1. Latar Belakang & Tujuan
- Proyek ini dikerjakan secara kolaboratif oleh tim.
- Pengembang **ghal** ingin bereksperimen, membangun versi rancangan khusus, atau menyelesaikan fitur prioritas sesuai preferensi terlebih dahulu tanpa mengganggu kestabilan branch tim (`main` / `dev`).
- Branch khusus dengan prefiks `ghal/` menjamin isolasi penuh dari branch utama tim, sekaligus menjaga riwayat commit tetap rapi dan siap di-*merge* via Pull Request (PR) kapan pun dibutuhkan.

---

## 2. Aturan Branching (Wajib Dipatuhi AI & Developer)

Setiap pembuatan fitur, perbaikan bug, atau implementasi baru yang diinisiasi oleh user **ghal** **HARUS** dibuat dalam branch baru dengan format berikut:

### Format Penamaan Branch
```
ghal/<type>-<nama-fitur>
```
atau
```
ghal/<nama-fitur>
```

### Prefix & Contoh Penamaan
| Tipe Tugas | Contoh Branch Frontend | Contoh Branch Backend |
| :--- | :--- | :--- |
| **Fitur Baru** | `ghal/feat-presensi-kelas` | `ghal/feat-presensi-api` |
| **Modul Khusus** | `ghal/feat-kedisiplinan-siswa` | `ghal/feat-student-points` |
| **Perbaikan Bug** | `ghal/fix-auth-redirect` | `ghal/fix-jwt-middleware` |
| **Refactoring** | `ghal/refactor-ui-components` | `ghal/refactor-attendance-service` |
| **Eksperimen / UI** | `ghal/ui-stitch-redesign` | `ghal/poc-websockets` |

> ⚠️ **Aturan Isolasi AI**: AI **DILARANG** melakukan commit langsung ke branch `main` atau `dev` tim saat mengerjakan fitur baru, kecuali jika user secara eksplisit meminta push ke `main`.

---

## 3. Aturan Pesan Commit (Conventional Commits)

Struktur commit **TETAP WAJIB MENGIKUTI STANDAR CONVENTIONAL COMMITS**. Jangan merusak atau mengubah format standar ini:

```
<type>: <deskripsi singkat dalam bentuk present-tense>
```

### Aturan:
1. **Tanpa Scope**: Gunakan `feat: ...`, bukan `feat(ui): ...`.
2. **Huruf Kecil & Sentence Case**: Kalimat ringkas dan spesifik mengenai apa yang diubah.
3. **Jenis Type yang Valid**:
   - `feat:` Fitur atau kemampuan baru untuk pengguna.
   - `fix:` Perbaikan bug / error.
   - `docs:` Perubahan dokumentasi saja.
   - `style:` Format, spasi, linting (tanpa mengubah logika).
   - `refactor:` Perubahan struktur kode tanpa mengubah fungsionalitas.
   - `perf:` Optimasi performa.
   - `test:` Penambahan atau perbaikan unit/e2e test.
   - `chore:` Pembaruan dependensi, konfigurasi build, atau tool internal.

### Contoh Commit yang Benar:
- `feat: implement student attendance journal and export modal`
- `fix: resolve hydration mismatch on discipline record drawer`
- `style: format discipline table with ultracite`
- `test: add unit tests for attendance status calculations`

---

## 4. Alur Kerja Standar (Step-by-Step AI Protocol)

Ketika user meminta pembuatan fitur baru:

### Langkah 1: Sinkronisasi Base Branch
```bash
git checkout main
git pull origin main
```

### Langkah 2: Buat & Pindah ke Branch Fitur Pribadi
```bash
git checkout -b ghal/<nama-fitur>
```

### Langkah 3: Implementasi Kode & Test
- Buat komponen / logic / API sesuai spesifikasi.
- Pastikan TypeScript strict, validasi Zod, dan i18n diterapkan dengan benar.
- Buat unit test (`*.test.ts`) untuk memastikan fungsionalitas valid.

### Langkah 4: Validasi & Quality Gate
Jalankan perintah verifikasi sebelum commit:
- Frontend:
  ```bash
  npm run check:types
  npm run check:i18n
  npx vitest run src/data/
  ```
- Backend:
  ```bash
  # Sesuaikan dengan script test/linter backend (misal: npm test / bun test / cargo test / go test)
  ```

### Langkah 5: Commit Perubahan
```bash
git add -A
git commit -m "feat: <deskripsi perubahan>"
```

### Langkah 6: Push ke Remote
```bash
git push -u origin ghal/<nama-fitur>
```

---

## 5. Koordinasi Frontend & Backend (2 Repositori)

Karena backend dan frontend dipisah ke 2 repositori berbeda:
1. Salin file `WORKFLOW.md` ini ke root repositori backend.
2. Gunakan nama slug fitur yang selaras di kedua repositori:
   - Frontend: `ghal/feat-presensi`
   - Backend: `ghal/feat-presensi`
3. Dengan demikian, ketika ingin menguji integrasi end-to-end, Anda cukup meng-checkout branch `ghal/<fitur>` di kedua folder proyek.
