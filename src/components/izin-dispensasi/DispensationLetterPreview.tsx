import { BadgeCheck, Download, LockKeyhole } from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { DispensationEvent, DispensationStudent } from '@/types/dispensation';

/**
 * Official letterhead preview with digital verification footer.
 *
 * @param props - Student, event, and download handler.
 * @returns Letter preview card.
 */
export function DispensationLetterPreview(props: {
  student: DispensationStudent;
  event: DispensationEvent;
  onDownload: () => void;
}) {
  const t = useTranslations('DispensationPage');
  const letterRows = [
    { label: t('letter_name'), value: props.student.name },
    {
      label: t('letter_nisn'),
      value: `${props.student.nisn} / ${props.student.className}`,
    },
    { label: t('letter_task'), value: props.event.taskLine },
    { label: t('letter_period'), value: props.event.periodLabel },
  ];

  return (
    <aside className="rounded-2xl border border-border-subtle bg-card p-4 shadow-xs">
      <div className="flex items-center justify-between gap-2">
        <h2 className="inline-flex items-center gap-1.5 text-xs font-extrabold tracking-tight text-foreground">
          <BadgeCheck className="size-3.5 text-pine-deep" />
          {t('preview_title')}
        </h2>
        <span className="rounded-full bg-pine-light px-2 py-0.5 text-[8px] font-extrabold tracking-wide text-pine-deep uppercase">
          {t('preview_valid')}
        </span>
      </div>

      <div className="mt-3 rounded-xl border border-border-subtle bg-white p-4 font-serif text-[9px] leading-relaxed text-foreground shadow-inner">
        <div className="text-center">
          <p className="text-[10px] font-bold tracking-wide uppercase">
            {t('letterhead_government')}
          </p>
          <p className="font-semibold uppercase">{t('letterhead_department')}</p>
          <p className="font-semibold uppercase">{props.student.school}</p>
          <p className="mt-0.5 text-[7.5px] text-muted-foreground">{t('letterhead_address')}</p>
        </div>

        <div className="my-2.5 border-t-2 border-double border-foreground/40" />

        <div className="text-center">
          <p className="text-[10px] font-bold tracking-wide uppercase">{t('letterhead_title')}</p>
          <p className="text-[8px]">
            {t('letterhead_number', { number: props.event.letterNumber })}
          </p>
        </div>

        <p className="mt-2.5 text-[8.5px]">{t('letter_intro')}</p>

        <table className="mt-2 w-full border-collapse text-[8.5px]">
          <tbody>
            {letterRows.map((row) => (
              <tr key={row.label}>
                <td className="w-20 py-0.5 align-top">{row.label}</td>
                <td className="w-2 py-0.5 align-top">:</td>
                <td className="py-0.5 align-top font-semibold">{row.value}</td>
              </tr>
            ))}
          </tbody>
        </table>

        <p className="mt-2 text-[8px] leading-relaxed">{t('letter_body')}</p>

        <div className="mt-2 flex justify-between gap-2 text-[8px]">
          <div>
            <p className="text-[7px] text-muted-foreground">{t('letter_digital_id')}</p>
            <p className="font-mono text-[7.5px] font-bold">{props.event.digitalId}</p>
            <p className="text-[6.5px] text-muted-foreground">
              {t('letter_recorded', { time: props.event.recordedAt })}
            </p>
          </div>
          <div className="flex items-end">
            <span className="flex size-14 -rotate-12 items-center justify-center rounded-full border-2 border-pine-deep/40 text-center text-[6px] leading-tight font-bold tracking-wide text-pine-deep/50 uppercase">
              {t('letter_stamp')}
            </span>
          </div>
        </div>

        <div className="mt-3 text-right text-[8px]">
          <p>{props.event.letterPlaceDate}</p>
          <p>{t('letter_headmaster_role')}</p>
          <p className="mt-5 font-bold underline underline-offset-2">{props.event.headmaster}</p>
          <p className="text-[7.5px] text-muted-foreground">{props.event.headmasterNip}</p>
        </div>
      </div>

      <p className="mt-2 inline-flex items-center gap-1 text-[8px] text-muted-foreground">
        <LockKeyhole className="size-2.5 text-pine-deep" />
        {t('preview_encrypted')}
      </p>

      <button
        type="button"
        onClick={props.onDownload}
        className="mt-1.5 flex w-full cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-pine-deep px-3 py-2 text-[10px] font-bold text-white transition-colors hover:bg-pine-hover"
      >
        <Download className="size-3 text-amber-gold" />
        {t('preview_download')}
      </button>
    </aside>
  );
}
