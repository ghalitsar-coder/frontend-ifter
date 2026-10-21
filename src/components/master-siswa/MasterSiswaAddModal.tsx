import {
  Camera,
  CheckCircle2,
  CreditCard,
  Info,
  PlusCircle,
  ShieldCheck,
  Upload,
  UserPlus,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { GradeLevel, RombelOption, StudentProfile } from '@/types/masterSiswa';

/**
 * Modal dialog for enrolling a new student record into master database with Dapodik validation.
 *
 * @param props - Component properties.
 * @returns Modal element or null.
 */
export function MasterSiswaAddModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (student: Omit<StudentProfile, 'id'>, keepOpen?: boolean) => void;
  availableRombels: RombelOption[];
}) {
  const t = useTranslations('MasterSiswaPage');

  // Form states
  const [nisn, setNisn] = useState('0082910399');
  const [nis, setNis] = useState('262708101');
  const [name, setName] = useState('');
  const [callingName, setCallingName] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [pob, setPob] = useState('Bandung');
  const [dob, setDob] = useState('2012-05-14');
  const [religion, setReligion] = useState('Islam');
  const [grade, setGrade] = useState<GradeLevel>('VII');
  const [targetClassId, setTargetClassId] = useState('VII-A');
  const [absentNumber, setAbsentNumber] = useState(31);
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelation, setGuardianRelation] = useState('Ayah Kandung');
  const [guardianPhone, setGuardianPhone] = useState('81234567890');
  const [guardianAddress, setGuardianAddress] = useState('');
  const [rfidUid, setRfidUid] = useState('7A:B4:90:3E');
  const [isValidatedNisn, setIsValidatedNisn] = useState(false);

  if (!props.isOpen) {
    return null;
  }

  const selectedRombel =
    props.availableRombels.find((r) => r.id === targetClassId) || props.availableRombels[0];

  const handleValidateNisn = () => {
    setIsValidatedNisn(true);
  };

  const handleScanRfid = () => {
    // Generate simulated RFID hex
    const randomHex = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 256)
        .toString(16)
        .padStart(2, '0')
        .toUpperCase(),
    ).join(':');
    setRfidUid(randomHex);
  };

  const handleSubmitInternal = (keepOpen = false) => {
    if (!name.trim()) {
      return;
    }

    const newStudent: Omit<StudentProfile, 'id'> = {
      nis,
      nisn,
      name,
      callingName: callingName || name.split(' ')[0],
      gender,
      pob,
      dob,
      religion,
      grade,
      className: selectedRombel?.name || `${grade} A`,
      absentNumber,
      homeroomTeacher: selectedRombel?.homeroomTeacher || 'Drs. Agus Subagyo',
      semesterAttendanceRate: 100,
      attendanceCategory: 'Hadir Prima',
      disciplinePoints: 0,
      status: 'active',
      rfidUid,
      guardian: {
        name: guardianName || 'Wali Murid',
        relation: guardianRelation,
        phone: guardianPhone ? `+62 ${guardianPhone}` : '+62 812-3456-7890',
        address: guardianAddress || 'Kota Bandung',
      },
      homeroomNotes: 'Siswa baru terdaftar pada tahun ajaran aktif.',
    };

    props.onSubmit(newStudent, keepOpen);

    if (keepOpen) {
      setName('');
      setCallingName('');
      setGuardianName('');
      setGuardianAddress('');
      setAbsentNumber((prev) => prev + 1);
    } else {
      props.onClose();
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/50 p-3 backdrop-blur-sm sm:p-6"
    >
      <div className="bg-surface-card relative flex max-h-[92vh] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-3xl shadow-2xl duration-200 zoom-in-95 fade-in">
        {/* Top architectural gradient accent */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-pine-hover to-amber-gold" />

        {/* Modal Header */}
        <div className="bg-surface-card flex items-start justify-between border-b border-border-control px-6 py-5 sm:px-8">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-pine-light text-pine-deep shadow-xs">
              <UserPlus className="size-6" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2
                  id="modal-add-title"
                  className="text-lg font-bold tracking-tight text-pine-deep sm:text-xl"
                >
                  {t('add_modal_title')}
                </h2>
                <span className="flex items-center gap-1 rounded-full bg-amber-surface px-2.5 py-0.5 text-xs font-semibold text-amber-dark">
                  <span className="size-1.5 animate-pulse rounded-full bg-amber-gold" />
                  {t('add_modal_badge_manual')}
                </span>
              </div>
              <p className="text-text-muted mt-0.5 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm">
                <span>{t('add_modal_academic_year')}</span>
                <span>•</span>
                <span className="inline-flex items-center gap-1 font-medium text-pine-deep">
                  <ShieldCheck className="size-3.5 text-emerald-700" />
                  {t('add_modal_dapodik_verified')}
                </span>
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            aria-label={t('btn_close')}
            className="hover:bg-surface-container text-text-muted hover:text-text-primary flex size-9 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low transition-colors"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Modal Body: Scrollable Form */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmitInternal(false);
          }}
          className="bg-canvas-base flex-1 space-y-6 overflow-y-auto px-6 py-6 sm:px-8"
        >
          {/* SECTION 1: Identitas Pokok & Dapodik */}
          <div className="bg-surface-card space-y-4 rounded-2xl border border-border-control p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-subtle pb-1">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-lg bg-pine-deep text-xs font-bold text-white">
                  1
                </span>
                <h3 className="text-sm font-bold text-pine-deep sm:text-base">
                  {t('add_section_1_title')}
                </h3>
              </div>
              <span className="text-text-muted text-[11px] font-semibold tracking-wider uppercase">
                {t('add_section_1_badge')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {/* NISN */}
              <div className="flex flex-col gap-1.5">
                <label className="text-text-primary flex items-center justify-between text-xs font-semibold">
                  <span>{t('field_nisn_label')} *</span>
                  <span className="text-text-muted text-[10px] font-normal">
                    {t('field_nisn_digits')}
                  </span>
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    maxLength={10}
                    value={nisn}
                    onChange={(e) => {
                      setNisn(e.target.value);
                    }}
                    placeholder="0082910399"
                    className="h-10 flex-1 rounded-xl border border-border-control bg-surface-container-low px-3 font-mono text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                  />
                  <button
                    type="button"
                    onClick={handleValidateNisn}
                    className={`flex h-10 shrink-0 cursor-pointer items-center gap-1.5 rounded-xl px-3 text-xs font-semibold transition-colors ${
                      isValidatedNisn
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-pine-light text-pine-deep hover:bg-pine-deep/10'
                    }`}
                  >
                    <ShieldCheck className="size-3.5" />
                    <span>{isValidatedNisn ? t('btn_validated') : t('btn_validate_nisn')}</span>
                  </button>
                </div>
              </div>

              {/* NIS Lokal */}
              <div className="flex flex-col gap-1.5">
                <label className="text-text-primary flex items-center justify-between text-xs font-semibold">
                  <span>{t('field_nis_label')} *</span>
                  <span className="rounded bg-pine-light px-1.5 py-0.5 text-[10px] font-semibold text-pine-deep">
                    {t('field_nis_auto')}
                  </span>
                </label>
                <input
                  type="text"
                  value={nis}
                  onChange={(e) => {
                    setNis(e.target.value);
                  }}
                  className="h-10 rounded-xl border border-border-control bg-surface-container-low px-3 font-mono text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>

              {/* Nama Lengkap */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_full_name_label')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  placeholder="Contoh: Muhammad Rayhan Pratama"
                  className="h-10 rounded-xl border border-border-control bg-surface-container-low px-3 text-xs uppercase focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>

              {/* Nama Panggilan */}
              <div className="flex flex-col gap-1.5">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_calling_name_label')}
                </label>
                <input
                  type="text"
                  value={callingName}
                  onChange={(e) => {
                    setCallingName(e.target.value);
                  }}
                  placeholder="Contoh: Rayhan"
                  className="h-10 rounded-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>

              {/* Jenis Kelamin */}
              <div className="flex flex-col gap-1.5">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_gender_label')} *
                </label>
                <div className="grid h-10 grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setGender('L');
                    }}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      gender === 'L'
                        ? 'bg-pine-deep text-white shadow-xs'
                        : 'text-text-muted hover:bg-surface-container bg-surface-container-low'
                    }`}
                  >
                    <span>Laki-laki</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setGender('P');
                    }}
                    className={`flex cursor-pointer items-center justify-center gap-1.5 rounded-xl text-xs font-semibold transition-colors ${
                      gender === 'P'
                        ? 'bg-pine-deep text-white shadow-xs'
                        : 'text-text-muted hover:bg-surface-container bg-surface-container-low'
                    }`}
                  >
                    <span>Perempuan</span>
                  </button>
                </div>
              </div>

              {/* Tempat & Tanggal Lahir */}
              <div className="flex flex-col gap-1.5">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_pob_label')} *
                </label>
                <input
                  type="text"
                  value={pob}
                  onChange={(e) => {
                    setPob(e.target.value);
                  }}
                  placeholder="Contoh: Bandung"
                  className="h-10 rounded-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_dob_label')} *
                </label>
                <input
                  type="date"
                  value={dob}
                  onChange={(e) => {
                    setDob(e.target.value);
                  }}
                  className="h-10 rounded-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>

              {/* Agama */}
              <div className="flex flex-col gap-1.5 sm:col-span-2">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_religion_label')} *
                </label>
                <select
                  value={religion}
                  onChange={(e) => {
                    setReligion(e.target.value);
                  }}
                  className="h-10 cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                >
                  <option value="Islam">Islam</option>
                  <option value="Kristen Protestan">Kristen Protestan</option>
                  <option value="Katolik">Katolik</option>
                  <option value="Hindu">Hindu</option>
                  <option value="Buddha">Buddha</option>
                  <option value="Konghucu">Konghucu</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 2: Penempatan Rombongan Belajar (Rombel) */}
          <div className="bg-surface-card space-y-4 rounded-2xl border border-border-control p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-subtle pb-1">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-lg bg-pine-deep text-xs font-bold text-white">
                  2
                </span>
                <h3 className="text-sm font-bold text-pine-deep sm:text-base">
                  {t('add_section_2_title')}
                </h3>
              </div>
              <span className="rounded-full bg-amber-surface px-2 py-0.5 text-[11px] font-semibold text-amber-dark">
                {t('add_section_2_badge')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="flex flex-col gap-1.5 sm:col-span-3">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_grade_label')} *
                </label>
                <select
                  value={grade}
                  onChange={(e) => {
                    setGrade(e.target.value as GradeLevel);
                  }}
                  className="h-10 cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                >
                  <option value="VII">Kelas VII (Tujuh)</option>
                  <option value="VIII">Kelas VIII (Delapan)</option>
                  <option value="IX">Kelas IX (Sembilan)</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-6">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_target_class_label')} *
                </label>
                <select
                  value={targetClassId}
                  onChange={(e) => {
                    setTargetClassId(e.target.value);
                  }}
                  className="h-10 cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                >
                  {props.availableRombels
                    .filter((r) => r.grade === grade)
                    .map((rombel) => (
                      <option key={rombel.id} value={rombel.id}>
                        {rombel.name} — {rombel.homeroomTeacher} (Sisa Kuota:{' '}
                        {rombel.capacity - rombel.currentCount} Siswa)
                      </option>
                    ))}
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-3">
                <label className="text-text-primary flex items-center justify-between text-xs font-semibold">
                  <span>{t('field_absent_num_label')}</span>
                  <span className="text-text-muted text-[10px]">Auto</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={absentNumber}
                  onChange={(e) => {
                    setAbsentNumber(Number(e.target.value));
                  }}
                  className="h-10 rounded-xl border border-border-control bg-surface-container-low px-3 text-xs font-semibold focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: Data Kontak & Wali Murid */}
          <div className="bg-surface-card space-y-4 rounded-2xl border border-border-control p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-subtle pb-1">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-lg bg-pine-deep text-xs font-bold text-white">
                  3
                </span>
                <h3 className="text-sm font-bold text-pine-deep sm:text-base">
                  {t('add_section_3_title')}
                </h3>
              </div>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold text-emerald-800">
                {t('add_section_3_badge')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              <div className="flex flex-col gap-1.5 sm:col-span-8">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_guardian_name_label')} *
                </label>
                <input
                  type="text"
                  value={guardianName}
                  onChange={(e) => {
                    setGuardianName(e.target.value);
                  }}
                  placeholder="Contoh: Hendra Pratama, S.E."
                  className="h-10 rounded-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-4">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_guardian_relation_label')} *
                </label>
                <select
                  value={guardianRelation}
                  onChange={(e) => {
                    setGuardianRelation(e.target.value);
                  }}
                  className="h-10 cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                >
                  <option value="Ayah Kandung">Ayah Kandung</option>
                  <option value="Ibu Kandung">Ibu Kandung</option>
                  <option value="Wali / Kerabat">Wali Resmi Lainnya</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-12">
                <label className="text-text-primary flex items-center justify-between text-xs font-semibold">
                  <span>{t('field_guardian_phone_label')} *</span>
                  <span className="text-text-muted text-[10px]">
                    {t('field_guardian_phone_hint')}
                  </span>
                </label>
                <div className="flex">
                  <div className="text-text-muted flex h-10 items-center gap-1 rounded-l-xl border border-r-0 border-border-control bg-surface-container-high px-3.5 text-xs font-bold">
                    <span>🇮🇩</span>
                    <span>+62</span>
                  </div>
                  <input
                    type="tel"
                    value={guardianPhone}
                    onChange={(e) => {
                      setGuardianPhone(e.target.value);
                    }}
                    placeholder="812-3456-7890"
                    className="h-10 flex-1 rounded-r-xl border border-border-control bg-surface-container-low px-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5 sm:col-span-12">
                <label className="text-text-primary text-xs font-semibold">
                  {t('field_guardian_address_label')} *
                </label>
                <textarea
                  rows={2}
                  value={guardianAddress}
                  onChange={(e) => {
                    setGuardianAddress(e.target.value);
                  }}
                  placeholder="Jl. Anggrek No. 14, RT 03 / RW 05, Cisaranten, Kota Bandung"
                  className="resize-none rounded-xl border border-border-control bg-surface-container-low p-3 text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>
            </div>
          </div>

          {/* SECTION 4: Identifikasi RFID & Pas Foto */}
          <div className="bg-surface-card space-y-4 rounded-2xl border border-border-control p-5 shadow-xs">
            <div className="flex items-center justify-between border-b border-border-subtle pb-1">
              <div className="flex items-center gap-2.5">
                <span className="flex size-6 items-center justify-center rounded-lg bg-pine-deep text-xs font-bold text-white">
                  4
                </span>
                <h3 className="text-sm font-bold text-pine-deep sm:text-base">
                  {t('add_section_4_title')}
                </h3>
              </div>
              <span className="rounded-full bg-pine-light px-2 py-0.5 text-[11px] font-semibold text-pine-deep">
                {t('add_section_4_badge')}
              </span>
            </div>

            <div className="grid grid-cols-1 items-start gap-6 sm:grid-cols-12">
              {/* Photo Box */}
              <div className="flex flex-col items-center rounded-2xl border border-border-control bg-surface-container-low p-4 text-center sm:col-span-4">
                <div className="mb-2 flex size-24 flex-col items-center justify-center rounded-2xl border-2 border-dashed border-pine-deep/20 bg-pine-light text-pine-deep">
                  <Camera className="size-8 text-pine-deep/60" />
                </div>
                <span className="text-text-primary text-xs font-bold">{t('photo_spec_title')}</span>
                <span className="text-text-muted mt-0.5 text-[10px]">{t('photo_spec_desc')}</span>
                <button
                  type="button"
                  className="bg-surface-card hover:bg-surface-container mt-3 flex cursor-pointer items-center gap-1.5 rounded-xl border border-border-control px-3 py-1.5 text-xs font-semibold text-pine-deep transition-colors"
                >
                  <Upload className="size-3.5" />
                  <span>{t('btn_upload_photo')}</span>
                </button>
              </div>

              {/* RFID UID registration */}
              <div className="flex flex-col gap-3 sm:col-span-8">
                <div className="flex flex-col gap-1.5">
                  <label className="text-text-primary flex items-center justify-between text-xs font-semibold">
                    <span>{t('field_rfid_label')}</span>
                    <span className="flex items-center gap-1 text-[10px] font-semibold text-emerald-700">
                      <span className="size-1.5 animate-pulse rounded-full bg-emerald-600" />
                      {t('field_rfid_ready')}
                    </span>
                  </label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <CreditCard className="text-text-muted absolute top-1/2 left-3 size-4 -translate-y-1/2" />
                      <input
                        type="text"
                        value={rfidUid}
                        onChange={(e) => {
                          setRfidUid(e.target.value);
                        }}
                        placeholder="7A:B4:90:3E"
                        className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low pr-3 pl-9 font-mono text-xs uppercase focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={handleScanRfid}
                      className="h-10 shrink-0 cursor-pointer rounded-xl border border-amber-gold/40 bg-amber-surface px-3.5 text-xs font-bold text-amber-dark transition-colors hover:bg-amber-gold/30"
                    >
                      {t('btn_scan_rfid')}
                    </button>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 rounded-xl border border-pine-deep/10 bg-pine-light/60 p-3.5 text-pine-deep">
                  <Info className="mt-0.5 size-4 shrink-0" />
                  <div className="flex flex-col text-xs">
                    <span className="font-bold">{t('rfid_integration_info_title')}</span>
                    <span className="text-text-muted text-[11px] leading-relaxed">
                      {t('rfid_integration_info_desc')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        {/* Modal Footer Actions */}
        <div className="bg-surface-card flex shrink-0 flex-col items-center justify-between gap-3 border-t border-border-control px-6 py-4 sm:flex-row sm:px-8">
          <button
            type="button"
            onClick={props.onClose}
            className="hover:bg-surface-container text-text-muted hover:text-text-primary h-10 w-full cursor-pointer rounded-xl bg-surface-container-low px-4 text-xs font-semibold transition-colors sm:w-auto sm:text-sm"
          >
            {t('btn_cancel')}
          </button>

          <div className="flex w-full flex-col items-center gap-2.5 sm:w-auto sm:flex-row">
            <button
              type="button"
              onClick={() => {
                handleSubmitInternal(true);
              }}
              className="bg-surface-container flex h-10 w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 text-xs font-semibold text-pine-deep transition-colors hover:bg-surface-container-high sm:w-auto sm:text-sm"
            >
              <PlusCircle className="size-4" />
              <span>{t('btn_save_and_add_another')}</span>
            </button>

            <button
              type="button"
              onClick={() => {
                handleSubmitInternal(false);
              }}
              className="flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-5 text-xs font-bold text-white shadow-md transition-colors hover:bg-pine-hover sm:w-auto sm:text-sm"
            >
              <CheckCircle2 className="size-4 text-amber-gold" />
              <span>{t('btn_save_student')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
