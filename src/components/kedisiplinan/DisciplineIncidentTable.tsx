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
  onEditIncident: (incident: DisciplineIncident) => void;
  onViewDetail: (incident: DisciplineIncident) => void;
  onViewHistory: (incident: DisciplineIncident) => void;
}) {
  const t = useTranslations('DisciplinePage');

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-surface-container-low text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
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
                <td
                  colSpan={8}
                  aria-label="Kosong"
                  className="py-12 text-center text-muted-foreground"
                >
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <div className="flex size-12 items-center justify-center rounded-full bg-surface-container">
                      <Search className="size-6 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-semibold">Tidak ada insiden yang sesuai filter</p>
                    <p className="text-xs">Ubah kata kunci pencarian atau sesuaikan opsi filter.</p>
                  </div>
                </td>
              </tr>
            ) : (
              props.incidents.map((incident) => {
                const barColor = getBarColor(incident.studentTotalPoints);

                return (
                  <tr
                    key={incident.id}
                    className="transition-colors hover:bg-surface-container-low/60"
                  >
                    {/* Waktu */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-semibold text-foreground">{incident.date}</div>
                      <div className="flex items-center text-[11px] text-muted-foreground">
                        <Clock className="mr-1 size-3 text-pine-deep" />
                        {incident.time}
                      </div>
                    </td>

                    {/* Siswa */}
                    <td aria-label={incident.studentName} className="px-4 py-3.5 whitespace-nowrap">
                      <div className="flex items-center gap-2.5">
                        <div
                          className={`flex size-8 shrink-0 items-center justify-center rounded-xl text-xs font-bold ${incident.studentAvatarBg}`}
                        >
                          {incident.studentInitials}
                        </div>
                        <div>
                          <div className="font-bold text-foreground">{incident.studentName}</div>
                          <div className="text-[11px] text-muted-foreground">
                            {incident.studentClass} â€¢ NIS: {incident.studentNis}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Kategori Pelanggaran */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <CategoryBadge
                        categoryLabel={incident.categoryLabel}
                        points={incident.points}
                      />
                    </td>

                    {/* Deskripsi & Lokasi */}
                    <td className="max-w-[260px] px-4 py-3.5">
                      <p className="line-clamp-2 leading-relaxed text-foreground">
                        {incident.description}
                      </p>
                      <p className="mt-0.5 flex items-center text-[11px] text-muted-foreground">
                        <span className="truncate">ðŸ“ {incident.location}</span>
                      </p>
                    </td>

                    {/* Pencatat */}
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <div className="font-medium text-foreground">{incident.recorderName}</div>
                      <div className="text-[11px] text-muted-foreground">
                        {incident.recorderRole}
                      </div>
                    </td>

                    {/* Akumulasi Poin */}
                    <td
                      aria-label={`${incident.studentTotalPoints} Poin`}
                      className="px-4 py-3.5 whitespace-nowrap"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-extrabold text-foreground">
                            {incident.studentTotalPoints} Poin
                          </span>
                          <span
                            className={`text-[10px] font-bold ${
                              incident.studentTotalPoints >= 30 ? 'text-red-600' : 'text-pine-deep'
                            }`}
                          >
                            {incident.studentPointStatus}
                          </span>
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
                    <td className="px-4 py-3.5 whitespace-nowrap">
                      <StatusBadge status={incident.status} />
                    </td>

                    {/* Aksi */}
                    <td className="px-4 py-3.5 text-center whitespace-nowrap">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            props.onViewDetail(incident);
                          }}
                          className="rounded-lg p-2 text-pine-deep transition-colors hover:bg-pine-light md:p-1.5"
                          title="Lihat Detail & Tindak Lanjut"
                          aria-label="Lihat Detail & Tindak Lanjut"
                        >
                          <Eye className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            props.onEditIncident(incident);
                          }}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground md:p-1.5"
                          title="Edit Rekam Data"
                          aria-label="Edit Rekam Data"
                        >
                          <Pencil className="size-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            props.onViewHistory(incident);
                          }}
                          className="rounded-lg p-2 text-muted-foreground transition-colors hover:bg-muted md:p-1.5"
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
            className="rounded-lg border border-border bg-card p-1 text-muted-foreground shadow-2xs transition-colors hover:bg-muted"
          >
            <ChevronRight className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
