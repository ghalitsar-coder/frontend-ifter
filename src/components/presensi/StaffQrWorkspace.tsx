'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import { PresensiNotice } from '@/components/presensi/PresensiNotice';
import { StaffQrCodePanel } from '@/components/presensi/StaffQrCodePanel';
import { StaffQrSessionForm } from '@/components/presensi/StaffQrSessionForm';
import { Button } from '@/components/ui/button';
import {
  closeStaffQrSession,
  createStaffQrSession,
  getActiveStaffQrSession,
  getStaffQrCode,
  PresensiApiError,
} from '@/services/presensiApi';

const QR_QUERY_KEY = ['staff-qr-code'] as const;
const ACTIVE_SESSION_QUERY_KEY = ['staff-qr-session'] as const;

/**
 * Restore the school's open QR session and display its current signed code.
 * @returns Session settings and the rotating staff QR code.
 */
export function StaffQrWorkspace() {
  const t = useTranslations('StaffQrPage');
  const queryClient = useQueryClient();
  const [notice, setNotice] = useState('');
  const activeSession = useQuery({
    queryKey: ACTIVE_SESSION_QUERY_KEY,
    queryFn: getActiveStaffQrSession,
    gcTime: 0,
    refetchInterval: 15_000,
    retry: false,
  });
  const session = activeSession.data ?? null;
  const code = useQuery({
    enabled: session?.status === 'aktif',
    queryFn: async () => await getStaffQrCode(session?.id ?? 0),
    queryKey: [...QR_QUERY_KEY, session?.id],
    gcTime: 0,
    refetchInterval: 3000,
    retry: false,
  });
  const validCode =
    !code.isError &&
    code.data !== undefined &&
    code.data.session_id === session?.id &&
    Date.parse(code.data.valid_until) > code.dataUpdatedAt
      ? code.data
      : undefined;
  let codeErrorMessage = t('code_unavailable');
  if (code.error instanceof PresensiApiError && code.error.code === 'outside_window') {
    codeErrorMessage = t('error_window');
  } else if (code.error instanceof PresensiApiError && code.error.code === 'session_closed') {
    codeErrorMessage = t('error_session_closed');
  }
  const create = useMutation({
    mutationFn: createStaffQrSession,
    onError: (error) => {
      setNotice(
        error instanceof PresensiApiError && error.code === 'session_exists'
          ? t('error_exists')
          : t('error_generic'),
      );
      if (error instanceof PresensiApiError && error.code === 'session_exists') {
        void activeSession.refetch();
      }
    },
    onSuccess: (created) => {
      queryClient.setQueryData(ACTIVE_SESSION_QUERY_KEY, created);
      setNotice('');
      void queryClient.invalidateQueries({ queryKey: QR_QUERY_KEY });
    },
  });
  const close = useMutation({
    mutationFn: closeStaffQrSession,
    onError: () => {
      setNotice(t('error_generic'));
    },
    onSuccess: () => {
      queryClient.setQueryData(ACTIVE_SESSION_QUERY_KEY, null);
      void queryClient.invalidateQueries({ queryKey: ACTIVE_SESSION_QUERY_KEY });
      setNotice(t('closed'));
    },
  });
  if (activeSession.isPending) {
    return <PresensiNotice state="loading" text={t('loading_session')} />;
  }
  if (activeSession.isError) {
    return (
      <section className="mx-auto max-w-6xl space-y-4">
        <PresensiNotice state="error" text={t('error_session_load')} />
        <Button
          onClick={() => {
            void activeSession.refetch();
          }}
          variant="outline"
        >
          {t('reload_session')}
        </Button>
      </section>
    );
  }
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
        <StaffQrSessionForm
          session={session}
          pending={create.isPending}
          notice={notice}
          onCreate={(input) => {
            setNotice('');
            create.mutate(input);
          }}
        />
        <StaffQrCodePanel
          session={session}
          code={validCode}
          error={code.isError ? codeErrorMessage : null}
          closing={close.isPending}
          onClose={(id) => {
            close.mutate(id);
          }}
        />
      </div>
    </section>
  );
}
