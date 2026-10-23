import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { TatibManager } from '@/components/tatib/TatibManager';

export type TatibPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for the school code of conduct page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: TatibPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'TatibPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Master code of conduct and sanction threshold dashboard page.
 *
 * @param props - Route params including locale.
 * @returns Rendered conduct rule workspace.
 */
export default async function TatibPage(props: TatibPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <TatibManager />;
}
