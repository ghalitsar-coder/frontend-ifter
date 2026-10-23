import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DispensationManager } from '@/components/izin-dispensasi/DispensationManager';

export type DispensationPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the dispensation submission page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: DispensationPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DispensationPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Official dispensation and absence statement page.
 *
 * @param props - Route params including locale.
 * @returns Dispensation workspace.
 */
export default async function DispensationPage(props: DispensationPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <DispensationManager />;
}
