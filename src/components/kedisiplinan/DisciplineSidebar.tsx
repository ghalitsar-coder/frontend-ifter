import { AlertOctagon, Calendar, Download, Eye, Headphones, Mail } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { mockDisciplineWatchlist } from '@/data/mockDiscipline';
import type { DisciplineWatchStudent } from '@/types/discipline';

/**
 * Get container styling based on risk level.
 *
 * @param riskLevel - Risk level tag.
 * @returns Border and background CSS string.
 */
function getRiskContainerClass(riskLevel: string) {
  if (riskLevel === 'tinggi') {
    return 'border-red-200 bg-red-50/50';
  }
  if (riskLevel === 'waspada') {
    return 'border-amber-gold/40 bg-amber-surface/40';
  }
  return 'border-border bg-surface-container-low';
}

/**
 * Get badge styling for points count based on risk level.
 *
 * @param riskLevel - Risk level tag.
 * @returns Background and text color CSS string.
 */
function getRiskBadgeClass(riskLevel: string) {
  if (riskLevel === 'tinggi') {
    return 'bg-red-600 text-white';
  }
  if (riskLevel === 'waspada') {
    return 'border border-amber-gold/50 bg-amber-surface text-amber-dark';
  }
  return 'bg-yellow-100 text-yellow-900';
}

/**
 * Get label color based on risk level.
 *
 * @param riskLevel - Risk level tag.
 * @returns Text color CSS string.
 */
function getRiskTextClass(riskLevel: string) {
  if (riskLevel === 'tinggi') {
    return 'text-red-600';
  }
  if (riskLevel === 'waspada') {
    return 'text-amber-dark';
  }
  return 'text-foreground';
}

/**
 * Render action button for watchlist item.
 *
 * @param props - Component properties.
 * @returns Rendered action button.
 */
