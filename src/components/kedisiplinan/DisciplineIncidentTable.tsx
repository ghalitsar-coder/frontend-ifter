import {
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Eye,
  History,
  Hourglass,
  Pencil,
  Search,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

import type { DisciplineIncident, IncidentStatus } from '@/types/discipline';

/**
 * Get progress bar color class depending on point threshold.
 *
 * @param totalPoints - Total student points.
 * @returns CSS background class string.
 */
function getBarColor(totalPoints: number) {
  if (totalPoints >= 50) {
    return 'bg-red-600';
  }
  if (totalPoints >= 30) {
    return 'bg-amber-gold';
  }
  return 'bg-pine-deep';
}

/**
 * Render category badge based on points and severity.
 *
 * @param props - Component properties.
 * @returns Rendered category badge.
 */
function CategoryBadge(props: { categoryLabel: string; points: number }) {
  if (props.points >= 25) {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border border-red-200 bg-red-100 px-2.5 py-1 text-xs font-bold text-red-700">
        <AlertTriangle className="size-3.5" />
        {props.categoryLabel}
      </span>
    );
  }

  if (props.points >= 5) {
    return (
      <span className="inline-flex items-center gap-1 rounded-lg border border-amber-gold/40 bg-amber-surface px-2.5 py-1 text-xs font-bold text-amber-dark">
        {props.categoryLabel}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-container-low px-2.5 py-1 text-xs font-semibold text-foreground">
      {props.categoryLabel}
    </span>
  );
}

/**
 * Render status badge according to incident status.
 *
 * @param props - Component properties.
 * @returns Rendered status badge.
 */
function StatusBadge(props: { status: IncidentStatus }) {
  if (props.status === 'tindak') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-pine-deep px-2.5 py-1 text-[11px] font-bold text-white shadow-2xs">
        <span className="size-1.5 animate-pulse rounded-full bg-amber-gold" />
        Tindak Lanjut BK
      </span>
    );
  }

  if (props.status === 'baru') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-amber-gold/40 bg-amber-surface px-2.5 py-1 text-[11px] font-semibold text-amber-dark">
        <Hourglass className="size-3" />
        Baru Dicatat
      </span>
    );
  }

  if (props.status === 'tinjau') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-100 px-2.5 py-1 text-[11px] font-semibold text-blue-900">
        <Search className="size-3" />
        Dalam Peninjauan
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-surface-container px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
      <CheckCircle className="size-3 text-pine-deep" />
      Selesai
    </span>
  );
}

/**
 * Data table displaying recorded disciplinary incidents.
 *
 * @param props - Component properties.
 * @returns Rendered discipline incident table.
 */
