import {
  CheckCircle2,
  CreditCard,
  GraduationCap,
  Shield,
  UserCheck,
  UserPlus,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { AccessLevel, EmploymentStatus, TeacherProfile } from '@/types/masterGuru';

/**
 * Modal form for registering a new teacher or academic staff (PTK) record.
 *
 * @param props - Component properties.
 * @returns Modal JSX element or null.
 */
export function MasterGuruAddModal(props: {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (teacher: Omit<TeacherProfile, 'id'>) => void;
  availableClasses: string[];
}) {
  const t = useTranslations('MasterGuruPage');

  // Form states
  const [name, setName] = useState('');
  const [nip, setNip] = useState('');
  const [nuptk, setNuptk] = useState('');
  const [nik, setNik] = useState('');
  const [gender, setGender] = useState<'L' | 'P'>('L');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');

  const [employmentStatus, setEmploymentStatus] = useState<EmploymentStatus>('PNS');
  const [subject, setSubject] = useState('');
  const [teachingHours, setTeachingHours] = useState(24);

  const [isHomeroom, setIsHomeroom] = useState(false);
  const [selectedClass, setSelectedClass] = useState(props.availableClasses[0] || 'Kelas VII A');
  const [isPicket, setIsPicket] = useState(false);
  const [picketDay, setPicketDay] = useState<'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu'>('Senin');
  const [accessLevel, setAccessLevel] = useState<AccessLevel>('teacher');

  const [rfidUid, setRfidUid] = useState('');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  if (!props.isOpen) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim() || !subject.trim()) {
      return;
    }

    const roles: string[] = [];
    if (isHomeroom) roles.push('Wali Kelas');
    if (isPicket) roles.push('Guru Piket');
    if (accessLevel === 'admin') roles.push('Administrator');
    if (roles.length === 0) roles.push('Guru Pengampu');

    const teacherData: Omit<TeacherProfile, 'id'> = {
      name: name.trim(),
      nip: nip.trim() || '19850101 201001 1 001',
      nuptk: nuptk.trim() || undefined,
      nik: nik.trim() || undefined,
      gender,
      email: email.trim(),
      phone: phone.trim(),
      employmentStatus,
      subject: subject.trim(),
      teachingHoursPerWeek: Number(teachingHours) || 24,
      roles,
      homeroomClass: isHomeroom
        ? {
            className: selectedClass,
            studentCount: 32,
          }
        : undefined,
      picketDuty: isPicket
        ? {
            day: picketDay,
            postName: 'Pos 01 Gerbang Utama',
            postLocation: 'Gerbang Utama',
            isCheckedIn: false,
          }
        : undefined,
      accessLevel,
      status: 'active',
      rfidUid: rfidUid.trim() || undefined,
    };

    props.onSubmit(teacherData);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-guru-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto"
    >
      <div className="relative w-full max-w-3xl rounded-2xl bg-surface-card border border-border-control shadow-2xl overflow-hidden my-6">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4.5 bg-pine-deep text-white">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
              <UserPlus className="size-5" />
            </div>
            <div>
              <h2 id="modal-add-guru-title" className="text-base sm:text-lg font-bold">
                {t('add_guru_modal_title')}
              </h2>
              <p className="text-xs text-emerald-100">
                {t('add_guru_modal_subtitle')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label={t('btn_close')}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          {/* Section 1: Identitas Personal & NIP */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
              <span className="size-6 rounded-full bg-pine-deep text-white text-xs font-bold flex items-center justify-center">
                1
              </span>
              <h3 className="text-sm font-bold text-pine-deep">
                {t('section_personal_identity')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_full_name_degree_label')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                  }}
                  placeholder="Contoh: Drs. Agus Subagyo, M.Pd."
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_nip_label')}
                </label>
                <input
                  type="text"
                  value={nip}
                  onChange={(e) => {
                    setNip(e.target.value);
                  }}
                  placeholder="19780412 200501 1 003"
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_nuptk_label')}
                </label>
                <input
                  type="text"
                  value={nuptk}
                  onChange={(e) => {
                    setNuptk(e.target.value);
                  }}
                  placeholder="16 digit NUPTK resmi"
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_nik_ktp_label')}
                </label>
                <input
                  type="text"
                  value={nik}
                  onChange={(e) => {
                    setNik(e.target.value);
                  }}
                  placeholder="320101XXXXXXXXXX"
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_gender_label')}
                </label>
                <div className="flex gap-4 h-10 items-center">
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'L'}
                      onChange={() => {
                        setGender('L');
                      }}
                      className="text-pine-deep"
                    />
                    <span>{t('gender_male')}</span>
                  </label>
                  <label className="flex items-center gap-2 text-xs font-medium cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      checked={gender === 'P'}
                      onChange={() => {
                        setGender('P');
                      }}
                      className="text-pine-deep"
                    />
                    <span>{t('gender_female')}</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_email_workspace_label')} *
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  placeholder="nama.guru@sekolah.sch.id"
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_phone_whatsapp_label')} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                  }}
                  placeholder="+62 812-XXXX-XXXX"
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Jabatan & Status Kepegawaian */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
              <span className="size-6 rounded-full bg-pine-deep text-white text-xs font-bold flex items-center justify-center">
                2
              </span>
              <h3 className="text-sm font-bold text-pine-deep">
                {t('section_employment_and_subject')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_employment_status_label')} *
                </label>
                <select
                  value={employmentStatus}
                  onChange={(e) => {
                    setEmploymentStatus(e.target.value as EmploymentStatus);
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                >
                  <option value="PNS">PNS</option>
                  <option value="PPPK">PPPK</option>
                  <option value="Guru Honorer">Guru Honorer</option>
                  <option value="GTY">GTY (Guru Tetap Yayasan)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_main_subject_label')} *
                </label>
                <input
                  type="text"
                  required
                  value={subject}
                  onChange={(e) => {
                    setSubject(e.target.value);
                  }}
                  placeholder="Contoh: Matematika / IPA"
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_teaching_hours_label')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={40}
                  value={teachingHours}
                  onChange={(e) => {
                    setTeachingHours(Number(e.target.value));
                  }}
                  className="w-full h-10 px-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Penugasan Peran & Aksesibilitas */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
              <span className="size-6 rounded-full bg-pine-deep text-white text-xs font-bold flex items-center justify-center">
                3
              </span>
              <h3 className="text-sm font-bold text-pine-deep">
                {t('section_roles_and_access')}
              </h3>
            </div>

            <div className="space-y-3">
              {/* Homeroom Assignment Toggle */}
              <div className="p-3.5 rounded-xl border border-border-control bg-canvas-base flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="homeroom-toggle"
                    checked={isHomeroom}
                    onChange={(e) => {
                      setIsHomeroom(e.target.checked);
                    }}
                    className="mt-1 size-4 rounded-md text-pine-deep cursor-pointer"
                  />
                  <div>
                    <label htmlFor="homeroom-toggle" className="text-xs sm:text-sm font-bold text-pine-deep cursor-pointer">
                      {t('role_homeroom_toggle_title')}
                    </label>
                    <p className="text-[11px] text-text-muted">
                      {t('role_homeroom_toggle_desc')}
                    </p>
                  </div>
                </div>

                {isHomeroom && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-text-muted">
                      {t('label_target_rombel')}:
                    </span>
                    <select
                      value={selectedClass}
                      onChange={(e) => {
                        setSelectedClass(e.target.value);
                      }}
                      className="h-8 px-2.5 rounded-lg border border-border-control bg-white text-xs font-bold text-pine-deep"
                    >
                      {props.availableClasses.map((cls) => (
                        <option key={cls} value={cls}>
                          {cls}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              {/* Picket Duty Toggle */}
              <div className="p-3.5 rounded-xl border border-border-control bg-canvas-base flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="picket-toggle"
                    checked={isPicket}
                    onChange={(e) => {
                      setIsPicket(e.target.checked);
                    }}
                    className="mt-1 size-4 rounded-md text-pine-deep cursor-pointer"
                  />
                  <div>
                    <label htmlFor="picket-toggle" className="text-xs sm:text-sm font-bold text-pine-deep cursor-pointer">
                      {t('role_piket_toggle_title')}
                    </label>
                    <p className="text-[11px] text-text-muted">
                      {t('role_piket_toggle_desc')}
                    </p>
                  </div>
                </div>

                {isPicket && (
                  <div className="flex items-center gap-2 shrink-0">
                    <span className="text-xs font-semibold text-text-muted">
                      {t('label_duty_day')}:
                    </span>
                    <select
                      value={picketDay}
                      onChange={(e) => {
                        setPicketDay(e.target.value as 'Senin' | 'Selasa' | 'Rabu' | 'Kamis' | 'Jumat' | 'Sabtu');
                      }}
                      className="h-8 px-2.5 rounded-lg border border-border-control bg-white text-xs font-bold text-pine-deep"
                    >
                      <option value="Senin">Senin</option>
                      <option value="Selasa">Selasa</option>
                      <option value="Rabu">Rabu</option>
                      <option value="Kamis">Kamis</option>
                      <option value="Jumat">Jumat</option>
                      <option value="Sabtu">Sabtu</option>
                    </select>
                  </div>
                )}
              </div>

              {/* Access Level Selector */}
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-2">
                  {t('label_access_level_title')}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setAccessLevel('teacher');
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      accessLevel === 'teacher'
                        ? 'border-pine-deep bg-pine-light ring-2 ring-pine-deep/10'
                        : 'border-border-control bg-canvas-base hover:bg-slate-100'
                    }`}
                  >
                    <UserCheck className="size-4 text-pine-deep mb-1" />
                    <span className="block text-xs font-bold text-pine-deep">
                      {t('access_level_teacher')}
                    </span>
                    <span className="block text-[10px] text-text-muted">
                      {t('access_level_teacher_desc')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccessLevel('homeroom');
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      accessLevel === 'homeroom'
                        ? 'border-pine-deep bg-pine-light ring-2 ring-pine-deep/10'
                        : 'border-border-control bg-canvas-base hover:bg-slate-100'
                    }`}
                  >
                    <GraduationCap className="size-4 text-pine-deep mb-1" />
                    <span className="block text-xs font-bold text-pine-deep">
                      {t('access_level_homeroom')}
                    </span>
                    <span className="block text-[10px] text-text-muted">
                      {t('access_level_homeroom_desc')}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAccessLevel('admin');
                    }}
                    className={`p-3 rounded-xl border text-left cursor-pointer transition-all ${
                      accessLevel === 'admin'
                        ? 'border-pine-deep bg-pine-light ring-2 ring-pine-deep/10'
                        : 'border-border-control bg-canvas-base hover:bg-slate-100'
                    }`}
                  >
                    <Shield className="size-4 text-pine-deep mb-1" />
                    <span className="block text-xs font-bold text-pine-deep">
                      {t('access_level_admin')}
                    </span>
                    <span className="block text-[10px] text-text-muted">
                      {t('access_level_admin_desc')}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4: RFID & Kredensial */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 pb-2 border-b border-border-subtle">
              <span className="size-6 rounded-full bg-pine-deep text-white text-xs font-bold flex items-center justify-center">
                4
              </span>
              <h3 className="text-sm font-bold text-pine-deep">
                {t('section_credentials_and_rfid')}
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-text-primary mb-1">
                  {t('field_rfid_card_uid_label')}
                </label>
                <div className="relative">
                  <CreditCard className="size-4 text-text-muted absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={rfidUid}
                    onChange={(e) => {
                      setRfidUid(e.target.value);
                    }}
                    placeholder="Contoh: A4:9F:32:8B"
                    className="w-full h-10 pl-9 pr-3 rounded-xl border border-border-control bg-canvas-base text-xs sm:text-sm font-mono focus:outline-none focus:ring-2 focus:ring-pine-deep/20"
                  />
                </div>
              </div>

              <div className="flex items-center">
                <label className="flex items-start gap-2.5 cursor-pointer mt-4">
                  <input
                    type="checkbox"
                    checked={notifyWhatsApp}
                    onChange={(e) => {
                      setNotifyWhatsApp(e.target.checked);
                    }}
                    className="mt-0.5 size-4 rounded-md text-pine-deep"
                  />
                  <span className="text-xs text-text-muted leading-relaxed">
                    {t('label_notify_whatsapp_credentials')}
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Modal Footer Actions */}
          <div className="pt-4 border-t border-border-subtle flex flex-col-reverse sm:flex-row sm:items-center justify-end gap-3">
            <button
              type="button"
              onClick={props.onClose}
              className="px-4 py-2.5 rounded-xl border border-border-control text-xs sm:text-sm font-semibold text-text-muted hover:bg-slate-100 transition-colors cursor-pointer"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-pine-deep text-white text-xs sm:text-sm font-semibold hover:bg-pine-hover transition-colors cursor-pointer shadow-md"
            >
              <CheckCircle2 className="size-4 text-amber-300" />
              <span>{t('btn_save_teacher_and_account')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
