'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useTranslations } from 'next-intl';
import { useEffect, useMemo, useState } from 'react';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import { RecapMetricCards } from '@/components/rekap/RecapMetricCards';
import type { RecapMetric } from '@/components/rekap/RecapMetricCards';
import { RecapPeriodFilter } from '@/components/rekap/RecapPeriodFilter';
import { RecapStatusBadge } from '@/components/rekap/RecapStatusBadge';
import { isUnauthorized } from '@/components/presensi/presensiErrors';
import { Link } from '@/libs/I18nNavigation';
import { AUTH_QUERY_KEY } from '@/services/presensiApi';
import {
  generateStaffRecaps,
  generateStudentRecaps,
  listStaffRecaps,
  listStudentRecaps,
  toClassSummaries,
  verifyStaffRecap,
  verifyStudentRecap,
} from '@/services/recapApi';
import type { ClassRecapSummary, StaffRecap, StudentRecap } from '@/types/recap';

const PAGE_SIZE = 10;

type RecapMode = 'students' | 'classes' | 'staff';

function formatNumber(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}

function formatPercentage(value: number): string {
  return `${new Intl.NumberFormat('id-ID', { maximumFractionDigits: 0 }).format(value)}%`;
}

function averageRate(present: number, total: number): number {
  return total === 0 ? 0 : Math.round((present / total) * 100);
}

function attendanceTotal(row: StudentRecap): number {
  return row.total_hadir + row.total_sakit + row.total_izin + row.total_alpa;
}

function getStudentMetrics(
  rows: StudentRecap[],
  summaries: ClassRecapSummary[],
  t: ReturnType<typeof useTranslations<'RecapPage'>>,
): RecapMetric[] {
  const present = rows.reduce((total, row) => total + row.total_hadir, 0);
  const recorded = rows.reduce((total, row) => total + attendanceTotal(row), 0);
  const absent = rows.reduce((total, row) => total + row.total_alpa, 0);
  const bestClass = summaries.toSorted(
    (left, right) =>
      right.persentase_hadir - left.persentase_hadir ||
      left.class_name.localeCompare(right.class_name),
  )[0];

  return [
    {
      label: t('metric_student_count'),
      value: rows.length === 0 ? '—' : formatNumber(rows.length),
      accent: 'blue',
    },
    {
      label: t('metric_avg_attendance'),
      value: recorded === 0 ? '—' : formatPercentage(averageRate(present, recorded)),
      accent: 'green',
    },
    {
      label: t('metric_total_absent'),
      value: rows.length === 0 ? '—' : formatNumber(absent),
      accent: 'orange',
    },
    {
      label: t('metric_best_class'),
      value:
        bestClass === undefined
          ? '—'
          : `${bestClass.class_name} (${formatPercentage(bestClass.persentase_hadir)})`,
      accent: 'amber',
    },
  ];
}

function getStaffMetrics(rows: StaffRecap[], t: ReturnType<typeof useTranslations<'RecapPage'>>): RecapMetric[] {
  const attended = rows.reduce(
    (total, row) => total + row.total_hadir + row.total_terlambat,
    0,
  );
  const workdays = rows.reduce((total, row) => total + row.total_hari_kerja, 0);
  const absent = rows.reduce((total, row) => total + row.total_alpa, 0);

  return [
    {
      label: t('metric_staff_count'),
      value: rows.length === 0 ? '—' : formatNumber(rows.length),
      accent: 'blue',
    },
    {
      label: t('metric_avg_attendance'),
      value: workdays === 0 ? '—' : formatPercentage(averageRate(attended, workdays)),
      accent: 'green',
    },
    {
      label: t('metric_total_absent'),
      value: rows.length === 0 ? '—' : formatNumber(absent),
      accent: 'orange',
    },
    {
      label: t('metric_workdays'),
      value: rows.length === 0 ? '—' : formatNumber(rows[0]?.total_hari_kerja ?? 0),
      accent: 'amber',
    },
  ];
}

