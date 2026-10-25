import type { Metadata } from 'next';
import { setRequestLocale } from 'next-intl/server';
import { ClassManager } from '@/components/master-kelas/ClassManager';

export type KelasPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Metadata for the class management page (hard-coded per repo convention:
 * no new locale keys are allowed for this feature).
 * @returns Page metadata.
 */
export const generateMetadata = (): Metadata => ({
  title: 'Manajemen Kelas',
  description: 'Kelola rombel, tingkat, tahun ajaran, dan penugasan wali kelas.',
});

/**
 * Class management dashboard page.
 *
 * @param props - Route params including locale.
 * @returns Rendered class management page.
 */
export default async function KelasPage(props: KelasPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <ClassManager />;
}
