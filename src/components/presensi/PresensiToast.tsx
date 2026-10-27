'use client';

/**
 * Confirmation toast that mirrors the Stitch save feedback popover.
 *
 * @param props - Toast copy and visibility.
 * @returns Fixed toast element.
 */
export function PresensiToast(props: { title: string; description: string; visible: boolean }) {
  return (
    <div
      className={`fixed top-20 right-6 z-50 flex transform items-center gap-3 rounded-2xl border border-status-present bg-pine-deep px-5 py-3.5 text-surface shadow-xl transition-all duration-300 ${
        props.visible ? 'translate-y-0 opacity-100' : 'pointer-events-none -translate-y-5 opacity-0'
      }`}
      role="status"
    >
      <span className="material-symbols-outlined text-[24px] text-amber-gold">verified</span>
      <div className="flex flex-col">
        <span className="font-label-md text-label-md font-bold">{props.title}</span>
        <span className="font-caption text-caption text-emerald-100">{props.description}</span>
      </div>
    </div>
  );
}
