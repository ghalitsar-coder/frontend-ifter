import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PiketManager } from '@/components/piket/PiketManager';

export type PiketPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for gate duty and RFID monitoring page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: PiketPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'PiketPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * School gate duty and RFID attendance monitoring page.
 *
 * @param props - Route params including locale.
 * @returns Rendered Piket page.
 */
export default async function PiketPage(props: PiketPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <PiketManager />;
}
