import { ArrowUpRight, Plus, Scale, Trash2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { SEVERITY_STYLES } from '@/components/tatib/severityStyles';
// shortcut: catalog summary has no settings endpoint (rule catalog lives on /discipline/categories, owned by the tatib module), keep mock
import { getRuleSeverity, mockTatibRules } from '@/data/mockTatib';
import { ApiError } from '@/lib/api/client';
import {
  sanctionDraftsToRules,
  sanctionRulesToDrafts,
  useReplaceSanctionRules,
  useSanctionRules,
} from '@/lib/api/pengaturan';
import type { SanctionRuleDraft } from '@/lib/api/pengaturan';
import { Link } from '@/libs/I18nNavigation';

const ROW_KEY_PREFIX = 'aturan-baru-';

const cellInput =
  'w-full rounded-lg border border-border-control bg-card px-2 py-1.5 text-xs text-foreground outline-none transition-colors focus:border-pine-deep disabled:cursor-not-allowed disabled:bg-surface-container-low';

/**
 * Parse the max-points input: blank or garbage means “no upper bound”.
 * @param raw - Raw `event.target.value`.
 * @returns Clamped points or null.
 */
function parseMaxPoints(raw: string): number | null {
  if (raw === '') {
    return null;
  }
  const parsed = Number(raw);
  return Number.isFinite(parsed) ? Math.max(0, parsed) : null;
}

/**
 * Save-button caption for the sanction-rule editor.
 * @param isPending - True while the PUT /sanction-rules mutation runs.
 * @param isDirty - True when local drafts differ from the server rules.
 * @returns Caption text.
 */
function sanctionsSaveLabel(isPending: boolean, isDirty: boolean): string {
  if (isPending) {
    return 'Menyimpan…';
  }
  return isDirty ? 'Simpan Aturan Sanksi' : 'Tidak Ada Perubahan';
}

/**
 * Compare drafts against server rows by value.
 * @param a - Draft rows.
 * @param b - Server-derived rows.
 * @returns True when the JSON payloads differ.
 */
function draftsDiffer(a: SanctionRuleDraft[], b: SanctionRuleDraft[]): boolean {
  return JSON.stringify(a) !== JSON.stringify(b);
}

/**
 * Caption shown under the rule table for non-admins.
 * @param canEdit - True for the school admin role.
 * @returns Hint text.
 */
function sanctionsHint(canEdit: boolean): string {
  if (canEdit) {
    return 'Rentang poin aktif tidak boleh beririsan; tabrakan ditolak server (409).';
  }
  return 'Hanya Administrator Sekolah yang dapat mengubah aturan sanksi.';
}

/**
 * One editable sanction-rule table row.
 * @param props - Draft row, edit permission flag and change handlers.
 * @returns Table row element.
 */
function SanctionRuleRow(props: {
  row: SanctionRuleDraft;
  canEdit: boolean;
  onPatch: (key: string, patch: Partial<SanctionRuleDraft>) => void;
  onRemove: (key: string) => void;
}) {
  const { row } = props;
  return (
    <tr className="align-middle">
      <td className="px-4 py-2">
        <input
          type="text"
          maxLength={100}
          value={row.name}
          disabled={!props.canEdit}
          onChange={(e) => {
            props.onPatch(row.key, { name: e.target.value });
          }}
          className={cellInput}
          aria-label={`Nama aturan ${row.min_points}`}
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          min={0}
          value={row.min_points}
          disabled={!props.canEdit}
          onChange={(e) => {
            props.onPatch(row.key, { min_points: Math.max(0, Number(e.target.value) || 0) });
          }}
          className={`${cellInput} w-20`}
          aria-label="Poin minimum"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="number"
          min={0}
          placeholder="∞"
          value={row.max_points ?? ''}
          disabled={!props.canEdit}
          onChange={(e) => {
            props.onPatch(row.key, { max_points: parseMaxPoints(e.target.value) });
          }}
          className={`${cellInput} w-20`}
          aria-label="Poin maksimum (kosong = tanpa batas atas)"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          maxLength={100}
          value={row.action}
          disabled={!props.canEdit}
          onChange={(e) => {
            props.onPatch(row.key, { action: e.target.value });
          }}
          className={cellInput}
          aria-label="Tindakan"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="text"
          maxLength={30}
          placeholder="SP1"
          value={row.level}
          disabled={!props.canEdit}
          onChange={(e) => {
            props.onPatch(row.key, { level: e.target.value });
          }}
          className={`${cellInput} w-24`}
          aria-label="Level"
        />
      </td>
      <td className="px-2 py-2">
        <input
          type="checkbox"
          checked={row.is_active}
          disabled={!props.canEdit}
          onChange={(e) => {
            props.onPatch(row.key, { is_active: e.target.checked });
          }}
          aria-label={`Aktifkan aturan ${row.name || row.min_points}`}
          className="size-4 cursor-pointer accent-pine-deep disabled:cursor-not-allowed"
        />
      </td>
      {props.canEdit && (
        <td className="px-2 py-2">
          <button
            type="button"
            onClick={() => {
              props.onRemove(row.key);
            }}
            aria-label="Hapus aturan"
            className="cursor-pointer rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50"
          >
            <Trash2 className="size-3.5" />
          </button>
        </td>
      )}
    </tr>
  );
}

/**
 * Editable sanction-rule table backed by GET/PUT /sanction-rules.
 * Rows map accumulated discipline points to a tier level + action; saving
 * replaces the whole rule set in one transaction (admin only).
 *
 * @returns Sanction rules section with editable rows and catalog summary.
 */
export function SettingsSanctionsPanel() {
  const t = useTranslations('SettingsPage');
  const tTatib = useTranslations('TatibPage');
  const { roles } = useAuth();
  const canEdit = roles.includes('admin');
  const { data: rules, isPending, isError } = useSanctionRules();
  const replaceRules = useReplaceSanctionRules();
  // Sparse patch pattern (same as SettingsManager): `null` = follow the server.
  const [drafts, setDrafts] = useState<SanctionRuleDraft[] | null>(null);

  const serverDrafts = rules === undefined ? [] : sanctionRulesToDrafts(rules);
  const rows = drafts ?? serverDrafts;
  const isDirty = drafts !== null && draftsDiffer(drafts, serverDrafts);

  const patchRow = (key: string, patch: Partial<SanctionRuleDraft>) => {
    setDrafts(rows.map((row) => (row.key === key ? { ...row, ...patch } : row)));
  };

  const addRow = () => {
    setDrafts([
      ...rows,
      {
        key: `${ROW_KEY_PREFIX}${rows.length + 1}-${Date.now()}`,
        name: '',
        min_points: 0,
        max_points: null,
        action: '',
        level: '',
        description: '',
        is_active: true,
      },
    ]);
  };

  const removeRow = (key: string) => {
    setDrafts(rows.filter((row) => row.key !== key));
  };

  const handleSave = () => {
    replaceRules.mutate(sanctionDraftsToRules(rows), {
      onSuccess: () => {
        setDrafts(null);
      },
    });
  };

  const saveError =
    replaceRules.error instanceof ApiError
      ? replaceRules.error.message
      : 'Gagal menyimpan aturan sanksi.';

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-2 sm:flex-row sm:items-end">
        <div>
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">{t('sanction_title')}</h2>
          <p className="text-xs text-muted-foreground">{t('sanction_subtitle')}</p>
        </div>
        <Link
          href="/dashboard/aturan"
          className="inline-flex items-center gap-1.5 rounded-xl border border-border-control bg-card px-3 py-2 text-xs font-semibold text-pine-deep transition-colors hover:bg-pine-light"
        >
          <Scale className="size-3.5" />
          <span>{t('btn_open_catalog')}</span>
          <ArrowUpRight className="size-3.5" />
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-control bg-card shadow-xs">
        <div className="flex items-center justify-between border-b border-border-subtle bg-surface-container-low px-4 py-3">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            Ambang Sanksi Poin
          </h3>
          {canEdit && (
            <button
              type="button"
              onClick={addRow}
              className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[11px] font-semibold text-pine-deep transition-colors hover:bg-pine-light"
            >
              <Plus className="size-3" />
              <span>Tambah Aturan</span>
            </button>
          )}
        </div>

        {isPending && (
          <p className="px-4 py-6 text-xs text-muted-foreground">Memuat aturan sanksi…</p>
        )}
        {isError && !isPending && (
          <p className="px-4 py-6 text-xs text-rose-600">Gagal memuat aturan sanksi dari server.</p>
        )}
        {!isPending && !isError && rows.length === 0 && (
          <p className="px-4 py-6 text-xs text-muted-foreground">
            Belum ada aturan sanksi. Tambahkan baris untuk membuat ambang poin pertama.
          </p>
        )}

        {!isPending && rows.length > 0 && (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[640px] text-left">
              <thead>
                <tr className="border-b border-border-subtle text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                  <th className="px-4 py-2">Nama</th>
                  <th className="px-2 py-2">Poin Min</th>
                  <th className="px-2 py-2">Poin Maks</th>
                  <th className="px-2 py-2">Tindakan</th>
                  <th className="px-2 py-2">Level</th>
                  <th className="px-2 py-2">Aktif</th>
                  {canEdit && <th className="px-2 py-2" aria-label="Aksi" />}
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle">
                {rows.map((row) => (
                  <SanctionRuleRow
                    key={row.key}
                    row={row}
                    canEdit={canEdit}
                    onPatch={patchRow}
                    onRemove={removeRow}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        {!isPending && rows.length > 0 && (
          <div className="flex flex-col gap-2 border-t border-border-subtle px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[11px] text-muted-foreground">{sanctionsHint(canEdit)}</p>
            {canEdit && (
              <div className="flex items-center gap-3">
                {replaceRules.isError && (
                  <span className="text-[11px] font-semibold text-rose-600">{saveError}</span>
                )}
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={!isDirty || replaceRules.isPending}
                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-pine-deep px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <span>{sanctionsSaveLabel(replaceRules.isPending, isDirty)}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="overflow-hidden rounded-2xl border border-border-control bg-card shadow-xs">
        <div className="border-b border-border-subtle bg-surface-container-low px-4 py-3">
          <h3 className="text-xs font-bold tracking-wider text-muted-foreground uppercase">
            {t('catalog_summary_title')}
          </h3>
        </div>
        <ul className="divide-y divide-border-subtle">
          {mockTatibRules.slice(0, 5).map((rule) => {
            const severity = getRuleSeverity(rule.points);
            return (
              <li key={rule.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-foreground">{rule.title}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">{rule.code}</p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <span
                    className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${SEVERITY_STYLES[severity].badge}`}
                  >
                    {tTatib(`severity_${severity}`)}
                  </span>
                  <span className="text-xs font-extrabold text-pine-deep">+{rule.points}</span>
                </div>
              </li>
            );
          })}
        </ul>
        <div className="border-t border-border-subtle px-4 py-2.5 text-[11px] text-muted-foreground">
          {t('catalog_summary_footer', { count: mockTatibRules.length })}
        </div>
      </div>
    </section>
  );
}
