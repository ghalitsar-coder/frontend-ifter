import { CheckCircle2, MessageSquare, Send, Smartphone, Verified, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { BroadcastTargetType, StudentMatrixRow } from '@/types/rekap';

/**
 * WhatsApp Attendance Broadcast Simulation Modal.
 * @param props - Component properties.
 * @returns Rendered WhatsApp broadcast modal component.
 */
export function RekapWhatsAppBroadcastModal(props: {
  isOpen: boolean;
  className: string;
  period: string;
  students: StudentMatrixRow[];
  selectedStudent: StudentMatrixRow | null;
  onClose: () => void;
  onSendBroadcast: (payload: {
    targetType: BroadcastTargetType;
    count: number;
  }) => void;
  onSendTest: () => void;
}) {
  const t = useTranslations('RekapPage');

  const [targetType, setTargetType] = useState<BroadcastTargetType>('all');
  const [previewStudentId, setPreviewStudentId] = useState<string>(
    props.selectedStudent?.id ?? props.students[0]?.id ?? '',
  );
  const [isSending, setIsSending] = useState(false);

  if (!props.isOpen) {
    return null;
  }

  const criticalStudents = props.students.filter(
    (s) => s.raporStatus === 'critical' || s.raporStatus === 'warning',
  );

  const previewStudent =
    props.students.find((s) => s.id === previewStudentId) ??
    props.students[0] ?? {
      id: 'std-1',
      nis: '0087412948',
      name: 'Rizky Pratama',
      initials: 'RP',
      gender: 'L',
      className: props.className,
      phoneGuardian: '+62 812-4491-0021',
      attendanceByDay: {},
      totalHadir: 18,
      totalTerlambat: 3,
      totalSakit: 1,
      totalIzin: 0,
      totalAlpa: 0,
      percentage: 95.5,
      raporStatus: 'safe',
    };

  const recipientCount =
    targetType === 'all'
      ? props.students.length
      : targetType === 'critical'
        ? criticalStudents.length
        : 1;

  const handleExecuteSend = () => {
    setIsSending(true);
    setTimeout(() => {
      setIsSending(false);
      props.onSendBroadcast({
        targetType,
        count: recipientCount,
      });
      props.onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/60 p-4 backdrop-blur-xs">
      <div
        aria-modal="true"
        className="relative my-auto w-full max-w-[820px] overflow-hidden rounded-3xl bg-surface-card shadow-2xl"
        role="dialog"
      >
        {/* Top Accent Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />

        {/* Modal Header */}
        <div className="flex items-start justify-between gap-4 p-6 pb-4 sm:p-8 sm:pb-4">
          <div className="flex items-start gap-4">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 shadow-xs">
              <MessageSquare className="size-6" />
            </div>
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 font-caption text-xs font-semibold text-emerald-700">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {t('modal_wa_api_badge')}
                </span>
                <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2 py-0.5 font-caption text-xs text-text-muted">
                  <Verified className="size-3 text-pine-deep" />
                  {t('modal_wa_meta_badge')}
                </span>
              </div>
              <h2 className="text-lg font-bold tracking-tight text-text-primary sm:text-xl">
                {t('modal_wa_title')}
              </h2>
              <p className="font-caption text-xs leading-relaxed text-text-muted sm:text-sm">
                {t('modal_wa_subtitle', {
                  className: props.className,
                  period: props.period,
                })}
              </p>
            </div>
          </div>

          <button
            aria-label={t('btn_close')}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-canvas-base text-text-muted transition-colors hover:bg-surface-container hover:text-text-primary"
            type="button"
            onClick={() => {
              props.onClose();
            }}
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="max-h-[calc(85vh-140px)] space-y-6 overflow-y-auto px-6 py-2 sm:px-8">
          {/* 1. Recipient Segmentation & Fast Stats */}
          <section className="space-y-3 rounded-2xl bg-canvas-base p-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-text-primary">
                {t('modal_wa_target_title')}
              </span>
              <span className="font-caption text-[11px] text-text-muted">
                {t('modal_wa_target_time')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="flex flex-col justify-between rounded-xl bg-surface-card p-3 shadow-xs">
                <span className="font-caption text-[11px] font-semibold text-text-muted uppercase">
                  {t('modal_wa_stat_total')}
                </span>
                <div className="mt-1">
                  <span className="text-lg font-bold text-text-primary">
                    {props.students.length} Siswa
                  </span>
                  <p className="font-caption text-[11px] text-emerald-600">
                    {t('modal_wa_stat_total_sub', { count: props.students.length })}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl bg-amber-surface p-3 shadow-xs">
                <span className="font-caption text-[11px] font-semibold text-amber-dark uppercase">
                  {t('modal_wa_stat_critical')}
                </span>
                <div className="mt-1">
                  <span className="text-lg font-bold text-amber-dark">
                    {criticalStudents.length} Siswa
                  </span>
                  <p className="font-caption text-[11px] text-text-muted">
                    {t('modal_wa_stat_critical_sub')}
                  </p>
                </div>
              </div>

              <div className="flex flex-col justify-between rounded-xl bg-surface-card p-3 shadow-xs">
                <span className="font-caption text-[11px] font-semibold text-text-muted uppercase">
                  {t('modal_wa_stat_prima')}
                </span>
                <div className="mt-1">
                  <span className="text-lg font-bold text-pine-deep">
                    {props.students.length - criticalStudents.length} Siswa
                  </span>
                  <p className="font-caption text-[11px] text-text-muted">
                    {t('modal_wa_stat_prima_sub')}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Options Radios */}
            <div className="space-y-2 pt-1">
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 shadow-xs transition-colors ${
                  targetType === 'all'
                    ? 'border border-pine-deep/40 bg-pine-light/30'
                    : 'bg-surface-card hover:bg-canvas-base'
                }`}
              >
                <input
                  checked={targetType === 'all'}
                  className="mt-1 size-4 accent-pine-deep"
                  name="broadcast_target"
                  type="radio"
                  onChange={() => {
                    setTargetType('all');
                  }}
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary">
                      {t('modal_wa_opt_all', { className: props.className })}
                    </span>
                    <span className="block font-caption text-[11px] text-text-muted">
                      {t('modal_wa_opt_all_desc')}
                    </span>
                  </div>
                  <span className="rounded-full bg-pine-deep px-2.5 py-0.5 font-caption text-[11px] font-semibold text-on-primary">
                    {props.students.length} Siswa
                  </span>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 shadow-xs transition-colors ${
                  targetType === 'critical'
                    ? 'border border-amber-gold/40 bg-amber-surface'
                    : 'bg-surface-card hover:bg-canvas-base'
                }`}
              >
                <input
                  checked={targetType === 'critical'}
                  className="mt-1 size-4 accent-pine-deep"
                  name="broadcast_target"
                  type="radio"
                  onChange={() => {
                    setTargetType('critical');
                  }}
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary">
                      {t('modal_wa_opt_critical')}
                    </span>
                    <span className="block font-caption text-[11px] text-text-muted">
                      {t('modal_wa_opt_critical_desc')}
                    </span>
                  </div>
                  <span className="rounded-full bg-amber-surface px-2.5 py-0.5 font-caption text-[11px] font-semibold text-amber-dark">
                    {criticalStudents.length} Siswa
                  </span>
                </div>
              </label>

              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 shadow-xs transition-colors ${
                  targetType === 'custom'
                    ? 'border border-border-control bg-canvas-base'
                    : 'bg-surface-card hover:bg-canvas-base'
                }`}
              >
                <input
                  checked={targetType === 'custom'}
                  className="mt-1 size-4 accent-pine-deep"
                  name="broadcast_target"
                  type="radio"
                  onChange={() => {
                    setTargetType('custom');
                  }}
                />
                <div className="flex flex-1 items-center justify-between">
                  <div>
                    <span className="text-xs font-bold text-text-primary">
                      {t('modal_wa_opt_custom')}
                    </span>
                    <span className="block font-caption text-[11px] text-text-muted">
                      {t('modal_wa_opt_custom_desc')}
                    </span>
                  </div>
                  <span className="rounded-full bg-surface-container px-2.5 py-0.5 font-caption text-[11px] font-semibold text-text-muted">
                    1 Siswa
                  </span>
                </div>
              </label>
            </div>
          </section>

          {/* 2. Live Preview WhatsApp Chat Box */}
          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="size-4 text-pine-deep" />
                <span className="text-xs font-bold text-text-primary">
                  {t('modal_wa_preview_title')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-caption text-[11px] text-text-muted">
                  {t('modal_wa_preview_select_label')}
                </span>
                <select
                  aria-label="Student simulation preview selector"
                  className="cursor-pointer rounded-lg bg-surface-card px-2.5 py-1 font-caption text-xs font-semibold text-pine-deep shadow-xs focus:outline-none"
                  value={previewStudent.id}
                  onChange={(e) => {
                    setPreviewStudentId(e.target.value);
                  }}
                >
                  {props.students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.percentage}%)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Chat Bubble Container with WhatsApp Styling */}
            <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-[#E5DDD5]/50 p-4">
              {/* Sender Header */}
              <div className="flex items-center justify-between rounded-xl bg-surface-card/90 px-3 py-2 shadow-xs backdrop-blur-xs">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-7 items-center justify-center rounded-full bg-pine-deep font-caption text-xs font-bold text-on-primary">
                    SMP
                  </div>
                  <div>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-text-primary">
                        SMP Negeri 1 Harapan Bangsa
                      </span>
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    </div>
                    <span className="font-caption text-[10px] text-text-muted">
                      Official Business Account • {previewStudent.phoneGuardian}
                    </span>
                  </div>
                </div>
                <span className="font-caption text-[10px] text-text-muted">
                  Hari ini 09:41
                </span>
              </div>

              {/* Message Bubble */}
              <div className="max-w-[580px] rounded-2xl rounded-tl-xs bg-surface-card p-4 shadow-sm">
                <div className="-mx-4 -mt-4 mb-3 flex items-center gap-2 rounded-t-2xl bg-pine-light/60 px-4 py-2 text-xs font-bold tracking-wide text-pine-deep uppercase">
                  <span>📢</span>
                  <span>
                    LAPORAN PRESENSI BULANAN — SMP NEGERI 1 HARAPAN BANGSA
                  </span>
                </div>

                <div className="space-y-2 font-mono text-[11px] leading-relaxed text-text-primary">
                  <p>
                    <strong>Periode:</strong> {props.period} (Semester Ganjil)
                  </p>
                  <p>
                    Yth. Bapak/Ibu Wali Murid dari:
                    <br />
                    <strong>Nama:</strong> {previewStudent.name} (NIS:{' '}
                    {previewStudent.nis})
                    <br />
                    <strong>Kelas:</strong> {props.className}
                  </p>

                  <div className="rounded-lg bg-canvas-base p-2.5">
                    <p className="font-bold text-pine-deep">
                      Ringkasan Kehadiran Bulan Ini:
                    </p>
                    <p>✅ Hadir: {previewStudent.totalHadir} Hari</p>
                    <p>⏰ Terlambat: {previewStudent.totalTerlambat} Hari</p>
                    <p>🏥 Sakit: {previewStudent.totalSakit} Hari</p>
                    <p>📋 Izin: {previewStudent.totalIzin} Hari</p>
                    <p>❌ Alpa: {previewStudent.totalAlpa} Hari</p>
                    <p className="mt-1 font-bold">
                      Persentase: {previewStudent.percentage}% (
                      {previewStudent.raporStatus === 'safe'
                        ? 'Aman / Memuaskan'
                        : previewStudent.raporStatus === 'warning'
                          ? 'Perhatian / Perlu Konfirmasi'
                          : 'Kritis / Panggilan Wali Murid'}
                      )
                    </p>
                  </div>

                  <p className="text-[10px] text-text-muted">
                    Tautan Rekap Digital:{' '}
                    <span className="text-pine-deep underline">
                      https://attendly.sch.id/rekap/oct26/{previewStudent.nis}
                    </span>
                  </p>
                  <p className="pt-1 text-[10px] text-text-muted">
                    Wali Kelas: Bambang Sutopo, S.Pd.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Modal Footer Controls */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border-subtle bg-canvas-base px-6 py-4 sm:flex-row sm:px-8">
          <button
            className="text-xs font-semibold text-pine-deep transition-colors hover:text-pine-hover hover:underline"
            type="button"
            onClick={() => {
              props.onSendTest();
            }}
          >
            {t('modal_wa_btn_test_send')}
          </button>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <button
              className="rounded-xl bg-surface-card px-4 py-2.5 text-xs font-medium text-text-muted transition-colors hover:bg-surface-container"
              type="button"
              onClick={() => {
                props.onClose();
              }}
            >
              {t('btn_close')}
            </button>

            <button
              disabled={isSending}
              className="flex items-center gap-2 rounded-xl bg-pine-deep px-5 py-2.5 text-xs font-bold text-on-primary shadow-sm transition-all hover:bg-pine-hover active:scale-95 disabled:opacity-50"
              type="button"
              onClick={handleExecuteSend}
            >
              <Send className="size-4 text-amber-gold" />
              <span>
                {isSending
                  ? t('modal_wa_sending')
                  : t('modal_wa_btn_send_broadcast', { count: recipientCount })}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
