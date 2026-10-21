import {
  ArrowUpRight,
  CheckCircle2,
  Clock,
  DoorOpen,
  MapPin,
  Shield,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/libs/I18nNavigation';
import type { PicketPostSummary } from '@/types/masterGuru';

/**
 * Collapsible Picket Gate Monitoring Drawer displayed when activated from the header.
 *
 * @param props - Component properties.
 * @returns Drawer element or null if closed.
 */
export function MasterGuruPiketDrawer(props: {
  isOpen: boolean;
  onClose: () => void;
  posts: PicketPostSummary[];
}) {
  const t = useTranslations('MasterGuruPage');

  if (!props.isOpen) {
    return null;
  }

  return (
    <div className="mb-8 rounded-2xl bg-surface-card border border-pine-deep/20 shadow-sm p-5 sm:p-6 transition-all animate-in fade-in slide-in-from-top-2">
      {/* Drawer Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-pine-light text-pine-deep flex items-center justify-center shrink-0">
            <DoorOpen className="size-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-pine-deep">
              {t('piket_drawer_title')}
            </h2>
            <div className="flex flex-wrap items-center gap-2 text-xs text-text-muted mt-0.5">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="size-3.5 text-amber-600" />
                {t('piket_operational_time')}
              </span>
              <span>•</span>
              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                <CheckCircle2 className="size-3.5" />
                {t('piket_status_all_checked_in')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href="/dashboard/piket/"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-pine-deep bg-pine-light hover:bg-pine-deep hover:text-white transition-colors"
          >
            <span>{t('btn_open_full_piket_dashboard')}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={props.onClose}
            className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label={t('btn_close')}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Picket Posts Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
        {props.posts.map((post) => (
          <div
            key={post.id}
            className="rounded-xl border border-border-control bg-canvas-base/80 p-4 hover:border-pine-deep/30 transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-pine-deep text-white">
                  {post.postNumber}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="size-3" />
                  <span>{post.checkInTime}</span>
                </div>
              </div>

              <h3 className="text-sm font-bold text-pine-deep leading-snug">
                {post.name}
              </h3>
              <div className="flex items-center gap-1 text-xs text-text-muted mt-1">
                <MapPin className="size-3 text-text-muted shrink-0" />
                <span>{post.location}</span>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-border-subtle/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="size-7 rounded-full bg-pine-deep text-white text-xs font-bold flex items-center justify-center shrink-0">
                  {post.officerInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-text-primary leading-tight">
                    {post.officerName}
                  </span>
                  <span className="text-[10px] text-text-muted flex items-center gap-1">
                    <Shield className="size-2.5 text-amber-600" />
                    {post.dutyRole}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
