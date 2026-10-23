import {
  ArrowRight,
  Check,
  CheckCircle2,
  FolderSync,
  HelpCircle,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import type { RombelOption, StudentProfile } from '@/types/masterSiswa';

/**
 * Modal dialog executing bulk student class mutations and attendance reconciliation.
 *
 * @param props - Component properties.
 * @returns Modal component or null.
 */
export function MasterSiswaMutationModal(props: {
  isOpen: boolean;
  onClose: () => void;
  selectedStudents: StudentProfile[];
  availableRombels: RombelOption[];
  onConfirmMutation: (params: {
    studentIds: string[];
    targetClassId: string;
    targetClassName: string;
    reason: string;
    skNumber: string;
    notifyWhatsApp: boolean;
  }) => void;
}) {
  const t = useTranslations('MasterSiswaPage');

  const [targetClassId, setTargetClassId] = useState('VIII-B');
  const [reason, setReason] = useState('pemerataan');
  const [skNumber, setSkNumber] = useState('421.3/SK-MUT/2024/09-VIII');
  const [notifyWhatsApp, setNotifyWhatsApp] = useState(true);

  if (!props.isOpen || props.selectedStudents.length === 0) {
    return null;
  }

  const selectedCount = props.selectedStudents.length;
  const sourceClassName = props.selectedStudents[0]?.className || 'VIII A';
  const targetRombel =
    props.availableRombels.find((r) => r.id === targetClassId) || props.availableRombels[1];

  const handleExecute = () => {
    props.onConfirmMutation({
      studentIds: props.selectedStudents.map((s) => s.id),
      targetClassId,
      targetClassName: targetRombel?.name || targetClassId,
      reason,
      skNumber,
      notifyWhatsApp,
    });
    props.onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-mutation-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-pine-deep/60 p-3 backdrop-blur-md sm:p-6"
    >
      <div className="bg-surface-card relative flex max-h-[92vh] w-full max-w-4xl animate-in flex-col overflow-hidden rounded-3xl shadow-2xl duration-200 zoom-in-95 fade-in">
        {/* Top Accent Gradient */}
        <div className="h-1.5 w-full bg-gradient-to-r from-pine-deep via-amber-gold to-pine-deep" />

        {/* Modal Header */}
        <div className="bg-surface-card border-b border-border-control px-6 pt-6 pb-4 sm:px-8">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-1.5">
              <span className="inline-flex items-center gap-1.5 self-start rounded-full bg-amber-surface px-3 py-0.5 text-xs font-semibold text-amber-dark">
                <span className="size-1.5 animate-pulse rounded-full bg-amber-gold" />
                {t('mutation_modal_badge', { count: selectedCount })}
              </span>
              <h2
                id="modal-mutation-title"
                className="text-lg font-bold tracking-tight text-pine-deep sm:text-2xl"
              >
                {t('mutation_modal_title')}
              </h2>
              <p className="text-text-muted max-w-2xl text-xs leading-relaxed sm:text-sm">
                {t('mutation_modal_desc')}
              </p>
            </div>
            <button
              type="button"
              onClick={props.onClose}
              aria-label={t('btn_close')}
              className="hover:bg-surface-container text-text-muted hover:text-text-primary flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-surface-container-low transition-colors"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="bg-canvas-base max-h-[calc(90vh-180px)] space-y-6 overflow-y-auto px-6 py-6 sm:px-8">
          {/* Section 1: Selected Students Review */}
          <section className="space-y-3 rounded-2xl border border-pine-deep/10 bg-pine-light/40 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="flex size-7 items-center justify-center rounded-lg bg-pine-deep text-xs font-bold text-amber-gold">
                  ✓
                </span>
                <h3 className="text-xs font-bold text-pine-deep sm:text-sm">
                  {t('mutation_selected_students_title', { count: selectedCount })}
                </h3>
              </div>
              <span className="bg-surface-card rounded-lg border border-border-control px-2.5 py-1 text-xs font-semibold text-pine-deep">
                {t('mutation_source_rombel_label', { name: sourceClassName })}
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
              {props.selectedStudents.map((std) => (
                <div
                  key={std.id}
                  className="bg-surface-card flex items-center gap-2.5 rounded-xl border border-border-control p-3 shadow-xs"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-pine-deep/10 text-xs font-bold text-pine-deep">
                    {std.name
                      .split(' ')
                      .slice(0, 2)
                      .map((w) => w[0])
                      .join('')}
                  </div>
                  <div className="flex min-w-0 flex-col">
                    <span className="text-text-primary truncate text-xs font-bold sm:text-sm">
                      {std.name}
                    </span>
                    <span className="text-text-muted font-mono text-[11px]">NIS: {std.nis}</span>
                    <span className="text-[10px] font-semibold text-amber-dark">
                      {std.className} • Absen #{std.absentNumber}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Choose Target Class */}
          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="flex size-6 items-center justify-center rounded-full bg-pine-deep text-xs font-bold text-white">
                  1
                </span>
                <h4 className="text-text-primary text-sm font-bold">
                  {t('mutation_step_1_title')}
                </h4>
              </div>
              <span className="text-text-muted text-xs">{t('mutation_step_1_capacity_info')}</span>
            </div>

            {/* Capacity Visualizer */}
            <div className="flex flex-col items-center justify-between gap-4 rounded-2xl border border-border-control bg-surface-container-low p-4 md:flex-row">
              <div className="flex items-center gap-3">
                <div className="bg-surface-card flex items-center gap-2.5 rounded-xl border border-border-control p-2">
                  <span className="text-text-muted flex size-8 items-center justify-center rounded-lg bg-surface-container-high text-xs font-bold">
                    8A
                  </span>
                  <div>
                    <span className="text-text-muted block text-[10px] font-bold uppercase">
                      {t('mutation_source_label')}
                    </span>
                    <span className="text-text-primary text-xs font-bold sm:text-sm">
                      {sourceClassName}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col text-xs">
                  <span className="text-text-muted">{t('mutation_running_capacity')}</span>
                  <div className="flex items-center gap-1 font-bold text-pine-deep">
                    <span>32</span>
                    <ArrowRight className="text-text-muted size-3" />
                    <span>{32 - selectedCount} Siswa</span>
                    <span className="text-[11px] text-amber-700">(-{selectedCount})</span>
                  </div>
                </div>
              </div>

              <div className="text-text-muted bg-surface-card flex items-center gap-1 rounded-xl border border-border-control px-3 py-1.5 text-xs">
                <HelpCircle className="size-3.5 text-amber-dark" />
                <span>{t('mutation_quota_requirement', { count: selectedCount })}</span>
              </div>
            </div>

            {/* Target Class Cards */}
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {props.availableRombels
                .filter((r) => r.grade === 'VIII')
                .map((rombel) => {
                  const remainingQuota = rombel.capacity - rombel.currentCount;
                  const isEnough = remainingQuota >= selectedCount;
                  const isSelected = targetClassId === rombel.id;

                  if (!isEnough) {
                    return (
                      <div
                        key={rombel.id}
                        className="flex cursor-not-allowed flex-col justify-between rounded-2xl border border-border-control bg-surface-container-low p-4 opacity-60"
                      >
                        <div className="mb-2 flex items-start justify-between">
                          <span className="text-text-muted text-xs font-bold">{rombel.name}</span>
                          <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                            Sisa {remainingQuota}
                          </span>
                        </div>
                        <p className="text-text-muted text-[11px]">
                          Wali: {rombel.homeroomTeacher}
                        </p>
                        <div className="mt-3">
                          <div className="bg-surface-container h-1.5 w-full overflow-hidden rounded-full">
                            <div className="h-full w-[96%] bg-rose-500" />
                          </div>
                          <span className="mt-1 block text-right text-[10px] font-semibold text-rose-700">
                            {t('mutation_not_enough_seats')}
                          </span>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <button
                      key={rombel.id}
                      type="button"
                      onClick={() => {
                        setTargetClassId(rombel.id);
                      }}
                      className={`flex cursor-pointer flex-col justify-between rounded-2xl border p-4 text-left transition-all ${
                        isSelected
                          ? 'border-amber-gold bg-amber-surface/70 shadow-xs ring-2 ring-amber-gold'
                          : 'bg-surface-card border-border-control hover:bg-pine-light/30'
                      }`}
                    >
                      <div className="mb-2 flex items-start justify-between">
                        <span className="text-xs font-bold text-pine-deep sm:text-sm">
                          {rombel.name}
                        </span>
                        {isSelected && (
                          <span className="flex size-5 items-center justify-center rounded-full bg-pine-deep text-white">
                            <Check className="size-3" />
                          </span>
                        )}
                      </div>
                      <p className="text-text-muted mb-2 text-[11px]">
                        Wali: {rombel.homeroomTeacher}
                      </p>
                      <div className="mt-auto">
                        <div className="mb-1 flex justify-between text-[11px] font-semibold">
                          <span className="text-text-muted">
                            {rombel.currentCount}/{rombel.capacity}
                          </span>
                          <span className="text-pine-deep">Sisa {remainingQuota} Kuota</span>
                        </div>
                        <div className="bg-surface-container h-1.5 w-full overflow-hidden rounded-full">
                          <div
                            className="h-full rounded-full bg-pine-deep"
                            style={{
                              width: `${(rombel.currentCount / rombel.capacity) * 100}%`,
                            }}
                          />
                        </div>
                      </div>
                    </button>
                  );
                })}
            </div>
          </section>

          {/* Section 3: Reason & SK Number */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-pine-deep text-xs font-bold text-white">
                2
              </span>
              <h4 className="text-text-primary text-sm font-bold">{t('mutation_step_2_title')}</h4>
            </div>

            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
              {[
                {
                  id: 'pemerataan',
                  title: t('mutation_reason_pemerataan_title'),
                  desc: t('mutation_reason_pemerataan_desc'),
                },
                {
                  id: 'bk',
                  title: t('mutation_reason_bk_title'),
                  desc: t('mutation_reason_bk_desc'),
                },
                {
                  id: 'minat_bakat',
                  title: t('mutation_reason_minat_title'),
                  desc: t('mutation_reason_minat_desc'),
                },
                {
                  id: 'ortu',
                  title: t('mutation_reason_ortu_title'),
                  desc: t('mutation_reason_ortu_desc'),
                },
              ].map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setReason(item.id);
                  }}
                  className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-3.5 text-left transition-colors ${
                    reason === item.id
                      ? 'border-amber-gold bg-amber-surface/70 ring-1 ring-amber-gold'
                      : 'bg-surface-card border-border-control hover:bg-pine-light/30'
                  }`}
                >
                  <span
                    className={`mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border ${
                      reason === item.id
                        ? 'border-pine-deep bg-pine-deep'
                        : 'border-border-control bg-white'
                    }`}
                  >
                    {reason === item.id && <span className="size-1.5 rounded-full bg-white" />}
                  </span>
                  <div>
                    <span className="block text-xs font-bold text-pine-deep sm:text-sm">
                      {item.title}
                    </span>
                    <span className="text-text-muted mt-0.5 block text-[11px] leading-relaxed">
                      {item.desc}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {/* SK Number input */}
            <div className="bg-surface-card flex flex-col gap-3 rounded-xl border border-border-control p-3 sm:flex-row sm:items-center">
              <label
                htmlFor="sk-input"
                className="text-text-primary text-xs font-semibold whitespace-nowrap"
              >
                {t('mutation_sk_number_label')}
              </label>
              <input
                id="sk-input"
                type="text"
                value={skNumber}
                onChange={(e) => {
                  setSkNumber(e.target.value);
                }}
                className="h-9 flex-1 rounded-lg border border-border-control bg-surface-container-low px-3 font-mono text-xs focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
                placeholder="421.3/SK-MUT/2024/09-VIII"
              />
            </div>
          </section>

          {/* Section 4: Simulation of new attendance numbers */}
          <section className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-pine-deep text-xs font-bold text-white">
                3
              </span>
              <h4 className="text-text-primary text-sm font-bold">
                {t('mutation_step_3_title', { target: targetRombel?.name || 'VIII B' })}
              </h4>
            </div>

            <div className="bg-surface-card overflow-hidden rounded-2xl border border-border-control shadow-xs">
              <div className="flex items-center bg-pine-light/60 px-4 py-2.5 text-xs font-bold tracking-wider text-pine-deep uppercase">
                <span className="w-24">NIS</span>
                <span className="flex-1">Nama Siswa</span>
                <span className="w-28 text-center">Absen Asal</span>
                <span className="w-8" />
                <span className="w-32 text-center">Absen Baru</span>
                <span className="w-24 text-right">Status Sync</span>
              </div>
              <div className="divide-y divide-border-subtle">
                {props.selectedStudents.map((std, idx) => {
                  const newAbsent = (targetRombel?.currentCount || 29) + idx + 1;
                  return (
                    <div
                      key={std.id}
                      className="flex items-center px-4 py-3 text-xs font-medium sm:text-sm"
                    >
                      <span className="text-text-muted w-24 font-mono text-xs">{std.nis}</span>
                      <span className="text-text-primary flex-1 truncate font-bold">
                        {std.name}
                      </span>
                      <span className="text-text-muted w-28 text-center font-mono text-xs">
                        #{std.absentNumber} ({sourceClassName})
                      </span>
                      <span className="w-8 text-center text-amber-dark">
                        <ArrowRight className="inline size-3.5" />
                      </span>
                      <span className="w-32 text-center">
                        <span className="rounded-full bg-pine-deep px-2.5 py-1 font-mono text-xs font-bold text-white">
                          #{newAbsent} ({targetRombel?.name || 'VIII B'})
                        </span>
                      </span>
                      <span className="w-24 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800">
                          <FolderSync className="size-3 text-emerald-700" />
                          <span>Siap Sync</span>
                        </span>
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Atomic reconciliation callout */}
            <div className="flex items-start gap-3 rounded-2xl bg-pine-deep p-4 text-white shadow-md">
              <ShieldCheck className="mt-0.5 size-5 shrink-0 text-amber-gold" />
              <div className="flex flex-col text-xs">
                <span className="font-bold text-amber-gold">
                  {t('mutation_data_guarantee_title')}
                </span>
                <p className="mt-0.5 leading-relaxed text-pine-light/90">
                  {t('mutation_data_guarantee_desc', {
                    teacher: targetRombel?.homeroomTeacher || 'Wali Kelas Baru',
                    class: targetRombel?.name || 'VIII B',
                  })}
                </p>
              </div>
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="bg-surface-card flex shrink-0 flex-col items-center justify-between gap-3 border-t border-border-control px-6 py-4 sm:flex-row sm:px-8">
          <label className="flex cursor-pointer items-center gap-2 select-none">
            <input
              type="checkbox"
              checked={notifyWhatsApp}
              onChange={(e) => {
                setNotifyWhatsApp(e.target.checked);
              }}
              className="size-4 cursor-pointer rounded border-border-control accent-pine-deep"
            />
            <span className="text-text-primary text-xs font-semibold">
              {t('mutation_notify_whatsapp_label')}
            </span>
          </label>

          <div className="flex w-full items-center justify-end gap-2.5 sm:w-auto">
            <button
              type="button"
              onClick={props.onClose}
              className="hover:bg-surface-container text-text-muted hover:text-text-primary h-10 cursor-pointer rounded-xl bg-surface-container-low px-4 text-xs font-semibold transition-colors sm:text-sm"
            >
              {t('btn_cancel')}
            </button>
            <button
              type="button"
              onClick={handleExecute}
              className="flex h-10 cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-5 text-xs font-bold text-white shadow-md transition-colors hover:bg-pine-hover sm:text-sm"
            >
              <CheckCircle2 className="size-4 text-amber-gold" />
              <span>{t('btn_execute_mutation')}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
