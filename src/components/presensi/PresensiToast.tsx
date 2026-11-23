'use client';

/**
 * Confirmation toast that mirrors the Stitch save feedback popover.
 *
 * @param props - Toast copy and visibility.
 * @returns Fixed toast element.
 */
export function PresensiToast(props: {
  title: string;
  description: string;
  visible: boolean;
  late?: boolean;
}) {
  return (
    <output
      className={`fixed top-20 right-6 z-50 flex transform items-center gap-3 rounded-2xl border px-5 py-3.5 shadow-xl transition-all duration-300 ${props.late ? 'border-amber-gold bg-amber-surface text-amber-dark' : 'border-status-present bg-pine-deep text-surface'} ${
        props.visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-5 opacity-0'
      }`}
    >
      <span aria-hidden className="material-symbols-outlined text-[24px]">
        {props.late ? 'schedule' : 'verified'}
      </span>
      <span className="flex flex-col">
        <span className="font-label-md text-label-md font-bold">{props.title}</span>
        <span className="font-caption text-caption">{props.description}</span>
      </span>
    </output>
  );
}