export function DisciplineIncidentTable(props: {
  incidents: DisciplineIncident[];
  onViewDetail: (incident: DisciplineIncident) => void;
  onEditIncident: (incident: DisciplineIncident) => void;
  onViewHistory: (incident: DisciplineIncident) => void;
}) {
  const t = useTranslations('DisciplinePage');

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              <th scope="col" className="px-4 py-3.5">
                {t('table_col_datetime')}
              </th>
              <th scope="col" className="px-4 py-3.5">
                {t('table_col_student')}
              </th>
              <th scope="col" className="px-4 py-3.5">
                {t('table_col_category')}
              </th>
              <th scope="col" className="min-w-[220px] px-4 py-3.5">
                {t('table_col_description')}
              </th>
              <th scope="col" className="px-4 py-3.5">
                {t('table_col_recorder')}
              </th>
              <th scope="col" className="px-4 py-3.5">
                {t('table_col_total_points')}
              </th>
              <th scope="col" className="px-4 py-3.5">
                {t('table_col_status')}
              </th>
              <th scope="col" className="px-4 py-3.5 text-center">
                {t('table_col_actions')}
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-border text-foreground">
            {props.incidents.length === 0 ? (
              <tr>
                <td colSpan={8} className="py-12 text-center text-muted-foreground">
                  Tidak ada data insiden kedisiplinan yang cocok dengan filter.
                </td>
              </tr>
            ) : (
              props.incidents.map((incident) => {
                const isHighPoint = incident.studentTotalPoints >= 30;
                const barColor = getBarColor(incident.studentTotalPoints);

                return (
                  <tr
                    key={incident.id}
                    className="transition-colors hover:bg-amber-surface/25"
                  >
                    {/* Tanggal & Waktu */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="font-bold text-foreground">{incident.date}</div>
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
                        <Clock className="size-3" />
                        <span>{incident.time}</span>
                      </div>
                    </td>

                    {/* Siswa & Kelas */}
                    <td
                      aria-label={incident.studentName}
                      className="whitespace-nowrap px-4 py-3.5"
                    >
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex size-8 items-center justify-center rounded-full text-xs font-bold ${incident.studentAvatarBg}`}
                        >
                          {incident.studentInitials}
                        </div>
                        <div>
                          <button
                            type="button"
                            onClick={() => props.onViewDetail(incident)}
                            aria-label={`Lihat detail ${incident.studentName}`}
                            className="text-left text-xs font-bold text-foreground transition-colors hover:text-pine-deep"
                          >
                            <span>{incident.studentName}</span>
                          </button>
                          <div className="text-[11px] text-muted-foreground">
                            NIS: {incident.studentNis} •{' '}
                            <span className="font-semibold text-pine-deep">
                              Kelas {incident.studentClass}
                            </span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kategori & Poin */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <CategoryBadge
                        categoryLabel={incident.categoryLabel}
                        points={incident.points}
                      />
                    </td>

                    {/* Deskripsi */}
                    <td className="px-4 py-3.5">
                      <p className="font-medium leading-snug text-foreground">
                        {incident.description}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Lokasi: {incident.location}
                      </p>
                    </td>

                    {/* Pencatat */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <div className="font-medium">{incident.recorderName}</div>
                      <span className="rounded bg-surface-container px-1.5 py-0.5 text-[10px] text-muted-foreground">
                        {incident.recorderRole}
                      </span>
                    </td>

                    {/* Total Poin Siswa */}
                    <td
                      aria-label={`${incident.studentTotalPoints} dari 100 poin`}
                      className="whitespace-nowrap px-4 py-3.5"
                    >
                      <div className="w-32 space-y-1">
                        <div
                          className={`flex justify-between text-[11px] font-semibold ${
                            isHighPoint ? 'text-amber-dark' : 'text-muted-foreground'
                          }`}
                        >
                          <span>{incident.studentTotalPoints} / 100</span>
                          <span>{incident.studentPointStatus}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-container">
                          <div
                            className={`h-1.5 rounded-full ${barColor}`}
                            style={{
                              width: `${Math.min(100, incident.studentTotalPoints)}%`,
                            }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="whitespace-nowrap px-4 py-3.5">
                      <StatusBadge status={incident.status} />
                    </td>

                    {/* Aksi */}
                    <td className="whitespace-nowrap px-4 py-3.5 text-center">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => props.onViewDetail(incident)}
                          className="rounded-lg p-1.5 text-pine-deep transition-colors hover:bg-pine-light"
                          title="Lihat Detail & Tindak Lanjut"
                          aria-label="Lihat Detail & Tindak Lanjut"
                        >
                          <Eye className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => props.onEditIncident(incident)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          title="Edit Rekam Data"
                          aria-label="Edit Rekam Data"
                        >
                          <Pencil className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => props.onViewHistory(incident)}
                          className="rounded-lg p-1.5 text-muted-foreground transition-colors hover:bg-muted"
                          title="Histori Audit"
                          aria-label="Histori Audit"
                        >
                          <History className="size-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-surface-container-low p-4 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-2">
          <span>{t('rows_per_page')}</span>
          <select
            aria-label={t('rows_per_page')}
            className="rounded-lg border border-border bg-card px-2 py-1 text-xs text-foreground focus:ring-1 focus:ring-pine-deep"
          >
            <option>10</option>
            <option>25</option>
            <option>50</option>
          </select>
          <span>
            {t('showing_count', {
              count: props.incidents.length,
              total: 42,
            })}
          </span>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            disabled
            aria-label="Previous Page"
            className="rounded-lg border border-border bg-card p-1 text-muted-foreground opacity-50 shadow-2xs"
          >
            <ChevronLeft className="size-4" />
          </button>
          <button
            type="button"
            className="rounded-lg bg-pine-deep px-3 py-1 font-bold text-white shadow-2xs"
          >
            1
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-card px-3 py-1 text-foreground transition-colors hover:bg-muted"
          >
            2
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-card px-3 py-1 text-foreground transition-colors hover:bg-muted"
          >
            3
          </button>
          <button
            type="button"
            className="rounded-lg border border-border bg-card px-3 py-1 text-foreground transition-colors hover:bg-muted"
          >
            4
          </button>
          <button
            type="button"
            aria-label="Next Page"
            className="rounded-lg border border-border bg-card p-1 text-muted-foreground transition-colors hover:bg-muted shadow-2xs"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
