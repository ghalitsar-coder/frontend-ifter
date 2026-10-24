import { Bell, ShieldCheck } from 'lucide-react';
import { useTranslations } from 'next-intl';

/**
 * Notification channels and standard operating procedures (SOP) panel.
 *
 * @param props - State of notification toggles and callbacks.
 * @returns Notification dispatch section.
 */
export function AttendanceNotificationDispatch(props: {
  sendWhatsApp: boolean;
  onSendWhatsAppChange: (checked: boolean) => void;
  escalateBk: boolean;
  onEscalateBkChange: (checked: boolean) => void;
  syncDapodik: boolean;
  onSyncDapodikChange: (checked: boolean) => void;
}) {
  const t = useTranslations('AttendancePage');

  return (
    <div className="flex flex-col gap-4">
      {/* Automations & Notification Channels */}
      <div className="rounded-2xl border border-border bg-card p-5 shadow-xs">
        <div className="mb-3 flex items-center gap-2">
          <Bell className="size-4 text-foreground" />
          <h2 className="text-base font-semibold text-foreground">{t('notifications_title')}</h2>
        </div>
        <div className="flex flex-col gap-3">
          {/* WhatsApp toggle */}
          {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered from next-intl messages inside the wrapped control group */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-hover-row">
            <input
              type="checkbox"
              checked={props.sendWhatsApp}
              onChange={(e) => {
                props.onSendWhatsAppChange(e.target.checked);
              }}
              className="mt-1 size-4 cursor-pointer rounded text-primary accent-primary"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {t('notif_whatsapp_title')}
              </span>
              <span className="text-xs text-muted-foreground">{t('notif_whatsapp_desc')}</span>
            </div>
          </label>

          {/* BK toggle */}
          {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered from next-intl messages inside the wrapped control group */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-hover-row">
            <input
              type="checkbox"
              checked={props.escalateBk}
              onChange={(e) => {
                props.onEscalateBkChange(e.target.checked);
              }}
              className="mt-1 size-4 cursor-pointer rounded text-primary accent-primary"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">{t('notif_bk_title')}</span>
              <span className="text-xs text-muted-foreground">{t('notif_bk_desc')}</span>
            </div>
          </label>

          {/* Dapodik toggle */}
          {/* oxlint-disable-next-line jsx-a11y/label-has-associated-control -- label text is rendered from next-intl messages inside the wrapped control group */}
          <label className="flex cursor-pointer items-start gap-3 rounded-xl p-2 transition-colors hover:bg-hover-row">
            <input
              type="checkbox"
              checked={props.syncDapodik}
              onChange={(e) => {
                props.onSyncDapodikChange(e.target.checked);
              }}
              className="mt-1 size-4 cursor-pointer rounded text-primary accent-primary"
            />
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-foreground">
                {t('notif_dapodik_title')}
              </span>
              <span className="text-xs text-muted-foreground">{t('notif_dapodik_desc')}</span>
            </div>
          </label>
        </div>
      </div>

      {/* SOP Banner */}
      <div className="flex items-start gap-3 rounded-2xl border border-pastel-mint/60 bg-pastel-mint/40 p-4">
        <div className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-card text-foreground shadow-xs">
          <ShieldCheck className="size-4 text-foreground" />
        </div>
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-foreground">{t('sop_title')}</span>
          <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
            {t('sop_description')}
          </p>
        </div>
      </div>
    </div>
  );
}
