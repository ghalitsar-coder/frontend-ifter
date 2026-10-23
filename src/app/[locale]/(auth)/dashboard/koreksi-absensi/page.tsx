import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CorrectionManager } from '@/components/koreksi-absensi/CorrectionManager';

export type AttendanceCorrectionPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the attendance correction audit page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: AttendanceCorrectionPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'AttendanceCorrectionPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Attendance correction and audit log page.
 *
 * @param props - Route params including locale.
 * @returns Rendered correction workspace.
 */
export default async function AttendanceCorrectionPage(props: AttendanceCorrectionPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <CorrectionManager />;
}
