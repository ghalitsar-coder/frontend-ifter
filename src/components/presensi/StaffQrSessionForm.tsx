import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import type { CreateStaffQrSessionInput, StaffQrSession } from '@/services/presensiApi';

function today() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Jakarta',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date());
}

/**
 * Show the restored session settings or collect settings for a new session.
 * @param props - Session, mutation status, notice and creation handler.
 * @returns The QR session settings form.
 */
export function StaffQrSessionForm(props: {
  session: StaffQrSession | null;
  pending: boolean;
  notice: string;
  onCreate: (input: CreateStaffQrSessionInput) => void;
}) {
  const t = useTranslations('StaffQrPage');
  const [type, setType] = useState<CreateStaffQrSessionInput['tipe_sesi']>('masuk');
  const [date, setDate] = useState(today);
  const [openAt, setOpenAt] = useState('06:30');
  const [closeAt, setCloseAt] = useState('08:00');
  const [lateAfter, setLateAfter] = useState('07:00');
  const selectedType = props.session?.tipe_sesi ?? type;
  return (
    <form
      className="space-y-5 rounded-2xl border border-border-subtle bg-surface-card p-5 shadow-sm sm:p-6"
      onSubmit={(event) => {
        event.preventDefault();
        props.onCreate({
          jam_buka: openAt,
          jam_tutup: closeAt,
          rotasi_detik: 30,
          tanggal: date,
          tipe_sesi: type,
          ...(type === 'masuk' && lateAfter ? { batas_terlambat: lateAfter } : {}),
        });
      }}
    >
      <div>
        <h2 className="font-headline-sm text-xl font-bold text-text-primary">{t('setup_title')}</h2>
        <p className="mt-1 text-sm text-text-muted">{t('setup_description')}</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {(['masuk', 'pulang'] as const).map((value) => (
          <button
            aria-pressed={selectedType === value}
            className={`flex items-center justify-center gap-2 rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${selectedType === value ? 'border-pine-deep bg-pine-deep text-on-primary' : 'border-border-control bg-canvas-base text-text-primary hover:bg-pine-light'}`}
            disabled={props.session !== null || props.pending}
            key={value}
            onClick={() => {
              setType(value);
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
          disabled={props.session !== null || props.pending}
          onChange={(event) => {
            setDate(event.target.value);
          }}
          required
          type="date"
          value={props.session?.tanggal ?? date}
        />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5 text-sm font-semibold text-text-primary">
          {t('opens')}
          <input
            className="h-11 w-full rounded-xl border border-border-control bg-canvas-base px-3 font-normal"
            disabled={props.session !== null || props.pending}
            onChange={(event) => {
              setOpenAt(event.target.value);
            }}
            required
            pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            placeholder="00:00"
            type="text"
            value={props.session?.jam_buka.slice(0, 5) ?? openAt}
          />
        </label>
        <label className="block space-y-1.5 text-sm font-semibold text-text-primary">
          {t('closes')}
          <input
            className="h-11 w-full rounded-xl border border-border-control bg-canvas-base px-3 font-normal"
            disabled={props.session !== null || props.pending}
            onChange={(event) => {
              setCloseAt(event.target.value);
            }}
            required
            pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            placeholder="00:00"
            type="text"
            value={props.session?.jam_tutup.slice(0, 5) ?? closeAt}
          />
        </label>
      </div>
      <p className="-mt-3 text-xs text-text-muted">{t('timezone_hint')}</p>
      {selectedType === 'masuk' ? (
        <label className="block space-y-1.5 text-sm font-semibold text-text-primary">
          {t('late_after')}
          <input
            className="h-11 w-full rounded-xl border border-border-control bg-canvas-base px-3 font-normal"
            disabled={props.session !== null || props.pending}
            onChange={(event) => {
              setLateAfter(event.target.value);
            }}
            pattern="([01][0-9]|2[0-3]):[0-5][0-9]"
            placeholder="00:00"
            type="text"
            value={
              props.session === null
                ? lateAfter
                : (props.session.batas_terlambat?.slice(0, 5) ?? '')
            }
          />
          <span className="block text-xs font-normal text-text-muted">{t('late_hint')}</span>
        </label>
      ) : null}
      {props.notice ? (
        <p
          aria-live="polite"
          className="rounded-lg bg-amber-surface px-3 py-2 text-sm text-amber-dark"
        >
          {props.notice}
        </p>
      ) : null}
      <button
        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-pine-deep px-4 text-sm font-bold text-on-primary transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
        disabled={props.pending || props.session !== null}
        type="submit"
      >
        <MaterialIcon name="qr_code_2" /> {props.pending ? t('creating') : t('create')}
      </button>
    </form>
  );
}
