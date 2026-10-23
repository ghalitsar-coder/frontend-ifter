import { CheckCircle2, Gavel, Minus, Plus, Scale, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { getRuleSeverity } from '@/data/mockTatib';
import type { NewRuleInput, RuleSeverity } from '@/types/tatib';
import { SEVERITY_STYLES } from './severityStyles';

const SEVERITY_ORDER: RuleSeverity[] = ['ringan', 'sedang', 'berat', 'kritis'];

const AUTHORITIES = [
  'Guru Piket',
  'Guru BK',
  'Wakasek Kesiswaan',
  'Wakasek Kurikulum',
  'Kepala Sekolah',
];

/**
 * Modal form for publishing a new article of the school code of conduct.
 *
 * @param props - Component properties.
 * @returns Modal JSX element or null.
 */
export function TatibAddModal(props: {
  isOpen: boolean;
  nextCode: string;
  onClose: () => void;
  onSubmit: (rule: NewRuleInput, publish: boolean) => void;
}) {
  const t = useTranslations('TatibPage');

  const [title, setTitle] = useState('');
  const [detail, setDetail] = useState('');
  const [points, setPoints] = useState(5);
  const [procedure, setProcedure] = useState('');
  const [authority, setAuthority] = useState('Guru Piket');
  const [legalBasis, setLegalBasis] = useState('Tata Tertib Sekolah');

  if (!props.isOpen) {
    return null;
  }

  const severity = getRuleSeverity(points);
  const isValid = title.trim().length > 0 && procedure.trim().length > 0;

  const handleSave = (publish: boolean) => {
    if (!isValid) {
      return;
    }

    props.onSubmit(
      {
        title: title.trim(),
        detail: detail.trim() || title.trim(),
        points,
        procedure: procedure.trim(),
        authority,
        legalBasis: legalBasis.trim() || 'Tata Tertib Sekolah',
      },
      publish,
    );

    setTitle('');
    setDetail('');
    setPoints(5);
    setProcedure('');
    setLegalBasis('Tata Tertib Sekolah');
  };

  return (
    <div
      // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role -- modal overlay already scoped by aria-modal
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-add-tatib-title"
      className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-900/60 p-3 backdrop-blur-xs sm:p-4"
    >
      <div className="relative my-6 w-full max-w-3xl overflow-hidden rounded-2xl border border-border-control bg-card shadow-2xl">
        <div className="flex items-start justify-between bg-pine-deep px-6 py-4.5 text-white">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-white/10 text-amber-gold">
              <Gavel className="size-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold tracking-wider text-amber-gold uppercase">
                {t('add_modal_badge')}
              </p>
              <h2 id="modal-add-tatib-title" className="text-base font-bold sm:text-lg">
                {t('add_modal_title')}
              </h2>
              <p className="text-xs text-emerald-100">{t('add_modal_subtitle')}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={props.onClose}
            className="cursor-pointer rounded-lg p-1.5 text-emerald-200 transition-colors hover:bg-white/10 hover:text-white"
            aria-label={t('btn_close')}
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="max-h-[75vh] space-y-6 overflow-y-auto p-6">
          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-pine-deep text-xs font-bold text-white">
                1
              </span>
              <h3 className="text-sm font-bold text-pine-deep">{t('section_identity')}</h3>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div>
                <span className="mb-1 block text-xs font-semibold text-foreground">
                  {t('field_code_label')}
                </span>
                <div className="flex h-10 items-center rounded-xl border border-border-control bg-surface-container-low px-3 font-mono text-xs font-bold text-pine-deep">
                  {props.nextCode}
                </div>
                <p className="mt-1 text-[10px] text-muted-foreground">{t('field_code_hint')}</p>
              </div>

              <div className="sm:col-span-2">
                <label
                  htmlFor="tatib-title"
                  className="mb-1 block text-xs font-semibold text-foreground"
                >
                  {t('field_title_label')}
                </label>
                <input
                  id="tatib-title"
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  placeholder={t('field_title_placeholder')}
                  className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>

              <div className="sm:col-span-3">
                <label
                  htmlFor="tatib-detail"
                  className="mb-1 block text-xs font-semibold text-foreground"
                >
                  {t('field_detail_label')}
                </label>
                <input
                  id="tatib-detail"
                  type="text"
                  value={detail}
                  onChange={(e) => {
                    setDetail(e.target.value);
                  }}
                  placeholder={t('field_detail_placeholder')}
                  className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">
                  {t('field_severity_label')}
                </span>
                <span className="text-[10px] text-muted-foreground">
                  {t('field_severity_hint')}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5 xl:grid-cols-4">
                {SEVERITY_ORDER.map((band) => (
                  <div
                    key={band}
                    className={`rounded-xl border p-3 transition-all ${
                      severity === band
                        ? `${SEVERITY_STYLES[band].ring} ring-2 ring-pine-deep/10`
                        : 'border-border-control bg-card opacity-70'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-pine-deep">
                        {t(`severity_${band}`)}
                      </span>
                      <span className={`size-2 rounded-full ${SEVERITY_STYLES[band].dot}`} />
                    </div>
                    <p className="mt-1 text-[10px] leading-snug text-muted-foreground">
                      {t(`range_${band}`)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col justify-between gap-3 rounded-xl border border-border-control bg-surface-container-low p-3.5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-3">
                <Scale className="size-4 text-amber-dark" />
                <div>
                  <p className="text-xs font-bold text-pine-deep">{t('field_points_label')}</p>
                  <p className="text-[10px] text-muted-foreground">{t('field_points_hint')}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setPoints((value) => Math.max(1, value - 1));
                  }}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border-control bg-card text-pine-deep hover:bg-pine-light"
                  aria-label={t('btn_decrease_points')}
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-10 text-center text-sm font-extrabold text-pine-deep">
                  {points}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setPoints((value) => Math.min(100, value + 1));
                  }}
                  className="flex size-8 cursor-pointer items-center justify-center rounded-lg border border-border-control bg-card text-pine-deep hover:bg-pine-light"
                  aria-label={t('btn_increase_points')}
                >
                  <Plus className="size-3.5" />
                </button>
                <span className="rounded-lg bg-red-700 px-2.5 py-1 text-xs font-bold text-white">
                  -{points} {t('unit_poin')}
                </span>
              </div>
            </div>
          </section>

          <section className="space-y-4">
            <div className="flex items-center gap-2 border-b border-border-subtle pb-2">
              <span className="flex size-6 items-center justify-center rounded-full bg-pine-deep text-xs font-bold text-white">
                2
              </span>
              <h3 className="text-sm font-bold text-pine-deep">{t('section_procedure')}</h3>
            </div>

            <div>
              <label
                htmlFor="tatib-procedure"
                className="mb-1 block text-xs font-semibold text-foreground"
              >
                {t('field_procedure_label')}
              </label>
              <textarea
                id="tatib-procedure"
                rows={4}
                value={procedure}
                onChange={(e) => {
                  setProcedure(e.target.value);
                }}
                placeholder={t('field_procedure_placeholder')}
                className="w-full resize-y rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-xs leading-relaxed text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">{t('field_procedure_hint')}</p>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label
                  htmlFor="tatib-authority"
                  className="mb-1 block text-xs font-semibold text-foreground"
                >
                  {t('field_authority_label')}
                </label>
                <select
                  id="tatib-authority"
                  value={authority}
                  onChange={(e) => {
                    setAuthority(e.target.value);
                  }}
                  className="h-10 w-full cursor-pointer rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                >
                  {AUTHORITIES.map((item) => (
                    <option key={item} value={item}>
                      {item}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="tatib-legal-basis"
                  className="mb-1 block text-xs font-semibold text-foreground"
                >
                  {t('field_legal_basis_label')}
                </label>
                <input
                  id="tatib-legal-basis"
                  type="text"
                  value={legalBasis}
                  onChange={(e) => {
                    setLegalBasis(e.target.value);
                  }}
                  placeholder={t('field_legal_basis_placeholder')}
                  className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="flex flex-col-reverse justify-end gap-3 border-t border-border-subtle bg-card px-6 py-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={props.onClose}
            className="cursor-pointer rounded-xl border border-border-control px-4 py-2.5 text-xs font-semibold text-muted-foreground transition-colors hover:bg-surface-container-low sm:text-sm"
          >
            {t('btn_cancel')}
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={() => {
              handleSave(false);
            }}
            className="cursor-pointer rounded-xl border border-border-control bg-card px-4 py-2.5 text-xs font-semibold text-pine-deep transition-colors hover:bg-pine-light disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            {t('btn_save_and_another')}
          </button>
          <button
            type="button"
            disabled={!isValid}
            onClick={() => {
              handleSave(true);
            }}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-pine-deep px-5 py-2.5 text-xs font-semibold text-white shadow-md transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50 sm:text-sm"
          >
            <CheckCircle2 className="size-4 text-amber-gold" />
            <span>{t('btn_save_and_publish')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
