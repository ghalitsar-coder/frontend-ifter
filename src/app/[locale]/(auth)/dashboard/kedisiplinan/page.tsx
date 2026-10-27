import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DisciplineManager } from '@/components/kedisiplinan/DisciplineManager';

export type DisciplinePageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Generate metadata for discipline and student points management page.
 *
 * @param props - Page route params.
 * @returns Metadata object.
 */
export async function generateMetadata(props: DisciplinePageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DisciplinePage',
  });

  return {
    title: t('meta_title'),
    description: t('meta_description'),
  };
}

/**
 * Student discipline and points monitoring page.
 *
 * @param props - Route params including locale.
 * @returns Rendered discipline page.
 */
export default async function DisciplinePage(props: DisciplinePageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <DisciplineManager />;
}
