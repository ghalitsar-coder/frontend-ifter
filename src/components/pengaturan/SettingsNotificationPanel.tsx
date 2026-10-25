import { MessageCircle, Send, Smartphone } from 'lucide-react';
import { useTranslations } from 'next-intl';
// shortcut: no backend endpoint for the WhatsApp gateway/templates, keep mock
import type { NotificationPolicy } from '@/types/settings';

const SAMPLE_VALUES: Record<string, string> = {
  '{nama_siswa}': 'Aisyah Putri Ramadhani',
  '{kelas}': 'X IPA 2',
  '{jam_absen}': '06:48',
  '{total_poin}': '32',
  '{tanggal_sidang}': 'Senin, 3 November 2026',
};

/**
 * Replace template placeholders with sample values for the live preview.
 *
 * @param template - Raw WhatsApp template.
 * @returns Template with placeholders substituted.
 */
function renderPreview(template: string) {
  let text = template;

  for (const [token, value] of Object.entries(SAMPLE_VALUES)) {
    text = text.split(token).join(value);
  }

  return text;
}

/**
 * WhatsApp gateway status, auto-send switch, and message template editor.
 *
 * @param props - Component properties.
 * @returns Notification policy card.
 */
export function SettingsNotificationPanel(props: {
  policy: NotificationPolicy;
  onChange: (patch: Partial<NotificationPolicy>) => void;
  onSendExample: (kind: 'check_in' | 'sanction') => void;
}) {
  const t = useTranslations('SettingsPage');

  const templates = [
    {
      key: 'checkInTemplate',
      labelKey: 'template_check_in',
      hintKey: 'template_check_in_hint',
      kind: 'check_in',
    },
    {
      key: 'sanctionTemplate',
      labelKey: 'template_sanction',
      hintKey: 'template_sanction_hint',
      kind: 'sanction',
    },
  ] as const;

  return (
    <section className="space-y-4">
      <div className="flex flex-col justify-between gap-4 rounded-2xl border border-pine-light bg-pine-light/50 p-5 sm:flex-row sm:items-center">
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-deep text-amber-gold">
            <MessageCircle className="size-5" />
          </div>
          <div>
            <p className="text-sm font-bold text-pine-deep">{t('gateway_title')}</p>
            <p className="text-[11px] text-muted-foreground">{t('gateway_desc')}</p>
            <p className="mt-1 inline-flex items-center gap-1.5 rounded-full bg-card px-2 py-0.5 text-[10px] font-bold text-emerald-700">
              <span className="size-1.5 rounded-full bg-emerald-600" />
              {t('gateway_quota', { count: props.policy.gatewayQuota })}
            </p>
          </div>
        </div>

        <label className="flex shrink-0 cursor-pointer items-center gap-2.5 rounded-xl border border-border-control bg-card px-3 py-2">
          <span className="text-xs font-semibold text-pine-deep">{t('field_auto_send')}</span>
          <input
            type="checkbox"
            checked={props.policy.autoSendOnCheckIn}
            onChange={(e) => {
              props.onChange({ autoSendOnCheckIn: e.target.checked });
            }}
            className="size-4 cursor-pointer accent-pine-deep"
          />
        </label>
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {templates.map((template) => (
          <div
            key={template.key}
            className="flex flex-col gap-2 rounded-2xl border border-border-control bg-card p-5 shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="text-xs font-bold text-pine-deep">{t(template.labelKey)}</h3>
                <p className="text-[10px] text-muted-foreground">{t(template.hintKey)}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  props.onSendExample(template.kind);
                }}
                className="inline-flex shrink-0 cursor-pointer items-center gap-1.5 rounded-lg border border-border-control px-2.5 py-1.5 text-[11px] font-semibold text-pine-deep transition-colors hover:bg-pine-light"
              >
                <Send className="size-3" />
                <span>{t('btn_send_example')}</span>
              </button>
            </div>

            <textarea
              rows={5}
              value={props.policy[template.key]}
              onChange={(e) => {
                props.onChange({ [template.key]: e.target.value });
              }}
              className="w-full resize-y rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-[11px] leading-relaxed text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none"
            />

            <div className="rounded-xl border border-border-subtle bg-surface-container-low p-3">
              <p className="mb-1 flex items-center gap-1.5 text-[10px] font-bold tracking-wider text-muted-foreground uppercase">
                <Smartphone className="size-3" />
                {t('preview_label')}
              </p>
              <p className="text-[11px] leading-relaxed text-foreground">
                {renderPreview(props.policy[template.key])}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
