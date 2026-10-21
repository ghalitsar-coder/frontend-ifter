import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { RekapManager } from '@/components/rekap/RekapManager';

export type RekapPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for Rekapitulasi Presensi page.
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(
  props: RekapPageProps,
): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'RekapPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Monthly Attendance Matrix & Reports Dashboard page.
 * @param props - Route params including locale.
 * @returns Rendered Rekap page.
 */
export default async function RekapPage(props: RekapPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <RekapManager />;
}
