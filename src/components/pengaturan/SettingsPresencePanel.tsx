import { Building2, Clock, DoorOpen, Globe2, LogOut, Timer, TriangleAlert } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { PresencePolicy } from '@/types/settings';

/**
 * Gate attendance window editor with the morning timeline summary.
 *
 * @param props - Component properties.
 * @returns Presence policy card.
 */
export function SettingsPresencePanel(props: {
  policy: PresencePolicy;
  onChange: (patch: Partial<PresencePolicy>) => void;
}) {
  const t = useTranslations('SettingsPage');

  const timeFields = [
    { key: 'gateOpen', labelKey: 'field_gate_open', hintKey: 'hint_gate_open', icon: DoorOpen },
    { key: 'onTimeUntil', labelKey: 'field_on_time', hintKey: 'hint_on_time', icon: Clock },
    {
      key: 'dismissalWeekday',
      labelKey: 'field_dismissal_weekday',
      hintKey: 'hint_dismissal',
      icon: LogOut,
    },
    {
      key: 'dismissalFriday',
      labelKey: 'field_dismissal_friday',
      hintKey: 'hint_dismissal',
      icon: LogOut,
    },
  ] as const;

  return (
    <section className="rounded-2xl border border-border-control bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <Clock className="size-4 text-pine-deep" />
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">{t('presence_title')}</h2>
        </div>
        <span className="rounded-full bg-pine-light px-2.5 py-0.5 text-[11px] font-bold text-pine-deep">
          {t('status_active')}
        </span>
      </div>

      <div className="mb-4 rounded-xl border border-border-subtle bg-surface-container-low p-3">
        <p className="mb-2 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
          {t('timeline_label')}
        </p>
        <div className="flex overflow-hidden rounded-lg text-[10px] font-semibold">
          <div className="flex-1 bg-pine-light px-2 py-1.5 text-pine-deep">
            {t('timeline_on_time')} ({props.policy.gateOpen} - {props.policy.onTimeUntil})
          </div>
          <div className="flex-1 bg-amber-gold/40 px-2 py-1.5 text-amber-dark">
            {t('timeline_late')}
          </div>
          <div className="flex-1 bg-rose-200 px-2 py-1.5 text-rose-800">{t('timeline_closed')}</div>
        </div>
      </div>

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label
            htmlFor="presence-school-name"
            className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground"
          >
            <Building2 className="size-3.5 text-muted-foreground" />
            Nama Sekolah
          </label>
          <input
            id="presence-school-name"
            type="text"
            maxLength={150}
            value={props.policy.schoolName ?? ''}
            onChange={(e) => {
              props.onChange({ schoolName: e.target.value });
            }}
            className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">
            Tampil pada dokumen dan rekap absensi sekolah.
          </p>
        </div>

        <div>
          <label
            htmlFor="presence-timezone"
            className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground"
          >
            <Globe2 className="size-3.5 text-muted-foreground" />
            Zona Waktu
          </label>
          <input
            id="presence-timezone"
            type="text"
            list="presence-timezone-options"
            value={props.policy.timezone ?? ''}
            placeholder="Asia/Jakarta"
            onChange={(e) => {
              props.onChange({ timezone: e.target.value });
            }}
            className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
          />
          <datalist id="presence-timezone-options" aria-label="Pilihan zona waktu Indonesia">
            <option value="Asia/Jakarta">WIB — Asia/Jakarta</option>
            <option value="Asia/Makassar">WITA — Asia/Makassar</option>
            <option value="Asia/Jayapura">WIT — Asia/Jayapura</option>
          </datalist>
          <p className="mt-1 text-[10px] text-muted-foreground">
            Nama zona IANA, dipakai server saat menilai jam absensi.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {timeFields.map((field) => {
          const Icon = field.icon;
          return (
            <div key={field.key}>
              <label
                htmlFor={`presence-${field.key}`}
                className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground"
              >
                <Icon className="size-3.5 text-muted-foreground" />
                {t(field.labelKey)}
              </label>
              <input
                id={`presence-${field.key}`}
                type="time"
                value={props.policy[field.key]}
                onChange={(e) => {
                  props.onChange({ [field.key]: e.target.value });
                }}
                className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
              />
              <p className="mt-1 text-[10px] text-muted-foreground">{t(field.hintKey)}</p>
            </div>
          );
        })}

        <div>
          <label
            htmlFor="presence-tolerance"
            className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground"
          >
            <Timer className="size-3.5 text-muted-foreground" />
            {t('field_late_tolerance')}
          </label>
          <input
            id="presence-tolerance"
            type="number"
            min={0}
            max={60}
            value={props.policy.lateToleranceMinutes}
            onChange={(e) => {
              props.onChange({ lateToleranceMinutes: Number(e.target.value) });
            }}
            className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
          />
          <p className="mt-1 text-[10px] text-amber-dark">{t('hint_late_tolerance')}</p>
        </div>

        <div>
          <label
            htmlFor="presence-gate-close"
            className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-foreground"
          >
            <TriangleAlert className="size-3.5 text-muted-foreground" />
            {t('field_gate_close')}
          </label>
          <input
            id="presence-gate-close"
            type="time"
            value={props.policy.gateClose}
            onChange={(e) => {
              props.onChange({ gateClose: e.target.value });
            }}
            className="h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm"
          />
          <p className="mt-1 text-[10px] text-muted-foreground">{t('hint_gate_close')}</p>
        </div>
      </div>

      <p className="mt-4 rounded-xl border border-amber-gold/40 bg-amber-surface px-3 py-2 text-[11px] leading-relaxed text-amber-dark">
        {t('presence_warning')}
      </p>
    </section>
  );
}