function WatchlistActionButton(props: {
  student: DisciplineWatchStudent;
  onSendParentCall: (studentName: string) => void;
  onScheduleBk: (studentName: string) => void;
  onReviewHistory: (studentName: string) => void;
}) {
  const t = useTranslations('DisciplinePage');

  if (props.student.actionType === 'parent_call') {
    return (
      <button
        type="button"
        onClick={() => {
          props.onSendParentCall(props.student.name);
        }}
        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl bg-pine-deep px-3 py-1.5 text-xs font-semibold text-white shadow-2xs transition-colors hover:bg-pine-hover"
      >
        <Mail className="size-3.5 text-amber-gold" />
        <span>{t('watchlist_btn_call')}</span>
      </button>
    );
  }

  if (props.student.actionType === 'schedule_bk') {
    return (
      <button
        type="button"
        onClick={() => {
          props.onScheduleBk(props.student.name);
        }}
        className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-pine-deep shadow-2xs transition-colors hover:bg-muted"
      >
        <Calendar className="size-3.5 text-pine-deep" />
        <span>{t('watchlist_btn_schedule')}</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={() => {
        props.onReviewHistory(props.student.name);
      }}
      className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-xl border border-border bg-card px-3 py-1.5 text-xs font-semibold text-pine-deep shadow-2xs transition-colors hover:bg-muted"
    >
      <Eye className="size-3.5 text-pine-deep" />
      <span>{t('watchlist_btn_review')}</span>
    </button>
  );
}

/**
 * Trigger download of discipline handbook file.
 *
 * @param e - Click event.
 */
function handleHandbookDownload(e: React.MouseEvent) {
  e.preventDefault();
  const handbookContent = 'Buku Panduan Tata Tertib & Sanksi SMPN 1 Sleman';
  const blob = new Blob([handbookContent], { type: 'text/plain;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', 'Buku_Pedoman_Disiplin_SMPN1.txt');
  document.body.append(link);
  link.click();
  link.remove();
}

/**
 * Sidebar component showing parental notification watchlist, counseling workflow, and sync status.
 *
 * @param props - Component properties.
 * @returns Rendered discipline sidebar.
 */
export function DisciplineSidebar(props: {
  onSendParentCall: (studentName: string) => void;
  onScheduleBk: (studentName: string) => void;
  onReviewHistory: (studentName: string) => void;
}) {
  const t = useTranslations('DisciplinePage');

  return (
    <aside className="space-y-5">
      {/* Card 1: High Risk Watchlist */}
      <div className="space-y-4 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertOctagon className="size-4.5 text-amber-dark" />
            <h3 className="text-sm font-bold text-foreground">{t('watchlist_title')}</h3>
          </div>
          <span className="rounded-full border border-amber-gold/40 bg-amber-surface px-2 py-0.5 text-[11px] font-bold text-amber-dark">
            {t('watchlist_students_count', { count: mockDisciplineWatchlist.length })}
          </span>
        </div>

        <p className="text-xs leading-relaxed text-muted-foreground">
          {t('watchlist_description')}
        </p>

        <div className="space-y-3">
          {mockDisciplineWatchlist.map((student) => (
            <div
              key={student.id}
              className={`space-y-2 rounded-xl border p-3 ${getRiskContainerClass(student.riskLevel)}`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="text-xs font-bold text-foreground">{student.name}</h4>
                  <p className="text-[11px] text-muted-foreground">
                    {student.className} • NIS: {student.nis}
                  </p>
                </div>
                <span
                  className={`rounded-md px-2 py-0.5 text-xs font-extrabold ${getRiskBadgeClass(student.riskLevel)}`}
                >
                  {student.points} Poin
                </span>
              </div>

              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Status: {student.statusLabel}</span>
                <span className={`font-semibold capitalize ${getRiskTextClass(student.riskLevel)}`}>
                  {student.riskLevel}
                </span>
              </div>

              <WatchlistActionButton
                student={student}
                onSendParentCall={props.onSendParentCall}
                onScheduleBk={props.onScheduleBk}
                onReviewHistory={props.onReviewHistory}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Card 2: Alur Penanganan BK */}
      <div className="space-y-3 rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-pine-deep uppercase">
          <Headphones className="size-4" />
          <span>{t('counseling_flow_title')}</span>
        </div>

        <ol className="relative my-2 ml-2.5 space-y-4 border-l border-border text-xs">
          <li className="ml-4">
            <div className="absolute top-1 -left-1.5 size-2.5 rounded-full bg-pine-deep" />
            <p className="font-bold text-foreground">{t('flow_step_1_title')}</p>
            <p className="text-[11px] text-muted-foreground">{t('flow_step_1_desc')}</p>
          </li>
          <li className="ml-4">
            <div className="absolute top-1 -left-1.5 size-2.5 rounded-full bg-amber-gold" />
            <p className="font-bold text-foreground">{t('flow_step_2_title')}</p>
            <p className="text-[11px] text-muted-foreground">{t('flow_step_2_desc')}</p>
          </li>
          <li className="ml-4">
            <div className="absolute top-1 -left-1.5 size-2.5 rounded-full bg-pine-hover" />
            <p className="font-bold text-foreground">{t('flow_step_3_title')}</p>
            <p className="text-[11px] text-muted-foreground">{t('flow_step_3_desc')}</p>
          </li>
        </ol>

        <div className="border-t border-border pt-2">
          <a
            href="#download-handbook"
            onClick={handleHandbookDownload}
            className="flex items-center justify-between text-xs font-semibold text-pine-deep hover:underline"
          >
            <span>{t('btn_download_handbook')}</span>
            <Download className="size-3.5" />
          </a>
        </div>
      </div>

      {/* Card 3: System Status Banner */}
      <div className="space-y-2 rounded-2xl bg-pine-deep p-4 text-white shadow-xs">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold tracking-wider text-amber-gold uppercase">
            {t('sync_banner_title')}
          </span>
          <span className="inline-block size-2 rounded-full bg-amber-gold" />
        </div>
        <p className="text-xs leading-relaxed font-medium text-emerald-100">
          {t('sync_banner_desc')}
        </p>
      </div>
    </aside>
  );
}
