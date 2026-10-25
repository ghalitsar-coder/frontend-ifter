'use client';

import { CalendarRange, CheckCircle2, Plus, Save, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { ApiError } from '@/lib/api/client';
import type { AcademicYear, Term } from '@/lib/api/dto';
import {
  academicYearInputError,
  formatIsoDayId,
  termInputError,
  useAcademicYear,
  useAcademicYears,
  useCreateAcademicYear,
  useCreateTerm,
  useTerms,
  useUpdateAcademicYear,
  useUpdateTerm,
} from '@/lib/api/pengaturan';
import type { AcademicYearInput, TermInput } from '@/lib/api/pengaturan';
import { can } from '@/lib/api/rbac';

const fieldInput =
  'h-10 w-full rounded-xl border border-border-control bg-surface-container-low px-3 text-xs text-foreground focus:ring-2 focus:ring-pine-deep/20 focus:outline-none disabled:cursor-not-allowed disabled:opacity-60';

const mutationError = (error: unknown, fallback: string): string =>
  error instanceof ApiError && error.message !== '' ? error.message : fallback;

const todayIsoDay = (): string => {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${now.getFullYear()}-${month}-${day}`;
};

/**
 * Overlay the local edits on the freshest server row.
 * @param server - Row from GET /academic-years/:id.
 * @param patch - Local field edits.
 * @returns Draft merge of server values and edits.
 */
const draftFromPatch = (
  server: AcademicYear,
  patch: Partial<AcademicYearInput> | null,
): AcademicYearInput => ({
  name: patch?.name ?? server.name,
  start_date: patch?.start_date ?? server.start_date,
  end_date: patch?.end_date ?? server.end_date,
  is_active: patch?.is_active ?? server.is_active,
});

/**
 * Whether the local draft differs from the server row.
 * @param draft - Current form values.
 * @param server - Row from GET /academic-years/:id.
 * @returns True when a PUT would change something.
 */
const isYearDirty = (draft: AcademicYearInput, server: AcademicYear): boolean =>
  draft.name !== server.name ||
  draft.start_date !== server.start_date ||
  draft.end_date !== server.end_date ||
  draft.is_active !== server.is_active;

/**
 * Small inline form for creating a term inside the selected academic year.
 * @param props - Parent year and the next free term number.
 * @returns Term create form.
 */
function TermCreateForm(props: { yearId: string; year: AcademicYear; nextNumber: number }) {
  const createTerm = useCreateTerm(props.yearId);
  const [expanded, setExpanded] = useState(false);
  const [termNumber, setTermNumber] = useState(props.nextNumber);
  const [name, setName] = useState(`Semester ${props.nextNumber}`);
  const [startDate, setStartDate] = useState(props.year.start_date);
  const [endDate, setEndDate] = useState(props.year.end_date);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => {
          setExpanded(true);
        }}
        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[11px] font-semibold text-pine-deep transition-colors hover:bg-pine-light"
      >
        <Plus className="size-3" />
        <span>Tambah Semester</span>
      </button>
    );
  }

  const input: TermInput = {
    term_number: termNumber,
    name,
    start_date: startDate,
    end_date: endDate,
  };
  const error = termInputError(input, props.year);

  return (
    <div className="rounded-xl border border-dashed border-border-control bg-surface-container-low/50 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <div>
          <label
            htmlFor="new-term-number"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Semester Ke-
          </label>
          <input
            id="new-term-number"
            type="number"
            min={1}
            max={4}
            value={termNumber}
            onChange={(e) => {
              const next = Number(e.target.value);
              setTermNumber(next);
              setName(`Semester ${next}`);
            }}
            className={fieldInput}
          />
        </div>
        <div>
          <label
            htmlFor="new-term-name"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Nama
          </label>
          <input
            id="new-term-name"
            type="text"
            maxLength={30}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
            }}
            className={fieldInput}
          />
        </div>
        <div>
          <label
            htmlFor="new-term-start"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Mulai
          </label>
          <input
            id="new-term-start"
            type="date"
            value={startDate}
            onChange={(e) => {
              setStartDate(e.target.value);
            }}
            className={fieldInput}
          />
        </div>
        <div>
          <label
            htmlFor="new-term-end"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Selesai
          </label>
          <input
            id="new-term-end"
            type="date"
            value={endDate}
            onChange={(e) => {
              setEndDate(e.target.value);
            }}
            className={fieldInput}
          />
        </div>
      </div>

      {error !== null && <p className="mt-2 text-[11px] font-semibold text-amber-dark">{error}</p>}
      {createTerm.isError && (
        <p className="mt-2 text-[11px] font-semibold text-rose-600">
          {mutationError(createTerm.error, 'Gagal menambah semester.')}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          disabled={error !== null || createTerm.isPending}
          onClick={() => {
            createTerm.mutate(
              { ...input, name: input.name.trim() },
              {
                onSuccess: () => {
                  setExpanded(false);
                },
              },
            );
          }}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-pine-deep px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createTerm.isPending ? 'Menyimpan…' : 'Simpan Semester'}
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
          }}
          className="cursor-pointer rounded-lg border border-border-control bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

/**
 * One editable term row: the backend only stores dates and a name, so the row
 * edits the start/end dates (and name) and saves the full PUT /terms/:id body.
 * @param props - Term, parent year and the term-list refetch trigger.
 * @returns Term table row.
 */
function TermRow(props: { term: Term; year: AcademicYear }) {
  const updateTerm = useUpdateTerm(props.year.id);
  const [name, setName] = useState(props.term.name);
  const [startDate, setStartDate] = useState(props.term.start_date);
  const [endDate, setEndDate] = useState(props.term.end_date);

  const input: TermInput = {
    term_number: props.term.term_number,
    name,
    start_date: startDate,
    end_date: endDate,
  };
  const error = termInputError(input, props.year);
  const isDirty =
    name !== props.term.name ||
    startDate !== props.term.start_date ||
    endDate !== props.term.end_date;

  return (
    <li className="space-y-2 px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-bold text-pine-deep">Semester {props.term.term_number}</span>
        <span className="text-[10px] text-muted-foreground">
          {formatIsoDayId(props.term.start_date)} – {formatIsoDayId(props.term.end_date)}
        </span>
      </div>
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,130px)_minmax(0,130px)_auto]">
        <input
          type="text"
          aria-label={`Nama semester ${props.term.term_number}`}
          maxLength={30}
          value={name}
          onChange={(e) => {
            setName(e.target.value);
          }}
          className={fieldInput}
        />
        <input
          type="date"
          aria-label={`Tanggal mulai semester ${props.term.term_number}`}
          value={startDate}
          onChange={(e) => {
            setStartDate(e.target.value);
          }}
          className={fieldInput}
        />
        <input
          type="date"
          aria-label={`Tanggal selesai semester ${props.term.term_number}`}
          value={endDate}
          onChange={(e) => {
            setEndDate(e.target.value);
          }}
          className={fieldInput}
        />
        <button
          type="button"
          disabled={!isDirty || error !== null || updateTerm.isPending}
          onClick={() => {
            updateTerm.mutate(
              { id: props.term.id, ...input, name: input.name.trim() },
              {
                onSuccess: () => {
                  setName(input.name.trim());
                },
              },
            );
          }}
          className="inline-flex h-10 cursor-pointer items-center justify-center gap-1 rounded-xl bg-pine-deep px-3 text-[11px] font-semibold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="size-3.5" />
          <span>{updateTerm.isPending ? 'Menyimpan…' : 'Simpan'}</span>
        </button>
      </div>
      {isDirty && error !== null && (
        <p className="text-[11px] font-semibold text-amber-dark">{error}</p>
      )}
      {updateTerm.isError && (
        <p className="text-[11px] font-semibold text-rose-600">
          {mutationError(updateTerm.error, 'Gagal menyimpan semester.')}
        </p>
      )}
    </li>
  );
}

/**
 * Term list + create form for the selected academic year.
 * @param props - Parent academic year.
 * @returns Term section.
 */
function TermsSection(props: { year: AcademicYear }) {
  const termsQuery = useTerms(props.year.id);
  const terms = termsQuery.data ?? [];
  const nextNumber = Math.min(4, terms.length + 1);

  return (
    <div className="mt-4 rounded-2xl border border-border-subtle bg-surface-container-low/40">
      <div className="flex items-center justify-between gap-2 border-b border-border-subtle px-3 py-2.5">
        <h4 className="text-[11px] font-bold tracking-wider text-muted-foreground uppercase">
          Semester Tahun {props.year.name}
        </h4>
        {terms.length < 4 && (
          <TermCreateForm yearId={props.year.id} year={props.year} nextNumber={nextNumber} />
        )}
      </div>

      {termsQuery.isPending && (
        <p className="px-3 py-4 text-xs text-muted-foreground">Memuat semester…</p>
      )}
      {termsQuery.isError && !termsQuery.isPending && (
        <p className="px-3 py-4 text-xs text-rose-600">Gagal memuat semester dari server.</p>
      )}
      {!termsQuery.isPending && !termsQuery.isError && terms.length === 0 && (
        <p className="px-3 py-4 text-xs text-muted-foreground">
          Belum ada semester. Tambahkan semester pertama untuk tahun ajaran ini.
        </p>
      )}

      {terms.length > 0 && (
        <ul className="divide-y divide-border-subtle">
          {terms.map((term) => (
            <TermRow
              key={`${term.id}-${term.start_date}-${term.end_date}`}
              term={term}
              year={props.year}
            />
          ))}
        </ul>
      )}
    </div>
  );
}

/**
 * Editor for one academic year: name/date fields, activation switch and its
 * term list. Loads the freshest row through GET /academic-years/:id.
 * @param props - Selected academic year id.
 * @returns Academic year editor card.
 */
function AcademicYearEditor(props: { yearId: string }) {
  const detailQuery = useAcademicYear(props.yearId);
  const updateYear = useUpdateAcademicYear();
  const [patch, setPatch] = useState<Partial<AcademicYearInput> | null>(null);

  const server = detailQuery.data;
  if (detailQuery.isPending || server === undefined) {
    return (
      <p className="rounded-xl border border-border-subtle bg-surface-container-low px-3 py-4 text-xs text-muted-foreground">
        {detailQuery.isError ? 'Gagal memuat detail tahun ajaran.' : 'Memuat tahun ajaran…'}
      </p>
    );
  }

  const draft = draftFromPatch(server, patch);
  const error = academicYearInputError(draft);
  const isDirty = isYearDirty(draft, server);

  const save = (input: AcademicYearInput) => {
    updateYear.mutate(
      { id: server.id, ...input, name: input.name.trim() },
      {
        onSuccess: () => {
          setPatch(null);
        },
      },
    );
  };

  return (
    <div className="mt-4 rounded-2xl border border-border-subtle bg-card p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[minmax(0,1fr)_minmax(0,140px)_minmax(0,140px)]">
        <div>
          <label
            htmlFor="academic-year-name"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Nama Tahun Ajaran
          </label>
          <input
            id="academic-year-name"
            type="text"
            maxLength={30}
            value={draft.name}
            onChange={(e) => {
              setPatch((current) => ({ ...current, name: e.target.value }));
            }}
            className={fieldInput}
          />
        </div>
        <div>
          <label
            htmlFor="academic-year-start"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Mulai
          </label>
          <input
            id="academic-year-start"
            type="date"
            value={draft.start_date}
            onChange={(e) => {
              setPatch((current) => ({ ...current, start_date: e.target.value }));
            }}
            className={fieldInput}
          />
        </div>
        <div>
          <label
            htmlFor="academic-year-end"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Selesai
          </label>
          <input
            id="academic-year-end"
            type="date"
            value={draft.end_date}
            onChange={(e) => {
              setPatch((current) => ({ ...current, end_date: e.target.value }));
            }}
            className={fieldInput}
          />
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="inline-flex cursor-pointer items-center gap-2 rounded-xl border border-border-control bg-surface-container-low px-3 py-2 text-[11px] font-semibold text-foreground">
          <input
            type="checkbox"
            checked={draft.is_active}
            onChange={(e) => {
              setPatch((current) => ({ ...current, is_active: e.target.checked }));
            }}
            className="size-3.5 cursor-pointer accent-pine-deep"
          />
          Tahun ajaran aktif
        </label>

        {!server.is_active && (
          <button
            type="button"
            disabled={updateYear.isPending || error !== null}
            onClick={() => {
              save({ ...draft, is_active: true });
            }}
            className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-amber-gold/30 px-3 py-2 text-[11px] font-bold text-amber-dark transition-colors hover:bg-amber-gold/50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Sparkles className="size-3.5" />
            <span>Aktifkan Tahun Ini</span>
          </button>
        )}

        <button
          type="button"
          disabled={!isDirty || error !== null || updateYear.isPending}
          onClick={() => {
            save(draft);
          }}
          className="inline-flex cursor-pointer items-center gap-1 rounded-xl bg-pine-deep px-3 py-2 text-[11px] font-semibold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          <Save className="size-3.5" />
          <span>{updateYear.isPending ? 'Menyimpan…' : 'Simpan Tahun Ajaran'}</span>
        </button>
      </div>

      {isDirty && error !== null && (
        <p className="mt-2 text-[11px] font-semibold text-amber-dark">{error}</p>
      )}
      {server.is_active && (
        <p className="mt-2 inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
          <CheckCircle2 className="size-3.5" />
          Tahun ajaran ini aktif — hanya satu tahun ajaran yang dapat aktif.
        </p>
      )}
      {updateYear.isError && (
        <p className="mt-2 text-[11px] font-semibold text-rose-600">
          {mutationError(updateYear.error, 'Gagal menyimpan tahun ajaran.')}
        </p>
      )}

      <TermsSection year={server} />
    </div>
  );
}

/**
 * Create form for a new academic year (POST /academic-years). A new active
 * year automatically deactivates the previous one server-side.
 * @returns Create form.
 */
function AcademicYearCreateForm() {
  const createYear = useCreateAcademicYear();
  const [expanded, setExpanded] = useState(false);
  const [draft, setDraft] = useState<AcademicYearInput>({
    name: '',
    start_date: todayIsoDay(),
    end_date: todayIsoDay(),
    is_active: false,
  });
  const error = academicYearInputError(draft);

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => {
          setExpanded(true);
        }}
        className="inline-flex cursor-pointer items-center gap-1 rounded-lg border border-border-control bg-card px-2 py-1 text-[11px] font-semibold text-pine-deep transition-colors hover:bg-pine-light"
      >
        <Plus className="size-3" />
        <span>Tahun Ajaran Baru</span>
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-dashed border-border-control bg-surface-container-low/50 p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        <div>
          <label
            htmlFor="new-year-name"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Nama
          </label>
          <input
            id="new-year-name"
            type="text"
            maxLength={30}
            placeholder="2026/2027"
            value={draft.name}
            onChange={(e) => {
              setDraft((current) => ({ ...current, name: e.target.value }));
            }}
            className={fieldInput}
          />
        </div>
        <div>
          <label
            htmlFor="new-year-start"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Mulai
          </label>
          <input
            id="new-year-start"
            type="date"
            value={draft.start_date}
            onChange={(e) => {
              setDraft((current) => ({ ...current, start_date: e.target.value }));
            }}
            className={fieldInput}
          />
        </div>
        <div>
          <label
            htmlFor="new-year-end"
            className="mb-1 block text-[11px] font-bold text-foreground"
          >
            Selesai
          </label>
          <input
            id="new-year-end"
            type="date"
            value={draft.end_date}
            onChange={(e) => {
              setDraft((current) => ({ ...current, end_date: e.target.value }));
            }}
            className={fieldInput}
          />
        </div>
      </div>

      <label className="mt-2 inline-flex cursor-pointer items-center gap-2 text-[11px] font-semibold text-foreground">
        <input
          type="checkbox"
          checked={draft.is_active}
          onChange={(e) => {
            setDraft((current) => ({ ...current, is_active: e.target.checked }));
          }}
          className="size-3.5 cursor-pointer accent-pine-deep"
        />
        Langsung aktifkan tahun ajaran ini
      </label>

      {error !== null && draft.name !== '' && (
        <p className="mt-2 text-[11px] font-semibold text-amber-dark">{error}</p>
      )}
      {createYear.isError && (
        <p className="mt-2 text-[11px] font-semibold text-rose-600">
          {mutationError(createYear.error, 'Gagal membuat tahun ajaran.')}
        </p>
      )}

      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          disabled={error !== null || createYear.isPending}
          onClick={() => {
            createYear.mutate(
              { ...draft, name: draft.name.trim() },
              {
                onSuccess: () => {
                  setExpanded(false);
                  setDraft({
                    name: '',
                    start_date: todayIsoDay(),
                    end_date: todayIsoDay(),
                    is_active: false,
                  });
                },
              },
            );
          }}
          className="inline-flex cursor-pointer items-center gap-1 rounded-lg bg-pine-deep px-2.5 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createYear.isPending ? 'Menyimpan…' : 'Simpan Tahun Ajaran'}
        </button>
        <button
          type="button"
          onClick={() => {
            setExpanded(false);
          }}
          className="cursor-pointer rounded-lg border border-border-control bg-card px-2.5 py-1.5 text-[11px] font-semibold text-muted-foreground"
        >
          Batal
        </button>
      </div>
    </div>
  );
}

/**
 * Academic year & semester settings (MasterData group: admin + staff_tu).
 * Lists years, creates/edits them, and edits the terms nested under the
 * selected year. Gating is cosmetic; the server enforces the same roles.
 *
 * @returns Academic calendar card.
 */
export function SettingsAcademicYearPanel() {
  const { roles } = useAuth();
  const canManage = can(roles, 'master_data');
  const yearsQuery = useAcademicYears();
  const [selectedId, setSelectedId] = useState('');
  const years = yearsQuery.data ?? [];
  const selected = years.find((year) => year.id === selectedId);

  if (!canManage) {
    return null;
  }

  return (
    <section className="rounded-2xl border border-border-control bg-card p-5 shadow-xs">
      <div className="mb-4 flex items-center justify-between border-b border-border-subtle pb-3">
        <div className="flex items-center gap-2">
          <CalendarRange className="size-4 text-pine-deep" />
          <h2 className="text-sm font-bold text-pine-deep sm:text-base">
            Tahun Ajaran &amp; Semester
          </h2>
        </div>
        <AcademicYearCreateForm />
      </div>

      {yearsQuery.isPending && (
        <p className="py-3 text-xs text-muted-foreground">Memuat tahun ajaran…</p>
      )}
      {yearsQuery.isError && !yearsQuery.isPending && (
        <p className="py-3 text-xs text-rose-600">Gagal memuat tahun ajaran dari server.</p>
      )}
      {!yearsQuery.isPending && !yearsQuery.isError && years.length === 0 && (
        <p className="py-3 text-xs text-muted-foreground">
          Belum ada tahun ajaran. Buat tahun ajaran pertama untuk membuka kelas dan semester.
        </p>
      )}

      {years.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {years.map((year) => {
            const isSelected = year.id === selectedId;
            return (
              <button
                key={year.id}
                type="button"
                onClick={() => {
                  setSelectedId(isSelected ? '' : year.id);
                }}
                aria-pressed={isSelected}
                className={`inline-flex cursor-pointer items-center gap-1.5 rounded-xl border px-2.5 py-1.5 text-[11px] font-semibold transition-colors ${
                  isSelected
                    ? 'border-pine-deep bg-pine-light text-pine-deep'
                    : 'border-border-control bg-surface-container-low text-foreground hover:bg-pine-light/60'
                }`}
              >
                <span>{year.name}</span>
                {year.is_active && (
                  <span className="rounded-full bg-emerald-100 px-1.5 py-0.5 text-[9px] font-bold text-emerald-800">
                    Aktif
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {selected !== undefined && <AcademicYearEditor key={selected.id} yearId={selected.id} />}
      {years.length > 0 && selected === undefined && (
        <p className="mt-3 text-[11px] text-muted-foreground">
          Pilih satu tahun ajaran untuk mengubah tanggal dan semesternya.
        </p>
      )}
    </section>
  );
}
