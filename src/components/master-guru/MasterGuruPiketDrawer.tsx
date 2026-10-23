import { ArrowUpRight, CheckCircle2, Clock, DoorOpen, MapPin, Shield, X } from 'lucide-react';
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
    <div className="bg-surface-card mb-8 animate-in rounded-2xl border border-pine-deep/20 p-5 shadow-sm transition-all fade-in slide-in-from-top-2 sm:p-6">
      {/* Drawer Header */}
      <div className="flex flex-col justify-between gap-3 border-b border-border-subtle pb-4 sm:flex-row sm:items-center">
        <div className="flex items-center gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-light text-pine-deep">
            <DoorOpen className="size-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-pine-deep sm:text-lg">
              {t('piket_drawer_title')}
            </h2>
            <div className="text-text-muted mt-0.5 flex flex-wrap items-center gap-2 text-xs">
              <span className="flex items-center gap-1 font-medium">
                <Clock className="size-3.5 text-amber-600" />
                {t('piket_operational_time')}
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 font-semibold text-emerald-700">
                <CheckCircle2 className="size-3.5" />
                {t('piket_status_all_checked_in')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          <Link
            href="/dashboard/piket/"
            className="inline-flex items-center gap-1.5 rounded-lg bg-pine-light px-3 py-1.5 text-xs font-semibold text-pine-deep transition-colors hover:bg-pine-deep hover:text-white"
          >
            <span>{t('btn_open_full_piket_dashboard')}</span>
            <ArrowUpRight className="size-3.5" />
          </Link>
          <button
            type="button"
            onClick={props.onClose}
            className="text-text-muted hover:text-text-primary cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-slate-100"
            aria-label={t('btn_close')}
          >
            <X className="size-5" />
          </button>
        </div>
      </div>

      {/* Picket Posts Cards */}
      <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
        {props.posts.map((post) => (
          <div
            key={post.id}
            className="bg-canvas-base/80 flex flex-col justify-between rounded-xl border border-border-control p-4 transition-all hover:border-pine-deep/30"
          >
            <div>
              <div className="mb-2 flex items-center justify-between gap-2">
                <span className="rounded-md bg-pine-deep px-2 py-0.5 text-[10px] font-bold tracking-wider text-white uppercase">
                  {post.postNumber}
                </span>
                <div className="flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                  <CheckCircle2 className="size-3" />
                  <span>{post.checkInTime}</span>
                </div>
              </div>

              <h3 className="text-sm leading-snug font-bold text-pine-deep">{post.name}</h3>
              <div className="text-text-muted mt-1 flex items-center gap-1 text-xs">
                <MapPin className="text-text-muted size-3 shrink-0" />
                <span>{post.location}</span>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between border-t border-border-subtle/80 pt-3">
              <div className="flex items-center gap-2">
                <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-deep text-xs font-bold text-white">
                  {post.officerInitial}
                </div>
                <div className="flex flex-col">
                  <span className="text-text-primary text-xs leading-tight font-semibold">
                    {post.officerName}
                  </span>
                  <span className="text-text-muted flex items-center gap-1 text-[10px]">
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
