/** School timezone used for every calendar label in the dashboard shell. */
export const SCHOOL_TIME_ZONE = 'Asia/Jakarta';

const jakartaYearMonth = (date: Date): { year: number; month: number } => {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: SCHOOL_TIME_ZONE,
    year: 'numeric',
    month: 'numeric',
  }).formatToParts(date);
  const valueOf = (type: 'year' | 'month') =>
    Number(parts.find((part) => part.type === type)?.value);

  return { year: valueOf('year'), month: valueOf('month') };
};

/**
 * Formats the Indonesian academic period for a date: semester Ganjil runs
 * July–December, Genap runs January–June.
 *
 * @param date - Any instant; converted to Asia/Jakarta calendar parts.
 * @returns Label such as `T.A. 2026/2027 Ganjil`.
 */
export const academicPeriodLabel = (date: Date): string => {
  const { year, month } = jakartaYearMonth(date);
  const isOddSemester = month >= 7;
  const startYear = isOddSemester ? year : year - 1;

  return `T.A. ${startYear}/${startYear + 1} ${isOddSemester ? 'Ganjil' : 'Genap'}`;
};