function RateCell(props: { rate: number }) {
  const rate = Math.max(0, Math.min(100, props.rate));

  return (
    <div className="flex min-w-24 items-center gap-2">
      <div
        aria-label={formatPercentage(rate)}
        className="h-2 flex-1 overflow-hidden rounded-full bg-stone-100"
        role="img"
      >
        <div className="h-full rounded-full bg-[#2fa36b]" style={{ width: `${rate}%` }} />
      </div>
      <span className="w-10 text-right text-xs font-semibold text-pine-deep">
        {formatPercentage(rate)}
      </span>
    </div>
  );
}

function RecapTable(props: {
  canManage: boolean;
  mode: RecapMode;
  students: StudentRecap[];
  classes: ClassRecapSummary[];
  staff: StaffRecap[];
  page: number;
  verifying: boolean;
  verifyingId?: number;
  verifyingKind?: 'student' | 'staff';
  onVerify: (kind: 'student' | 'staff', id: number) => void;
  labels: {
    action: string;
    alpa: string;
    class: string;
    hadir: string;
    izin: string;
    name: string;
    nip: string;
    rate: string;
    sakit: string;
    staff: string;
    status: string;
    students: string;
    terlambat: string;
    verify: string;
    verifying: string;
    workdays: string;
  };
}) {
  if (props.mode === 'classes') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
          <thead className="text-xs font-semibold text-text-muted">
            <tr>
              <th className="px-3 py-3" scope="col">
                No
              </th>
              <th className="px-3 py-3" scope="col">
                {props.labels.class}
              </th>
              <th className="px-3 py-3 text-center" scope="col">
                {props.labels.students}
              </th>
              <th className="px-3 py-3 text-center" scope="col">
                {props.labels.hadir}
              </th>
              <th className="px-3 py-3 text-center" scope="col">
                {props.labels.izin}
              </th>
              <th className="px-3 py-3 text-center" scope="col">
                {props.labels.sakit}
              </th>
              <th className="px-3 py-3 text-center" scope="col">
                {props.labels.alpa}
              </th>
              <th className="px-3 py-3" scope="col">
                {props.labels.rate}
              </th>
            </tr>
          </thead>
          <tbody>
            {props.classes.map((row, index) => (
              <tr className="border-t border-stone-200 text-text-primary" key={row.class_id}>
                <td className="px-3 py-3 text-text-muted">
                  {(props.page - 1) * PAGE_SIZE + index + 1}
                </td>
                <th className="px-3 py-3 font-semibold" scope="row">
                  {row.class_name}
                </th>
                <td className="px-3 py-3 text-center">{formatNumber(row.student_count)}</td>
                <td className="px-3 py-3 text-center">{formatNumber(row.total_hadir)}</td>
                <td className="px-3 py-3 text-center">{formatNumber(row.total_izin)}</td>
                <td className="px-3 py-3 text-center">{formatNumber(row.total_sakit)}</td>
                <td className="px-3 py-3 text-center font-semibold text-[#e55332]">
                  {formatNumber(row.total_alpa)}
                </td>
                <td className="px-3 py-3">
                  <RateCell rate={row.persentase_hadir} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (props.mode === 'staff') {
    return (
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] border-collapse text-left text-sm">
          <thead className="text-xs font-semibold text-text-muted">
            <tr>
              <th className="px-3 py-3" scope="col">No</th>
              <th className="px-3 py-3" scope="col">{props.labels.staff}</th>
              <th className="px-3 py-3" scope="col">{props.labels.nip}</th>
              <th className="px-3 py-3 text-center" scope="col">{props.labels.workdays}</th>
              <th className="px-3 py-3 text-center" scope="col">{props.labels.hadir}</th>
              <th className="px-3 py-3 text-center" scope="col">{props.labels.terlambat}</th>
              <th className="px-3 py-3 text-center" scope="col">{props.labels.izin}</th>
              <th className="px-3 py-3 text-center" scope="col">{props.labels.sakit}</th>
              <th className="px-3 py-3 text-center" scope="col">{props.labels.alpa}</th>
              <th className="px-3 py-3" scope="col">{props.labels.rate}</th>
              <th className="px-3 py-3" scope="col">{props.labels.status}</th>
              {props.canManage ? <th className="px-3 py-3" scope="col">{props.labels.action}</th> : null}
            </tr>
          </thead>
          <tbody>
            {props.staff.map((row, index) => (
              <tr className="border-t border-stone-200 text-text-primary" key={row.id}>
                <td className="px-3 py-3 text-text-muted">
                  {(props.page - 1) * PAGE_SIZE + index + 1}
                </td>
                <th className="px-3 py-3 font-semibold" scope="row">{row.nama_pegawai}</th>
                <td className="px-3 py-3">{row.nip ?? '—'}</td>
                <td className="px-3 py-3 text-center">{formatNumber(row.total_hari_kerja)}</td>
                <td className="px-3 py-3 text-center">{formatNumber(row.total_hadir)}</td>
                <td className="px-3 py-3 text-center">{formatNumber(row.total_terlambat)}</td>
                <td className="px-3 py-3 text-center">{formatNumber(row.total_izin)}</td>
                <td className="px-3 py-3 text-center">{formatNumber(row.total_sakit)}</td>
                <td className="px-3 py-3 text-center font-semibold text-[#e55332]">
                  {formatNumber(row.total_alpa)}
                </td>
                <td className="px-3 py-3"><RateCell rate={row.persentase_hadir} /></td>
                <td className="px-3 py-3"><RecapStatusBadge status={row.status_kunci} /></td>
                {props.canManage ? (
                  <td className="px-3 py-3">
                    <VerifyButton
                      disabled={row.status_kunci === 'dikunci' || props.verifying}
                      label={props.labels.verify}
                      loading={
                        props.verifying &&
                        props.verifyingId === row.id &&
                        props.verifyingKind === 'staff'
                      }
                      loadingLabel={props.labels.verifying}
                      onClick={() => props.onVerify('staff', row.id)}
                    />
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[920px] border-collapse text-left text-sm">
        <thead className="text-xs font-semibold text-text-muted">
          <tr>
            <th className="px-3 py-3" scope="col">No</th>
            <th className="px-3 py-3" scope="col">{props.labels.name}</th>
            <th className="px-3 py-3" scope="col">{props.labels.class}</th>
            <th className="px-3 py-3 text-center" scope="col">{props.labels.hadir}</th>
            <th className="px-3 py-3 text-center" scope="col">{props.labels.izin}</th>
            <th className="px-3 py-3 text-center" scope="col">{props.labels.sakit}</th>
            <th className="px-3 py-3 text-center" scope="col">{props.labels.alpa}</th>
            <th className="px-3 py-3" scope="col">{props.labels.rate}</th>
            <th className="px-3 py-3" scope="col">{props.labels.status}</th>
            {props.canManage ? <th className="px-3 py-3" scope="col">{props.labels.action}</th> : null}
          </tr>
        </thead>
        <tbody>
          {props.students.map((row, index) => (
            <tr className="border-t border-stone-200 text-text-primary" key={row.id}>
              <td className="px-3 py-3 text-text-muted">
                {(props.page - 1) * PAGE_SIZE + index + 1}
              </td>
              <th className="px-3 py-3 font-semibold" scope="row">{row.student_name}</th>
              <td className="px-3 py-3">{row.class_name}</td>
              <td className="px-3 py-3 text-center">{formatNumber(row.total_hadir)}</td>
              <td className="px-3 py-3 text-center">{formatNumber(row.total_izin)}</td>
              <td className="px-3 py-3 text-center">{formatNumber(row.total_sakit)}</td>
              <td className="px-3 py-3 text-center font-semibold text-[#e55332]">
                {formatNumber(row.total_alpa)}
              </td>
              <td className="px-3 py-3"><RateCell rate={row.persentase_hadir} /></td>
              <td className="px-3 py-3"><RecapStatusBadge status={row.status_kunci} /></td>
              {props.canManage ? (
                <td className="px-3 py-3">
                  <VerifyButton
                    disabled={row.status_kunci === 'dikunci' || props.verifying}
                    label={props.labels.verify}
                    loading={
                      props.verifying &&
                      props.verifyingId === row.id &&
                      props.verifyingKind === 'student'
                    }
                    loadingLabel={props.labels.verifying}
                    onClick={() => props.onVerify('student', row.id)}
                  />
                </td>
              ) : null}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VerifyButton(props: {
  disabled: boolean;
  label: string;
  loading: boolean;
  loadingLabel: string;
  onClick: () => void;
}) {
  return (
    <button
      className="whitespace-nowrap rounded-lg px-2 py-1 text-xs font-semibold text-blue-700 transition hover:bg-blue-50 disabled:cursor-not-allowed disabled:text-stone-400"
      disabled={props.disabled || props.loading}
      onClick={props.onClick}
      type="button"
    >
      {props.loading ? props.loadingLabel : props.label}
    </button>
  );
}

export function RecapDashboard(props: { readOnly?: boolean }) {
  const t = useTranslations('RecapPage');
  const queryClient = useQueryClient();
  const [mode, setMode] = useState<RecapMode>('classes');
  const [bulan, setBulan] = useState(() => new Date().getMonth() + 1);
  const [tahun, setTahun] = useState(() => new Date().getFullYear());
  const [classFilter, setClassFilter] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [notice, setNotice] = useState<{ kind: 'error' | 'success'; text: string } | null>(null);

  useEffect(() => {
    if (notice === null) {
      return;
    }

    const timer = window.setTimeout(() => setNotice(null), 4500);

    return () => window.clearTimeout(timer);
  }, [notice]);

  const guard = async <T,>(request: Promise<T>): Promise<T> => {
    try {
      return await request;
    } catch (error) {
      if (isUnauthorized(error)) {
        void queryClient.invalidateQueries({ queryKey: AUTH_QUERY_KEY });
      }

      throw error;
    }
  };

  const studentQueryKey = ['recaps', 'students', bulan, tahun] as const;
  const staffQueryKey = ['recaps', 'staff', bulan, tahun] as const;

  const studentsQuery = useQuery({
    queryFn: async () => await guard(listStudentRecaps(bulan, tahun)),
    queryKey: studentQueryKey,
  });
  const staffQuery = useQuery({
    enabled: mode === 'staff',
    queryFn: async () => await guard(listStaffRecaps(bulan, tahun)),
    queryKey: staffQueryKey,
  });

  const generate = useMutation({
    mutationFn: async (target: 'students' | 'staff') => {
      if (target === 'staff') {
        return await guard(generateStaffRecaps(bulan, tahun));
      }

      return await guard(generateStudentRecaps(bulan, tahun));
    },
    onError: (error) => {
      setNotice({
        kind: 'error',
        text: isUnauthorized(error) ? t('error_unauthorized') : t('error_generate'),
      });
    },
    onSuccess: (_data, target) => {
      void queryClient.invalidateQueries({
        queryKey: target === 'staff' ? staffQueryKey : studentQueryKey,
      });
      setNotice({ kind: 'success', text: t('toast_generated') });
    },
  });

  const verify = useMutation({
    mutationFn: async (input: { kind: 'student' | 'staff'; id: number }) =>
      await guard(
        input.kind === 'staff' ? verifyStaffRecap(input.id) : verifyStudentRecap(input.id),
      ),
    onError: (error) => {
      setNotice({
        kind: 'error',
        text: isUnauthorized(error) ? t('error_unauthorized') : t('error_verify'),
      });
    },
    onSuccess: (_data, input) => {
      void queryClient.invalidateQueries({
        queryKey: input.kind === 'staff' ? staffQueryKey : studentQueryKey,
      });
      setNotice({ kind: 'success', text: t('toast_verified') });
    },
  });

  const studentRows = studentsQuery.data ?? [];
  const staffRows = staffQuery.data ?? [];
  const classSummaries = useMemo(() => toClassSummaries(studentRows), [studentRows]);
  const classOptions = useMemo(
    () => classSummaries.map((summary) => ({ id: summary.class_id, name: summary.class_name })),
    [classSummaries],
  );

  useEffect(() => {
    if (classFilter !== 'all' && !classOptions.some((classOption) => classOption.id === classFilter)) {
      setClassFilter('all');
    }
  }, [classFilter, classOptions]);

  const normalizedSearch = search.trim().toLocaleLowerCase('id-ID');
  const filteredStudents = useMemo(
    () =>
      studentRows.filter((row) => {
        const matchesClass = classFilter === 'all' || row.class_id === classFilter;
        const matchesSearch =
          normalizedSearch === '' ||
          `${row.student_name} ${row.class_name}`.toLocaleLowerCase('id-ID').includes(normalizedSearch);

        return matchesClass && matchesSearch;
      }),
    [classFilter, normalizedSearch, studentRows],
  );
  const filteredClasses = useMemo(
    () =>
      classSummaries.filter((row) => {
        const matchesClass = classFilter === 'all' || row.class_id === classFilter;
        const matchesSearch = row.class_name.toLocaleLowerCase('id-ID').includes(normalizedSearch);

        return matchesClass && matchesSearch;
      }),
    [classFilter, classSummaries, normalizedSearch],
  );
  const filteredStaff = useMemo(
    () =>
      staffRows.filter((row) =>
        `${row.nama_pegawai} ${row.nip ?? ''}`.toLocaleLowerCase('id-ID').includes(normalizedSearch),
      ),
    [normalizedSearch, staffRows],
  );

  const activeQuery = mode === 'staff' ? staffQuery : studentsQuery;
  const activeCount =
    mode === 'classes'
      ? filteredClasses.length
      : mode === 'staff'
        ? filteredStaff.length
        : filteredStudents.length;
  const pageCount = Math.max(1, Math.ceil(activeCount / PAGE_SIZE));
  const activePage = Math.min(page, pageCount);
  const firstItem = activeCount === 0 ? 0 : (activePage - 1) * PAGE_SIZE + 1;
  const lastItem = Math.min(activePage * PAGE_SIZE, activeCount);
  const visibleStudents = filteredStudents.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const visibleClasses = filteredClasses.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const visibleStaff = filteredStaff.slice((activePage - 1) * PAGE_SIZE, activePage * PAGE_SIZE);
  const metrics =
    mode === 'staff'
      ? getStaffMetrics(filteredStaff, t)
      : getStudentMetrics(filteredStudents, toClassSummaries(filteredStudents), t);
  const periodLabel = new Intl.DateTimeFormat('id-ID', {
    month: 'long',
    year: 'numeric',
  }).format(new Date(tahun, bulan - 1, 1));
  const generating = generate.isPending;

  const handleGenerate = () => {
    if (!window.confirm(t('confirm_generate', { month: bulan, year: tahun }))) {
      return;
    }

    setNotice(null);
    generate.mutate(mode === 'staff' ? 'staff' : 'students');
  };

  const handleVerify = (kind: 'student' | 'staff', id: number) => {
    if (!window.confirm(t('confirm_verify'))) {
      return;
    }

    setNotice(null);
    verify.mutate({ kind, id });
  };
  const canShowGenerateHint =
    normalizedSearch === '' && (mode === 'staff' || classFilter === 'all');

  const searchLabel =
    mode === 'staff'
      ? t('filter_search_staff')
      : mode === 'classes'
        ? t('filter_search_class')
        : t('filter_search_student');

  return (
    <section className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 pb-8">
      <header className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-pine-deep sm:text-3xl">
            Rekap absensi
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            {mode === 'staff' ? t('tab_staff') : t('filter_all_classes')}, {periodLabel}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <button
            className="inline-flex items-center gap-2 rounded-xl border border-stone-200 bg-white px-4 py-2.5 text-sm font-semibold text-pine-deep shadow-sm transition hover:bg-stone-50"
            onClick={() => window.print()}
            type="button"
          >
            <MaterialIcon className="text-[18px]" name="print" />
            {t('btn_print')}
          </button>
        </div>
      </header>

      <div
        aria-label="Jenis rekap"
        className="inline-flex w-fit max-w-full flex-wrap gap-1 rounded-xl bg-[#f0ede3] p-1"
        role="tablist"
      >
        {([
          ['students', t('tab_students')],
          ['classes', t('tab_classes')],
          ['staff', t('tab_staff')],
        ] as const).map(([value, label]) => (
          <button
            aria-selected={mode === value}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition ${
              mode === value
                ? 'bg-white text-pine-deep shadow-sm'
                : 'text-stone-600 hover:bg-white/60'
            }`}
            key={value}
            onClick={() => {
              setMode(value);
              setPage(1);
              setSearch('');
            }}
            role="tab"
            type="button"
          >
            {label}
          </button>
        ))}
        <button
          aria-disabled="true"
          className="cursor-not-allowed rounded-lg px-4 py-2 text-sm font-semibold text-stone-400"
          disabled
          role="tab"
          type="button"
        >
          {t('tab_daily')}
        </button>
      </div>

      <RecapPeriodFilter
        bulan={bulan}
        btnGenerateLabel={t('btn_generate')}
        classFilter={classFilter}
        classFilterDisabled={mode === 'staff'}
        classSearch={search}
        classes={classOptions}
        filterAllClassesLabel={t('filter_all_classes')}
        filterClassLabel={t('filter_class')}
        filterMonthLabel={t('filter_month')}
        filterSearchLabel={searchLabel}
        filterYearLabel={t('filter_year')}
        generating={generating}
        generatingLabel={t('generating')}
        generateDisabled={activeQuery.isPending || verify.isPending}
        showGenerate={!props.readOnly}
        onBulanChange={(value) => {
          setBulan(value);
          setPage(1);
          setNotice(null);
        }}
        onClassChange={(value) => {
          setClassFilter(value);
          setPage(1);
        }}
        onClassSearchChange={(value) => {
          setSearch(value);
          setPage(1);
        }}
        onGenerate={handleGenerate}
        onTahunChange={(value) => {
          setTahun(value);
          setPage(1);
          setNotice(null);
        }}
        tahun={tahun}
      />

      {notice !== null ? (
        <div
          className={`flex items-center gap-2 rounded-xl border px-4 py-3 text-sm font-medium ${
            notice.kind === 'error'
              ? 'border-rose-200 bg-rose-50 text-rose-800'
              : 'border-green-200 bg-green-50 text-green-800'
          }`}
          role={notice.kind === 'error' ? 'alert' : 'status'}
        >
          <MaterialIcon
            className="text-[18px]"
            name={notice.kind === 'error' ? 'error' : 'check_circle'}
          />
          {notice.text}
        </div>
      ) : null}

      <RecapMetricCards metrics={metrics} />

      <section className="rounded-2xl border border-stone-200 bg-white p-3 shadow-[0_1px_3px_rgba(15,23,42,0.04)] sm:p-5">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-base font-bold text-pine-deep">
            {mode === 'classes'
              ? 'Rekap kehadiran per kelas'
              : mode === 'staff'
                ? 'Rekap kehadiran pegawai'
                : 'Rekap kehadiran per siswa'}
          </h2>
          {mode !== 'staff' ? (
            <div className="flex items-center gap-3 text-xs text-text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#2fa36b]" /> H {t('col_hadir')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#f5b82e]" /> I {t('col_izin')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-blue-500" /> S {t('col_sakit')}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <span className="size-2.5 rounded-full bg-[#f05a35]" /> A {t('col_alpa')}
              </span>
            </div>
          ) : null}
        </div>

        {activeQuery.isPending ? (
          <div className="flex min-h-44 items-center justify-center gap-3 text-sm text-text-muted">
            <span className="size-5 animate-spin rounded-full border-2 border-stone-200 border-t-pine-deep" />
            {t('loading')}
          </div>
        ) : activeQuery.error !== null ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-3 text-center">
            <MaterialIcon className="text-3xl text-rose-500" name="warning" />
            <p className="max-w-lg text-sm text-rose-800">
              {isUnauthorized(activeQuery.error) ? t('error_unauthorized') : t('error_load')}
            </p>
            {isUnauthorized(activeQuery.error) ? (
              <Link
                className="rounded-lg bg-pine-deep px-4 py-2 text-sm font-semibold text-white"
                href="/sign-in"
              >
                {t('btn_sign_in')}
              </Link>
            ) : (
              <button
                className="rounded-lg border border-stone-200 px-4 py-2 text-sm font-semibold text-pine-deep hover:bg-stone-50"
                onClick={() => void activeQuery.refetch()}
                type="button"
              >
                {t('btn_retry')}
              </button>
            )}
          </div>
        ) : activeCount === 0 ? (
          <div className="flex min-h-44 flex-col items-center justify-center gap-2 text-center">
            <MaterialIcon className="text-3xl text-text-muted" name="event_busy" />
            <p className="text-sm font-semibold text-pine-deep">
              {canShowGenerateHint ? t('empty_state') : t('empty_search')}
            </p>
            {canShowGenerateHint ? (
              <p className="text-sm text-text-muted">{t('empty_generate_hint')}</p>
            ) : null}
          </div>
        ) : (
          <>
            <RecapTable
              canManage={!props.readOnly}
              classes={visibleClasses}
              labels={{
                action: t('col_action'),
                alpa: t('col_alpa'),
                class: t('col_class'),
                hadir: t('col_hadir'),
                izin: t('col_izin'),
                name: t('col_name'),
                nip: t('col_nip'),
                rate: t('col_rate'),
                sakit: t('col_sakit'),
                staff: t('col_staff'),
                status: t('col_status'),
                students: t('col_students'),
                terlambat: t('col_terlambat'),
                verify: t('btn_verify'),
                verifying: t('verifying'),
                workdays: t('col_workdays'),
              }}
              mode={mode}
              onVerify={handleVerify}
              page={activePage}
              staff={visibleStaff}
              students={visibleStudents}
              verifying={verify.isPending}
              verifyingId={verify.variables?.id}
              verifyingKind={verify.variables?.kind}
            />
            <div className="mt-4 flex flex-col gap-3 border-t border-stone-200 pt-3 text-sm text-text-muted sm:flex-row sm:items-center sm:justify-between">
              <span>
                {t('results_count', {
                  from: firstItem,
                  to: lastItem,
                  total: activeCount,
                })}
              </span>
              <div className="flex items-center gap-2 print:hidden">
                <button
                  className="rounded-lg border border-stone-200 px-3 py-2 font-semibold text-pine-deep hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={activePage <= 1}
                  onClick={() => setPage(activePage - 1)}
                  type="button"
                >
                  Sebelumnya
                </button>
                <span className="px-2 font-semibold text-pine-deep">
                  {activePage} / {pageCount}
                </span>
                <button
                  className="rounded-lg border border-stone-200 px-3 py-2 font-semibold text-pine-deep hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-50"
                  disabled={activePage >= pageCount}
                  onClick={() => setPage(activePage + 1)}
                  type="button"
                >
                  Berikutnya
                </button>
              </div>
            </div>
          </>
        )}
      </section>
    </section>
  );
}
