import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { MasterGuruManager } from '@/components/master-guru/MasterGuruManager';

export type MasterGuruPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for Master Guru & Penugasan page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: MasterGuruPageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'MasterGuruPage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Master Data Guru & Penugasan dashboard page.
 *
 * @param props - Route params including locale.
 * @returns Rendered master guru workspace.
 */
export default async function MasterGuruPage(props: MasterGuruPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <MasterGuruManager />;
}
