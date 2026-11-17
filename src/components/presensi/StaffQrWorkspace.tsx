'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import {
  closeStaffQrSession,
  createStaffQrSession,
  getStaffQrCode,
  PresensiApiError,
} from '@/services/presensiApi';
import type { CreateStaffQrSessionInput, StaffQrSession } from '@/services/presensiApi';

const QR_QUERY_KEY = ['staff-qr-code'] as const;

function today(): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${values.year}-${values.month}-${values.day}`;
}

export function StaffQrWorkspace() {
  const t = useTranslations('StaffQrPage');
  const queryClient = useQueryClient();
  const [session, setSession] = useState<StaffQrSession | null>(null);
  const [type, setType] = useState<CreateStaffQrSessionInput['tipe_sesi']>('masuk');
  const [date, setDate] = useState(today);
  const [openAt, setOpenAt] = useState('06:30');
  const [closeAt, setCloseAt] = useState('08:00');
  const [lateAfter, setLateAfter] = useState('07:00');
  const [notice, setNotice] = useState('');

  const code = useQuery({
    enabled: session?.status === 'aktif',
    queryFn:  async () => getStaffQrCode(session?.id ?? 0),
    queryKey: [...QR_QUERY_KEY, session?.id],
    refetchInterval: 3000,
    retry: false,
  });
  const validCode =
    code.data !== undefined && Date.parse(code.data.valid_until) > Date.now()
      ? code.data
      : undefined;
  const codeErrorMessage =
    code.error instanceof PresensiApiError
      ? code.error.code === 'outside_window'
        ? t('error_window')
        : code.error.code === 'session_closed'
          ? t('error_session_closed')
          : t('code_unavailable')
      : t('code_unavailable');

  const create = useMutation({
    mutationFn: createStaffQrSession,
    onError: (error) => {
      setNotice(
        error instanceof PresensiApiError && error.code === 'session_exists'
          ? t('error_exists')
          : t('error_generic'),
      );
    },
    onSuccess: (created) => {
      setSession(created);
      setNotice('');
      void queryClient.invalidateQueries({ queryKey: QR_QUERY_KEY });
    },
  });

  const close = useMutation({
    mutationFn: closeStaffQrSession,
    onError: () =>{  setNotice(t('error_generic')); },
    onSuccess: () => {
      setSession((current) => (current === null ? null : { ...current, status: 'selesai' }));
      setNotice(t('closed'));
    },
  });

  const submit = (event: React.SubmitEvent<HTMLFormElement>) => {
    event.preventDefault();
    setNotice('');
    const input: CreateStaffQrSessionInput = {
      jam_buka: openAt,
      jam_tutup: closeAt,
      rotasi_detik: 30,
      tanggal: date,
      tipe_sesi: type,
      ...(type === 'masuk' && lateAfter ? { batas_terlambat: lateAfter } : {}),
    };
    create.mutate(input);
  };

  return (
    <section className="mx-auto w-full max-w-6xl space-y-6">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="mb-2 flex items-center gap-2 font-eyebrow text-xs font-bold tracking-[0.16em] text-amber-dark uppercase">
            <MaterialIcon name="qr_code_2" /> {t('eyebrow')}
          </p>
          <h1 className="font-headline-lg text-3xl font-bold text-text-primary">{t('title')}</h1>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-text-muted">
            {t('description')}
          </p>
        </div>
        <span className="inline-flex w-fit items-center gap-2 rounded-full bg-status-present/50 px-3 py-1.5 text-xs font-semibold text-pine-deep">
          <span className="size-2 rounded-full bg-pine-deep" /> {t('rotation_badge')}
        </span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(360px,1.1fr)]">
        <form
          className="space-y-5 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6"
          onSubmit={submit}
        >
          <div>
            <h2 className="font-headline-sm text-xl font-bold text-text-primary">
              {t('setup_title')}
            </h2>
            <p className="mt-1 text-sm text-text-muted">{t('setup_description')}</p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {(['masuk', 'pulang'] as const).map((value) => (
              <button
                aria-pressed={type === value}
                className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${type === value ? 'border-pine-deep bg-pine-deep text-on-primary' : 'border-border-control bg-canvas-base text-text-primary hover:bg-pine-light'}`}
                key={value}
                onClick={() => {
                  setType(value);
                  setNotice('');
                }}
                type="button"
              >
                <MaterialIcon name={value === 'masuk' ? 'login' : 'logout'} /> {t(value)}
              </button>
            ))}
          </div>

          <label className="block space-y-1.5 text-sm font-semibold text-text-primary">
            {t('date')}
            <input
              className="h-11 w-full rounded-xl border border-border-control bg-canvas-base px-3 font-normal"
              onChange={(event) => {
                setDate(event.target.value);
                setNotice('');
              }}
              required
              type="date"
              value={date}
            />
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5 text-sm font-semibold text-text-primary">
              {t('opens')}
              <input
                className="h-11 w-full rounded-xl border border-border-control bg-canvas-base px-3 font-normal"
                onChange={(event) =>{  setOpenAt(event.target.value); }}
                required
                type="time"
                value={openAt}
              />
            </label>
            <label className="block space-y-1.5 text-sm font-semibold text-text-primary">
              {t('closes')}
              <input
                className="h-11 w-full rounded-xl border border-border-control bg-canvas-base px-3 font-normal"
                onChange={(event) =>{  setCloseAt(event.target.value); }}
                required
                type="time"
                value={closeAt}
              />
            </label>
          </div>
          <p className="-mt-3 text-xs text-text-muted">{t('timezone_hint')}</p>

          {type === 'masuk' ? (
            <label className="block space-y-1.5 text-sm font-semibold text-text-primary">
              {t('late_after')}
              <input
                className="h-11 w-full rounded-xl border border-border-control bg-canvas-base px-3 font-normal"
                onChange={(event) =>{  setLateAfter(event.target.value); }}
                type="time"
                value={lateAfter}
              />
              <span className="block text-xs font-normal text-text-muted">{t('late_hint')}</span>
            </label>
          ) : null}

          {notice ? (
            <p
              aria-live="polite"
              className="rounded-lg bg-amber-surface px-3 py-2 text-sm text-amber-dark"
            >
              {notice}
            </p>
          ) : null}

          <button
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-pine-deep px-4 text-sm font-bold text-on-primary transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
            disabled={create.isPending || session?.status === 'aktif'}
            type="submit"
          >
            <MaterialIcon name="qr_code_2" /> {create.isPending ? t('creating') : t('create')}
          </button>
        </form>

        <div className="flex min-h-[440px] flex-col items-center justify-center rounded-2xl border border-border-subtle bg-surface-card p-6 text-center shadow-sm sm:p-8">
          {session?.status === 'aktif' ? (
            <>
              <div className="mb-4 flex items-center gap-2 rounded-full bg-status-present/50 px-3 py-1.5 text-xs font-bold text-pine-deep">
                <span className="size-2 animate-pulse rounded-full bg-pine-deep" />{' '}
                {t('session_active', { type: t(session.tipe_sesi) })}
              </div>
              <h2 className="font-headline-sm text-xl font-bold text-text-primary">
                {t('scan_title')}
              </h2>
              <p className="mt-1 text-sm text-text-muted">{t('scan_hint')}</p>
              {validCode ? (
                <div className="my-5 rounded-2xl border border-border-subtle bg-white p-3 shadow-inner">
                  {/* The QR image is generated and signed by the backend. */}
                  <img alt={t('qr_alt')} className="size-64 max-w-full" src={validCode.image_png} />
                </div>
              ) : (
                <div className="my-5 flex size-64 items-center justify-center rounded-2xl bg-canvas-base text-sm text-text-muted">
                  {code.isError ? codeErrorMessage : t('loading_code')}
                </div>
              )}
              <p className="text-xs text-text-muted">
                {validCode
                  ? t('valid_until', {
                      time: new Intl.DateTimeFormat(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      }).format(new Date(validCode.valid_until)),
                    })
                  : (code.isError
                    ? codeErrorMessage
                    : t('rotation_hint'))}
              </p>
              <button
                className="mt-6 flex h-11 items-center justify-center gap-2 rounded-xl border border-error/30 px-5 text-sm font-semibold text-error hover:bg-error/5 disabled:opacity-60"
                disabled={close.isPending}
                onClick={() =>{  close.mutate(session.id); }}
                type="button"
              >
                <MaterialIcon name="stop_circle" />{' '}
                {close.isPending ? t('closing') : t('close_session')}
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
      </div>
    </section>
  );
}
