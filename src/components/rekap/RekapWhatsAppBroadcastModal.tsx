import { CheckCircle2, MessageSquare, Send, Smartphone, Verified, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { BroadcastTargetType, StudentMatrixRow } from '@/types/rekap';

const raporStatusLabels = {
  safe: 'Aman / Memuaskan',
  warning: 'Perhatian / Perlu Konfirmasi',
  critical: 'Kritis / Panggilan Wali Murid',
} as const;

/**
 * WhatsApp Attendance Broadcast Simulation Modal.
 * @param props - Component properties.
 * @returns Rendered WhatsApp broadcast modal component.
 */
export function RekapWhatsAppBroadcastModal(props: {
  isOpen: boolean;
  className: string;
  homeroomTeacher: string;
  period: string;
  students: StudentMatrixRow[];
  selectedStudent: StudentMatrixRow | null;
  onClose: () => void;
  onSendBroadcast: (payload: { targetType: BroadcastTargetType; count: number }) => void;
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
    props.students.find((s) => s.id === previewStudentId) ?? props.students[0] ?? null;

  const recipientCount = {
    all: props.students.length,
    critical: criticalStudents.length,
    custom: 1,
  }[targetType];

  // shortcut: no backend endpoint, keep mock (WhatsApp sending is simulated client-side)
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
        className="bg-surface-card relative my-auto w-full max-w-[820px] overflow-hidden rounded-3xl shadow-2xl"
        // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay is already scoped by aria-modal
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
                <span className="font-caption inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {t('modal_wa_api_badge')}
                </span>
                <span className="bg-surface-container font-caption text-text-muted inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs">
                  <Verified className="size-3 text-pine-deep" />
                  {t('modal_wa_meta_badge')}
                </span>
              </div>
              <h2 className="text-text-primary text-lg font-bold tracking-tight sm:text-xl">
                {t('modal_wa_title')}
              </h2>
              <p className="font-caption text-text-muted text-xs leading-relaxed sm:text-sm">
                {t('modal_wa_subtitle', {
                  className: props.className,
                  period: props.period,
                })}
              </p>
            </div>
          </div>

          <button
            aria-label={t('btn_close')}
            className="bg-canvas-base text-text-muted hover:bg-surface-container hover:text-text-primary flex size-9 shrink-0 items-center justify-center rounded-xl transition-colors"
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
          <section className="bg-canvas-base space-y-3 rounded-2xl p-4">
            <div className="flex items-center justify-between">
              <span className="text-text-primary text-xs font-bold">
                {t('modal_wa_target_title')}
              </span>
              <span className="font-caption text-text-muted text-[11px]">
                {t('modal_wa_target_time')}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="bg-surface-card flex flex-col justify-between rounded-xl p-3 shadow-xs">
                <span className="font-caption text-text-muted text-[11px] font-semibold uppercase">
                  {t('modal_wa_stat_total')}
                </span>
                <div className="mt-1">
                  <span className="text-text-primary text-lg font-bold">
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
                  <p className="font-caption text-text-muted text-[11px]">
                    {t('modal_wa_stat_critical_sub')}
                  </p>
                </div>
              </div>

              <div className="bg-surface-card flex flex-col justify-between rounded-xl p-3 shadow-xs">
                <span className="font-caption text-text-muted text-[11px] font-semibold uppercase">
                  {t('modal_wa_stat_prima')}
                </span>
                <div className="mt-1">
                  <span className="text-lg font-bold text-pine-deep">
                    {props.students.length - criticalStudents.length} Siswa
                  </span>
                  <p className="font-caption text-text-muted text-[11px]">
                    {t('modal_wa_stat_prima_sub')}
                  </p>
                </div>
              </div>
            </div>

            {/* Target Options Radios */}
            <div className="space-y-2 pt-1">
              {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered from next-intl messages inside the wrapped control group */}
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
                    <span className="text-text-primary text-xs font-bold">
                      {t('modal_wa_opt_all', { className: props.className })}
                    </span>
                    <span className="font-caption text-text-muted block text-[11px]">
                      {t('modal_wa_opt_all_desc')}
                    </span>
                  </div>
                  <span className="font-caption text-on-primary rounded-full bg-pine-deep px-2.5 py-0.5 text-[11px] font-semibold">
                    {props.students.length} Siswa
                  </span>
                </div>
              </label>

              {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered from next-intl messages inside the wrapped control group */}
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
                    <span className="text-text-primary text-xs font-bold">
                      {t('modal_wa_opt_critical')}
                    </span>
                    <span className="font-caption text-text-muted block text-[11px]">
                      {t('modal_wa_opt_critical_desc')}
                    </span>
                  </div>
                  <span className="font-caption rounded-full bg-amber-surface px-2.5 py-0.5 text-[11px] font-semibold text-amber-dark">
                    {criticalStudents.length} Siswa
                  </span>
                </div>
              </label>

              {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered from next-intl messages inside the wrapped control group */}
              <label
                className={`flex cursor-pointer items-start gap-3 rounded-xl p-3 shadow-xs transition-colors ${
                  targetType === 'custom'
                    ? 'bg-canvas-base border border-border-control'
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
                    <span className="text-text-primary text-xs font-bold">
                      {t('modal_wa_opt_custom')}
                    </span>
                    <span className="font-caption text-text-muted block text-[11px]">
                      {t('modal_wa_opt_custom_desc')}
                    </span>
                  </div>
                  <span className="bg-surface-container font-caption text-text-muted rounded-full px-2.5 py-0.5 text-[11px] font-semibold">
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
                <span className="text-text-primary text-xs font-bold">
                  {t('modal_wa_preview_title')}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="font-caption text-text-muted text-[11px]">
                  {t('modal_wa_preview_select_label')}
                </span>
                <select
                  aria-label="Student simulation preview selector"
                  className="bg-surface-card font-caption cursor-pointer rounded-lg px-2.5 py-1 text-xs font-semibold text-pine-deep shadow-xs focus:outline-none"
                  value={previewStudent?.id ?? ''}
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
            {previewStudent === null ? (
              <div className="font-caption text-text-muted rounded-2xl bg-[#E5DDD5]/50 p-6 text-center text-xs">
                Belum ada siswa pada kelas ini untuk ditinjau.
              </div>
            ) : (
              <div className="relative flex flex-col gap-3 overflow-hidden rounded-2xl bg-[#E5DDD5]/50 p-4">
                {/* Sender Header */}
                <div className="bg-surface-card/90 flex items-center justify-between rounded-xl px-3 py-2 shadow-xs backdrop-blur-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="font-caption text-on-primary flex size-7 items-center justify-center rounded-full bg-pine-deep text-xs font-bold">
                      SMP
                    </div>
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-text-primary text-xs font-bold">
                          {/* shortcut: no staff-readable school-profile endpoint, keep mock */}
                          SMP Negeri 1 Harapan Bangsa
                        </span>
                        <CheckCircle2 className="size-3.5 text-emerald-600" />
                      </div>
                      <span className="font-caption text-text-muted text-[10px]">
                        Official Business Account • {previewStudent.phoneGuardian}
                      </span>
                    </div>
                  </div>
                  <span className="font-caption text-text-muted text-[10px]">Hari ini 09:41</span>
                </div>

                {/* Message Bubble */}
                <div className="bg-surface-card max-w-[580px] rounded-2xl rounded-tl-xs p-4 shadow-sm">
                  <div className="-mx-4 -mt-4 mb-3 flex items-center gap-2 rounded-t-2xl bg-pine-light/60 px-4 py-2 text-xs font-bold tracking-wide text-pine-deep uppercase">
                    <span>📢</span>
                    <span>LAPORAN PRESENSI BULANAN — SMP NEGERI 1 HARAPAN BANGSA</span>
                  </div>

                  <div className="text-text-primary space-y-2 font-mono text-[11px] leading-relaxed">
                    <p>
                      <strong>Periode:</strong> {props.period} (Semester Ganjil)
                    </p>
                    <p>
                      Yth. Bapak/Ibu Wali Murid dari:
                      <br />
                      <strong>Nama:</strong> {previewStudent.name} (NIS: {previewStudent.nis})
                      <br />
                      <strong>Kelas:</strong> {props.className}
                    </p>

                    <div className="bg-canvas-base rounded-lg p-2.5">
                      <p className="font-bold text-pine-deep">Ringkasan Kehadiran Bulan Ini:</p>
                      <p>✅ Hadir: {previewStudent.totalHadir} Hari</p>
                      <p>⏰ Terlambat: {previewStudent.totalTerlambat} Hari</p>
                      <p>🏥 Sakit: {previewStudent.totalSakit} Hari</p>
                      <p>📋 Izin: {previewStudent.totalIzin} Hari</p>
                      <p>❌ Alpa: {previewStudent.totalAlpa} Hari</p>
                      <p className="mt-1 font-bold">
                        Persentase: {previewStudent.percentage}% (
                        {raporStatusLabels[previewStudent.raporStatus]})
                      </p>
                    </div>

                    <p className="text-text-muted text-[10px]">
                      Tautan Rekap Digital:{' '}
                      <span className="text-pine-deep underline">
                        https://attendly.sch.id/rekap/oct26/{previewStudent.nis}
                      </span>
                    </p>
                    <p className="text-text-muted pt-1 text-[10px]">
                      Wali Kelas: {props.homeroomTeacher}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-canvas-base flex flex-col items-center justify-between gap-3 border-t border-border-subtle px-6 py-4 sm:flex-row sm:px-8">
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
              className="bg-surface-card text-text-muted hover:bg-surface-container rounded-xl px-4 py-2.5 text-xs font-medium transition-colors"
              type="button"
              onClick={() => {
                props.onClose();
              }}
            >
              {t('btn_close')}
            </button>

            <button
              disabled={isSending}
              className="text-on-primary flex items-center gap-2 rounded-xl bg-pine-deep px-5 py-2.5 text-xs font-bold shadow-sm transition-all hover:bg-pine-hover active:scale-95 disabled:opacity-50"
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
