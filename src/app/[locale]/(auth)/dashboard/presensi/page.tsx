import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { AttendanceManager } from '@/components/presensi/AttendanceManager';

export type AttendancePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for attendance page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: AttendancePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'AttendancePage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Class attendance management dashboard page.
 *
 * @param props - Route params including locale.
 * @returns Rendered attendance page.
 */
export default async function AttendancePage(props: AttendancePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <AttendanceManager />;
}
