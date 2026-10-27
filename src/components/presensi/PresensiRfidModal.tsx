'use client';

import { useTranslations } from 'next-intl';

/**
 * Simulated NFC reader dialog of the login screen. There is no reader to talk to yet, so the dialog
 * only shows the waiting state the mock ships.
 *
 * shortcut: replace the static wait line with the reader bridge once the NFC device API is wired.
 *
 * @param props - Close handler.
 * @returns Modal overlay.
 */
export function PresensiRfidModal(props: { onClose: () => void }) {
  const t = useTranslations('PresensiPage');

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-primary/40 p-margin backdrop-blur-sm">
      <div
        aria-labelledby="rfid-title"
        aria-modal="true"
        className="relative flex w-full max-w-sm animate-in flex-col items-center rounded-xl bg-surface-card p-space-xl text-center shadow-xl duration-150 zoom-in-95 fade-in"
        onKeyDown={(event) => {
          if (event.key === 'Escape') {
            props.onClose();
          }
        }}
        role="dialog"
        tabIndex={-1}
      >
        <button
          aria-label={t('modal_close')}
          className="absolute top-space-md right-space-md text-text-muted hover:text-text-primary"
          onClick={props.onClose}
          type="button"
        >
          <span className="material-symbols-outlined">close</span>
        </button>

        <div className="relative mb-space-md flex size-16 items-center justify-center rounded-full bg-pine-light text-pine-deep">
          <span className="material-symbols-outlined animate-bounce text-3xl">contactless</span>
          <span className="absolute inset-0 animate-ping rounded-full border-2 border-pine-deep/30" />
        </div>

        <h3 className="mb-1 font-headline-sm text-headline-sm text-text-primary">
          {t('rfid_title')}
        </h3>
        <p className="mb-space-lg font-body-md text-body-md text-text-muted">{t('rfid_body')}</p>

        <div className="flex w-full items-center justify-center gap-space-xs rounded-lg bg-canvas-base p-space-md font-caption text-caption text-text-muted">
          <span className="size-2 rounded-full bg-status-active" />
          {t('rfid_waiting')}
        </div>

        <button
          className="mt-space-md w-full py-2 font-label-md text-label-md text-text-muted hover:text-text-primary"
          onClick={props.onClose}
          type="button"
        >
          {t('rfid_cancel')}
        </button>
      </div>
    </div>
  );
}
