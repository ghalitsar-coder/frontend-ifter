import { Check, Circle, Clock, FileText, Info, Plus, X } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type {
  AttendanceStatus,
  DocumentPreviewData,
  StudentAttendanceRecord,
} from '@/types/attendance';

/**
 * Detailed student roster table showing attendance status, source, notes, and quick action toggles.
 *
 * @param props - Students data and update callbacks.
 * @returns Student roster table.
 */
export function AttendanceRosterTable(props: {
  students: StudentAttendanceRecord[];
  onStatusChange: (id: string, newStatus: AttendanceStatus) => void;
  onPreviewDoc: (preview: DocumentPreviewData) => void;
  totalCount: number;
}) {
  const t = useTranslations('AttendancePage');

  return (
    <section className="mb-6 overflow-hidden rounded-2xl border border-border bg-card shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left">
          <thead className="border-b border-border bg-surface-container-low/70 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <tr>
              <th className="w-12 px-4 py-4 text-center">{t('th_no')}</th>
              <th className="px-4 py-4">{t('th_student')}</th>
              <th className="px-4 py-4">{t('th_status')}</th>
              <th className="px-4 py-4">{t('th_time_source')}</th>
              <th className="px-4 py-4">{t('th_notes')}</th>
              <th className="px-4 py-4 text-right">{t('th_action')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 text-sm text-foreground">
            {props.students.map((student, index) => {
              const numStr = (index + 1).toString().padStart(2, '0');

              return (
                <tr key={student.id} className="transition-colors hover:bg-hover-row">
                  {/* Number */}
                  <td className="px-4 py-4 text-center font-mono text-xs text-muted-foreground">
                    {numStr}
                  </td>

                  {/* Student Name & NISN */}
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-black ${student.avatarBg}`}
                      >
                        {student.initials}
                      </div>
                      <div className="flex min-w-0 flex-col">
                        <span className="truncate font-semibold text-foreground">
                          {student.name}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          NISN: {student.nisn} • No. Absen {student.absentNumber}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="px-4 py-4">
                    {student.status === 'hadir' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-mint px-3 py-1 text-xs font-medium text-black">
                        <Check className="size-3.5 stroke-[2.5]" />
                        {t('hadir_label')}
                      </span>
                    )}
                    {student.status === 'sakit' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-yellow px-3 py-1 text-xs font-medium text-black">
                        <Plus className="size-3.5 stroke-[2.5]" />
                        {t('sakit_label')}
                      </span>
                    )}
                    {student.status === 'izin' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-blue px-3 py-1 text-xs font-medium text-black">
                        <Circle className="size-3" />
                        {t('izin_label')}
                      </span>
                    )}
                    {student.status === 'alpa' && (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-pastel-red px-3 py-1 text-xs font-medium text-black">
                        <X className="size-3.5 stroke-[2.5]" />
                        {t('alpa_label')}
                      </span>
                    )}
                  </td>

                  {/* Timestamp & Source */}
                  <td className="px-4 py-4 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <Clock className="size-3.5 shrink-0 text-muted-foreground" />
                      <span className="truncate">
                        {student.timestamp} {student.source}
                      </span>
                    </div>
                  </td>

                  {/* Notes / Document Link */}
                  <td className="px-4 py-4 text-xs">
                    {student.documentName ? (
                      <button
                        type="button"
                        onClick={() =>{ 
                          props.onPreviewDoc({
                            title:
                              student.documentTitle || student.documentName || 'Dokumen Terlampir',
                            documentName: student.documentName || '',
                            studentName: student.name,
                            clinic: student.documentClinic,
                            doctor: student.documentDoctor,
                            date: student.documentDate,
                          }); }
                        }
                        className="inline-flex max-w-[200px] items-center gap-1.5 rounded-lg border border-border/50 bg-surface-container-low px-2.5 py-1 text-xs font-medium text-foreground transition-colors hover:bg-surface-container-high"
                      >
                        <FileText className="size-3.5 shrink-0 text-primary" />
                        <span className="truncate">{student.documentName}</span>
                      </button>
                    ) : (
                      <span
                        className={
                          student.status === 'alpa'
                            ? 'font-medium text-destructive'
                            : 'text-muted-foreground'
                        }
                      >
                        {student.notes}
                      </span>
                    )}
                  </td>

                  {/* Quick Status Segmented Controls */}
                  <td className="px-4 py-4 text-right">
                    <div className="inline-flex items-center gap-1 rounded-xl border border-border/50 bg-surface-container-low p-1">
                      <button
                        type="button"
                        title={t('hadir_label')}
                        onClick={() =>{  props.onStatusChange(student.id, 'hadir'); }}
                        className={`size-7 rounded-lg text-xs font-semibold transition-all ${
                          student.status === 'hadir'
                            ? 'bg-card text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t('btn_short_hadir')}
                      </button>
                      <button
                        type="button"
                        title={t('sakit_label')}
                        onClick={() =>{  props.onStatusChange(student.id, 'sakit'); }}
                        className={`size-7 rounded-lg text-xs font-semibold transition-all ${
                          student.status === 'sakit'
                            ? 'bg-card text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t('btn_short_sakit')}
                      </button>
                      <button
                        type="button"
                        title={t('izin_label')}
                        onClick={() =>{  props.onStatusChange(student.id, 'izin'); }}
                        className={`size-7 rounded-lg text-xs font-semibold transition-all ${
                          student.status === 'izin'
                            ? 'bg-card text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t('btn_short_izin')}
                      </button>
                      <button
                        type="button"
                        title={t('alpa_label')}
                        onClick={() =>{  props.onStatusChange(student.id, 'alpa'); }}
                        className={`size-7 rounded-lg text-xs font-semibold transition-all ${
                          student.status === 'alpa'
                            ? 'bg-card text-foreground shadow-xs'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {t('btn_short_alpa')}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Footer Info */}
      <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-surface-container-low/40 px-4 py-3 text-xs text-muted-foreground sm:flex-row">
        <div className="flex items-center gap-1.5">
          <Info className="size-3.5 text-muted-foreground" />
          <span>
            {t('showing_count', {
              count: props.students.length,
              total: props.totalCount,
            })}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled
            className="rounded-lg border border-border/60 bg-card px-2.5 py-1 text-foreground disabled:opacity-50"
          >
            {t('prev_page')}
          </button>
          <span className="px-2 font-medium">{t('page_info', { current: 1, total: 1 })}</span>
          <button
            type="button"
            disabled
            className="rounded-lg border border-border/60 bg-card px-2.5 py-1 text-foreground disabled:opacity-50"
          >
            {t('next_page')}
          </button>
        </div>
      </div>
    </section>
  );
}
