'use client';

import type { IScannerControls } from '@zxing/browser';
import { useTranslations } from 'next-intl';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import { Button } from '@/components/ui/button';
import { Link } from '@/libs/I18nNavigation';
import { PresensiApiError, scanStaffQr } from '@/services/presensiApi';
import type { StaffQrScanResult } from '@/services/presensiApi';

type ScanErrorKey =
  | 'error_already_scanned'
  | 'error_check_in_required'
  | 'error_forbidden'
  | 'error_generic'
  | 'error_invalid_qr'
  | 'error_not_found'
  | 'error_outside_window'
  | 'error_session_closed'
  | 'error_unauthorized';

type CameraErrorKey = 'camera_denied' | 'camera_missing' | 'camera_unavailable';

function scanErrorKey(error: unknown): ScanErrorKey {
  if (!(error instanceof PresensiApiError)) {
    return 'error_generic';
  }

  switch (error.code) {
    case 'already_scanned': {
      return 'error_already_scanned';
    }
    case 'check_in_required': {
      return 'error_check_in_required';
    }
    case 'forbidden': {
      return 'error_forbidden';
    }
    case 'invalid_qr': {
      return 'error_invalid_qr';
    }
    case 'not_found': {
      return 'error_not_found';
    }
    case 'outside_window': {
      return 'error_outside_window';
    }
    case 'session_closed': {
      return 'error_session_closed';
    }
    case 'unauthorized': {
      return 'error_unauthorized';
    }
    default: {
      return 'error_generic';
    }
  }
}

function cameraErrorKey(error: unknown): CameraErrorKey {
  const name = error instanceof Error ? error.name : '';

  if (name === 'NotAllowedError' || name === 'PermissionDeniedError') {
    return 'camera_denied';
  }

  if (name === 'NotFoundError' || name === 'DevicesNotFoundError') {
    return 'camera_missing';
  }

  return 'camera_unavailable';
}

function formatScanTime(value: string): string {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Jakarta',
  }).format(new Date(value));
}

/**
 * Scan a TU-issued staff attendance QR and display the backend result.
 * @returns Camera and image scanner with attendance confirmation.
 */
