import { PresensiSpinner } from '@/components/presensi/PresensiSpinner';

/**
 * Loading strip shown while the session is restored.
 *
 * @param props - Already-translated text.
 * @returns Bordered notice row.
 */
export function PresensiNotice(props: { text: string }) {
  return (
    <div className="flex items-center gap-2.5 rounded-2xl border-[1.5px] border-border-control bg-surface-container-low px-4 py-3.5 font-caption text-caption font-semibold text-on-surface-variant">
      <PresensiSpinner className="size-4 shrink-0" />
      <span>{props.text}</span>
    </div>
  );
}
