import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MasterSiswaManager } from '@/components/master-siswa/MasterSiswaManager';

export type MasterSiswaPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for student master records page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: MasterSiswaPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'MasterSiswaPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Master student data and class group management dashboard page.
 *
 * @param props - Route params including locale.
 * @returns Rendered master siswa page.
 */
export default async function MasterSiswaPage(props: MasterSiswaPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <MasterSiswaManager />;
}