export function StaffQrScanWorkspace() {
  const t = useTranslations('StaffQrScanPage');
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const controlsRef = useRef<IScannerControls | null>(null);
  const scanHandledRef = useRef(false);
  const [scanning, setScanning] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [cameraError, setCameraError] = useState('');
  const [scanError, setScanError] = useState('');
  const [result, setResult] = useState<StaffQrScanResult | null>(null);

  const submitPayload = async (payload: string) => {
    setSubmitting(true);
    setScanError('');
    setResult(null);
    await scanStaffQr(payload)
      .then(setResult)
      .catch((error: unknown) => {
        const messages = {
          error_already_scanned: t('error_already_scanned'),
          error_check_in_required: t('error_check_in_required'),
          error_forbidden: t('error_forbidden'),
          error_generic: t('error_generic'),
          error_invalid_qr: t('error_invalid_qr'),
          error_not_found: t('error_not_found'),
          error_outside_window: t('error_outside_window'),
          error_session_closed: t('error_session_closed'),
          error_unauthorized: t('error_unauthorized'),
        };
        setScanError(messages[scanErrorKey(error)]);
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  const submitScanPayload = useEffectEvent(submitPayload);

  useEffect(() => {
    const preview = videoRef.current;

    if (!scanning || preview === null) {
      return () => {
        controlsRef.current?.stop();
      };
    }

    let disposed = false;
    let controls: IScannerControls | null = null;

    async function startCamera() {
      try {
        const { BrowserQRCodeReader } = await import('@zxing/browser');

        if (disposed || preview === null) {
          return;
        }

        const reader = new BrowserQRCodeReader();
        const activeControls = await reader.decodeFromConstraints(
          { audio: false, video: { facingMode: { ideal: 'environment' } } },
          preview,
          (decoded, _error, callbackControls) => {
            if (decoded === undefined || scanHandledRef.current) {
              return;
            }

            scanHandledRef.current = true;
            callbackControls.stop();
            controlsRef.current = null;
            setScanning(false);
            void submitScanPayload(decoded.getText());
          },
        );

        controls = activeControls;
        if (disposed) {
          controls.stop();
          return;
        }
        controlsRef.current = controls;
      } catch (error) {
        if (!disposed) {
          const messages = {
            camera_denied: t('camera_denied'),
            camera_missing: t('camera_missing'),
            camera_unavailable: t('camera_unavailable'),
          };
          setCameraError(messages[cameraErrorKey(error)]);
          setScanning(false);
        }
      }
    }

    void startCamera();

    return () => {
      disposed = true;
      controls?.stop();
      controlsRef.current?.stop();
      controlsRef.current = null;
    };
  }, [scanning, t]);

  const startScan = () => {
    scanHandledRef.current = false;
    setCameraError('');
    setScanError('');
    setResult(null);
    setScanning(true);
  };

  const stopScan = () => {
    controlsRef.current?.stop();
    controlsRef.current = null;
    setScanning(false);
  };

  const scanImage = async (file: File) => {
    stopScan();
    setResult(null);
    setCameraError('');
    setScanError('');
    if (!file.type.startsWith('image/') || file.size > 10 * 1024 * 1024) {
      setScanError(t('image_invalid'));
      return;
    }
    setSubmitting(true);
    const imageUrl = URL.createObjectURL(file);
    try {
      const { BrowserQRCodeReader } = await import('@zxing/browser');
      const decoded = await new BrowserQRCodeReader().decodeFromImageUrl(imageUrl);
      await submitPayload(decoded.getText());
    } catch {
      setScanError(t('image_unreadable'));
    } finally {
      URL.revokeObjectURL(imageUrl);
      setSubmitting(false);
    }
  };

  const statusLabels = {
    hadir: t('status_present'),
    terlambat: t('status_late'),
    pulang: t('status_checkout'),
  };
  const sessionLabels = { masuk: t('type_check_in'), pulang: t('type_check_out') };
  let scanLabel = result === null ? t('start_camera') : t('scan_again');
  if (submitting) {
    scanLabel = t('sending');
  }

  return (
    <section className="mx-auto w-full max-w-5xl space-y-6">
      <header>
        <p className="mb-2 flex items-center gap-2 font-eyebrow text-xs font-bold tracking-[0.16em] text-amber-dark uppercase">
          <MaterialIcon name="qr_code_scanner" /> {t('eyebrow')}
        </p>
        <h1 className="font-headline-lg text-3xl font-bold text-text-primary">{t('title')}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">{t('description')}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(300px,0.9fr)]">
        <div
          aria-busy={submitting}
          className="rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6"
        >
          <div className="mb-4 flex items-start justify-between gap-4">
            <div>
              <h2 className="font-headline-sm text-xl font-bold text-text-primary">
                {t('camera_title')}
              </h2>
              <p className="mt-1 text-sm text-text-muted">{t('camera_hint')}</p>
            </div>
            <span
              className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${scanning ? 'bg-status-present/50 text-pine-deep' : 'bg-pine-light text-pine-deep'}`}
            >
              <MaterialIcon name={scanning ? 'videocam' : 'videocam_off'} />
            </span>
          </div>

          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl bg-pine-deep">
            <video
              aria-label={t('camera_preview')}
              className={`size-full object-cover ${scanning ? 'block' : 'hidden'}`}
              muted
              playsInline
              ref={videoRef}
            />
            {scanning ? (
              <div
                aria-hidden
                className="pointer-events-none absolute inset-[12%] rounded-3xl border-2 border-amber-gold/90 shadow-[0_0_0_999px_rgba(13,39,34,0.25)]"
              />
            ) : (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 px-6 text-center text-primary-fixed-dim">
                <span className="flex size-16 items-center justify-center rounded-2xl bg-pine-hover text-amber-gold">
                  <MaterialIcon className="text-[34px]" name="qr_code_2" />
                </span>
                <p className="max-w-xs text-sm">
                  {result ? t('scan_again_hint') : t('camera_idle')}
                </p>
              </div>
            )}
          </div>

          {cameraError ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
            >
              {cameraError}
            </p>
          ) : null}
          {scanError ? (
            <p
              aria-live="polite"
              className="mt-4 rounded-lg bg-error/10 px-3 py-2 text-sm text-error"
            >
              {scanError}
            </p>
          ) : null}
          {scanError === t('error_unauthorized') ? (
            <Link
              className="mt-3 inline-block text-sm font-semibold text-pine-deep underline"
              href="/sign-in"
            >
              {t('sign_in')}
            </Link>
          ) : null}

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {scanning ? (
              <button
                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-border-control px-4 text-sm font-semibold text-text-primary hover:bg-pine-light sm:flex-1"
                onClick={stopScan}
                type="button"
              >
                <MaterialIcon name="stop_circle" /> {t('stop_camera')}
              </button>
            ) : (
              <button
                className="flex h-12 items-center justify-center gap-2 rounded-xl bg-pine-deep px-4 text-sm font-bold text-on-primary transition-colors hover:bg-pine-hover disabled:opacity-60 sm:flex-1"
                disabled={submitting}
                onClick={startScan}
                type="button"
              >
                <MaterialIcon name="qr_code_scanner" /> {scanLabel}
              </button>
            )}
          </div>
          <input
            accept="image/*"
            aria-label={t('upload_image')}
            disabled={submitting || scanning}
            hidden
            id="attendance-qr-image"
            onChange={(event) => {
              const file = event.target.files?.[0];
              event.target.value = '';
              if (file !== undefined) {
                void scanImage(file);
              }
            }}
            ref={imageInputRef}
            type="file"
          />
          <Button
            className="mt-3 h-12 w-full border-border-control text-pine-deep"
            disabled={submitting || scanning}
            onClick={() => {
              imageInputRef.current?.click();
            }}
            variant="outline"
          >
            <MaterialIcon name="upload_file" /> {t('upload_image')}
          </Button>
          <p className="mt-3 text-xs text-text-muted">{t('image_hint')}</p>
          <p className="mt-3 text-xs text-text-muted">{t('secure_context_hint')}</p>
        </div>

        <aside className="space-y-5 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6">
          {result ? (
            <div aria-live="polite" className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl bg-status-present/50 p-4 text-pine-deep">
                <span className="flex size-11 items-center justify-center rounded-full bg-white">
                  <MaterialIcon className="text-[24px]" name="check_circle" />
                </span>
                <div>
                  <p className="font-label-md text-sm font-bold">{t('success_title')}</p>
                  <p className="text-sm">{statusLabels[result.status]}</p>
                </div>
              </div>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-4 border-b border-border-subtle pb-3">
                  <dt className="text-text-muted">{t('session_type')}</dt>
                  <dd className="font-semibold text-text-primary">
                    {sessionLabels[result.tipe_sesi]}
                  </dd>
                </div>
                <div className="flex justify-between gap-4 border-b border-border-subtle pb-3">
                  <dt className="text-text-muted">{t('attendance_date')}</dt>
                  <dd className="font-semibold text-text-primary">{result.tanggal}</dd>
                </div>
                <div className="flex justify-between gap-4">
                  <dt className="text-text-muted">{t('scanned_at')}</dt>
                  <dd className="text-right font-semibold text-text-primary">
                    {formatScanTime(result.waktu_scan)}
                  </dd>
                </div>
              </dl>
            </div>
          ) : (
            <>
              <h2 className="font-headline-sm text-xl font-bold text-text-primary">
                {t('how_title')}
              </h2>
              <ol className="space-y-4 text-sm text-text-muted">
                <li className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-light font-bold text-pine-deep">
                    1
                  </span>
                  <span>{t('step_one')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-light font-bold text-pine-deep">
                    2
                  </span>
                  <span>{t('step_two')}</span>
                </li>
                <li className="flex gap-3">
                  <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-pine-light font-bold text-pine-deep">
                    3
                  </span>
                  <span>{t('step_three')}</span>
                </li>
              </ol>
              <div className="rounded-xl bg-amber-surface p-4 text-sm text-amber-dark">
                <p className="font-semibold">{t('check_in_first_title')}</p>
                <p className="mt-1 leading-relaxed">{t('check_in_first_description')}</p>
              </div>
            </>
          )}
        </aside>
      </div>
    </section>
  );
}
