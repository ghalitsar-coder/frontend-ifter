import { useTranslations } from 'next-intl';
import Image from 'next/image';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import type { StaffQrCode, StaffQrSession } from '@/services/presensiApi';

/**
 * Display a fresh backend QR code while its session remains open.
 * @param props - Session, current code, query error and close action.
 * @returns The rotating code panel or empty state.
 */
export function StaffQrCodePanel(props: {
  session: StaffQrSession | null;
  code: StaffQrCode | undefined;
  error: string | null;
  closing: boolean;
  onClose: (id: number) => void;
}) {
  const t = useTranslations('StaffQrPage');
  const image = props.code && (
    <Image
      alt={t('qr_alt')}
      className="aspect-square h-auto w-full bg-white [image-rendering:pixelated]"
      src={props.code.image_png}
      width={512}
      height={512}
      unoptimized
    />
  );
  let validityMessage = props.error ?? t('rotation_hint');
  if (props.code) {
    validityMessage = t('valid_until', {
      time: new Intl.DateTimeFormat('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Jakarta',
      }).format(new Date(props.code.valid_until)),
    });
  }
  return (
    <div className="group flex min-h-[440px] flex-col items-center justify-center rounded-2xl border border-border-subtle bg-surface-card p-6 text-center shadow-sm sm:p-8">
      {props.session?.status === 'aktif' ? (
        <>
          <div className="mb-4 flex items-center gap-2 rounded-full bg-status-present/50 px-3 py-1.5 text-xs font-bold text-pine-deep">
            <span className="size-2 animate-pulse rounded-full bg-pine-deep" />{' '}
            {t('session_active', { type: t(props.session.tipe_sesi) })}
          </div>
          <h2 className="font-headline-sm text-xl font-bold text-text-primary">
            {t('scan_title')}
          </h2>
          <p className="mt-1 text-sm text-text-muted">{t('scan_hint')}</p>
          {image ? (
            <Dialog>
              <div className="mt-5 w-full max-w-[346px] rounded-2xl border border-border-subtle bg-white p-3 group-has-aria-expanded:invisible">
                {image}
              </div>
              <DialogTrigger className="mb-2 inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-pine-deep">
                <MaterialIcon name="zoom_out_map" /> {t('enlarge_code')}
              </DialogTrigger>
              <DialogContent
                className="w-[min(96vw,82dvh)] max-w-none bg-white sm:max-w-none"
                showCloseButton={false}
              >
                <DialogTitle className="sr-only">{t('qr_alt')}</DialogTitle>
                {image}
                <DialogClose className="min-h-11 rounded-lg border border-border-control text-sm font-semibold">
                  {t('close_enlarged_code')}
                </DialogClose>
              </DialogContent>
            </Dialog>
          ) : (
            <div className="my-5 flex size-64 items-center justify-center rounded-2xl bg-canvas-base text-sm text-text-muted">
              {props.error ?? t('loading_code')}
            </div>
          )}
          <p className="text-xs text-text-muted">{validityMessage}</p>
          <button
            className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl border border-error/30 px-5 text-sm font-semibold text-error hover:bg-error/5 disabled:opacity-60"
            disabled={props.closing}
            onClick={() => {
              if (props.session !== null) {
                props.onClose(props.session.id);
              }
            }}
            type="button"
          >
            <MaterialIcon name="stop_circle" /> {props.closing ? t('closing') : t('close_session')}
          </button>
        </>
      ) : (
        <>
          <div className="mb-5 flex size-24 items-center justify-center rounded-3xl bg-pine-light text-pine-deep">
            <MaterialIcon className="text-[52px]" name="qr_code_2" />
          </div>
          <h2 className="font-headline-sm text-xl font-bold text-text-primary">
            {t('empty_title')}
          </h2>
          <p className="mt-2 max-w-sm text-sm leading-relaxed text-text-muted">
            {t('empty_description')}
          </p>
        </>
      )}
    </div>
  );
}
