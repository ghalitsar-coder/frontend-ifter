'use client';

import { CalendarOff, Plus, Trash2 } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/api/client';
import {
  formatIsoDayId,
  holidayInputError,
  useCreateHoliday,
  useDeleteHoliday,
  useHolidays,
} from '@/lib/api/pengaturan';
import { can } from '@/lib/api/rbac';

const fieldInput =
  'h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none sm:text-sm';

const mutationError = (error: unknown, fallback: string): string =>
  error instanceof ApiError && error.message !== '' ? error.message : fallback;

/**
 * School holiday calendar backed by GET /attendance/holidays (staff read) and
 * POST/DELETE (admin only). Holidays feed the attendance gate and the daily
 * roster, so they live next to the presence window on the settings page.
 *
 * @returns Holiday calendar card.
 */
export function SettingsHolidayPanel() {
  const { roles } = useAuth();
  const canRead = can(roles, 'attendance_read');
  const canEdit = roles.includes('admin');
  const holidaysQuery = useHolidays();
  const createHoliday = useCreateHoliday();
  const deleteHoliday = useDeleteHoliday();
  const [date, setDate] = useState('');
  const [name, setName] = useState('');
  const [confirmDate, setConfirmDate] = useState<string | null>(null);

  const inputError = holidayInputError({ holiday_date: date, name });
  const holidays = holidaysQuery.data ?? [];

  const handleAdd = () => {
    if (inputError !== null) {
      return;
    }
    createHoliday.mutate(
      { holiday_date: date, name: name.trim() },
      {
        onSuccess: () => {
          setDate('');
          setName('');
        },
      },
    );
  };

  if (!canRead) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border-control bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <CalendarOff className="size-4 text-pine-deep" />
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">Kalender Libur Sekolah</h2>
        </div>
        <span className="rounded-full bg-pine-light px-2.5 py-0.5 text-[11px] font-bold text-pine-deep">
          {holidays.length} hari
        </span>
      </div>

      {canEdit && (
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,150px)_minmax(0,1fr)_auto]">
          <div>
            <label
              htmlFor="holiday-date"
              className="mb-1 block text-[11px] font-bold text-foreground"
            >
              Tanggal
            </label>
            <input
              id="holiday-date"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
              }}
              className={fieldInput}
            />
          </div>
          <div>
            <label
              htmlFor="holiday-name"
              className="mb-1 block text-[11px] font-bold text-foreground"
            >
              Nama Hari Libur
            </label>
            <input
              id="holiday-name"
              type="text"
              maxLength={150}
              value={name}
              placeholder="Contoh: Hari Raya Idul Fitri"
              onChange={(e) => {
                setName(e.target.value);
              }}
              className={fieldInput}
            />
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={inputError !== null || createHoliday.isPending}
            className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-pine-deep px-3 text-xs font-semibold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Plus className="size-3.5" />
            <span>{createHoliday.isPending ? 'Menyimpan…' : 'Tambah Libur'}</span>
          </button>
        </div>
      )}

      {canEdit && inputError !== null && (date !== '' || name !== '') && (
        <p className="mb-3 text-[11px] font-semibold text-amber-dark">{inputError}</p>
      )}
      {createHoliday.isError && (
        <p className="mb-3 text-[11px] font-semibold text-rose-600">
          {mutationError(createHoliday.error, 'Gagal menambah hari libur.')}
        </p>
      )}
      {deleteHoliday.isError && (
        <p className="mb-3 text-[11px] font-semibold text-rose-600">
          {mutationError(deleteHoliday.error, 'Gagal menghapus hari libur.')}
        </p>
      )}

      {holidaysQuery.isPending && (
        <p className="py-4 text-xs text-muted-foreground">Memuat kalender libur…</p>
      )}
      {holidaysQuery.isError && !holidaysQuery.isPending && (
        <p className="py-4 text-xs text-rose-600">Gagal memuat kalender libur dari server.</p>
      )}
      {!holidaysQuery.isPending && !holidaysQuery.isError && holidays.length === 0 && (
        <p className="py-4 text-xs text-muted-foreground">
          Belum ada hari libur terdaftar. Tanggal libur tidak dihitung sebagai hari absensi.
        </p>
      )}

      {holidays.length > 0 && (
        <ul className="divide-y divide-border-subtle">
          {holidays.map((holiday) => (
            <li
              key={holiday.holiday_date}
              className="flex items-center justify-between gap-3 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-xs font-semibold text-foreground">{holiday.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {formatIsoDayId(holiday.holiday_date)}
                </p>
              </div>
              {canEdit &&
                (confirmDate === holiday.holiday_date ? (
                  <span className="flex shrink-0 items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => {
                        deleteHoliday.mutate(holiday.holiday_date, {
                          onSuccess: () => {
                            setConfirmDate(null);
                          },
                        });
                      }}
                      disabled={deleteHoliday.isPending}
                      className="cursor-pointer rounded-lg bg-rose-600 px-2 py-1 text-[10px] font-bold text-white transition-colors hover:bg-rose-700 disabled:opacity-50"
                    >
                      Ya, hapus
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setConfirmDate(null);
                      }}
                      className="cursor-pointer rounded-lg border border-border-control bg-card px-2 py-1 text-[10px] font-semibold text-muted-foreground"
                    >
                      Batal
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setConfirmDate(holiday.holiday_date);
                    }}
                    aria-label={`Hapus hari libur ${holiday.name}`}
                    className="shrink-0 cursor-pointer rounded-lg p-1.5 text-rose-500 transition-colors hover:bg-rose-50"
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                ))}
            </li>
          ))}
        </ul>
      )}

      {!canEdit && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Hanya Administrator Sekolah yang dapat menambah atau menghapus hari libur.
        </p>
      )}
    </section>
  );
}
