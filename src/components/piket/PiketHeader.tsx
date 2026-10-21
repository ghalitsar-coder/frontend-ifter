import { BellRing, DoorClosed, DoorOpen, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { GateShiftInfo } from '@/types/piket';

/**
 * Gate post header with shift status banner and fast emergency actions.
 * @param props - Component properties.
 * @returns Rendered Piket header component.
 */
export function PiketHeader(props: {
  shiftInfo: GateShiftInfo;
  onToggleGate: () => void;
  onRingBell: () => void;
}) {
  const t = useTranslations('PiketPage');

  return (
    <div className="text-on-primary relative overflow-hidden rounded-2xl bg-pine-deep p-6 shadow-xl">
      <div className="pointer-events-none absolute -top-16 -right-16 size-64 rounded-full bg-pine-hover/40 blur-3xl" />
      <div className="pointer-events-none absolute right-1/4 -bottom-20 size-48 rounded-full bg-amber-gold/10 blur-2xl" />

      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div className="max-w-3xl space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-caption inline-flex items-center gap-1.5 rounded-full bg-amber-gold px-3 py-1 text-xs font-bold tracking-wide text-pine-deep uppercase">
              <span className="size-2 animate-ping rounded-full bg-pine-deep" />
              {t('shift_active')}
            </span>
            <span className="text-tertiary-fixed-dim">•</span>
            <span className="font-caption text-tertiary-fixed-dim inline-flex items-center gap-1 text-xs">
              <ShieldCheck className="size-4" />
              {t('on_duty_officers')}
            </span>
            <span className="text-tertiary-fixed-dim">•</span>
            <span className="font-caption text-tertiary-fixed-dim inline-flex items-center gap-1 text-xs">
              <DoorOpen className="size-4" />
              {t('gate_name')}
            </span>
          </div>

          <h1 className="text-on-primary text-2xl font-bold tracking-tight sm:text-3xl">
            {t('page_title')}
          </h1>
          <p className="text-tertiary-fixed-dim max-w-2xl text-sm leading-relaxed">
            {t('page_subtitle')}
          </p>
        </div>

        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <button
            className={`flex h-11 items-center gap-2 rounded-xl px-5 text-sm font-semibold shadow-xs transition-all duration-150 ${
              props.shiftInfo.isGateOpen
                ? 'bg-surface-card hover:bg-canvas-base text-pine-deep'
                : 'bg-red-600 text-white hover:bg-red-700'
            }`}
            id="btn-gate-toggle"
            type="button"
            onClick={props.onToggleGate}
          >
            {props.shiftInfo.isGateOpen ? (
              <>
                <DoorClosed className="text-error size-5" />
                <span>{t('btn_close_gate')}</span>
              </>
            ) : (
              <>
                <DoorOpen className="size-5 text-white" />
                <span>{t('btn_open_gate')}</span>
              </>
            )}
          </button>

          <button
            className="hover:bg-amber-hover flex h-11 items-center gap-2 rounded-xl bg-amber-gold px-5 text-sm font-bold text-pine-deep shadow-md transition-all duration-150"
            id="btn-alert-bell"
            type="button"
            onClick={props.onRingBell}
          >
            <BellRing className="size-5" />
            <span>{t('btn_sound_bell')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
