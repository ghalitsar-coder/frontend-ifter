import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DisciplineHandbookView } from '@/components/kedisiplinan/pages/DisciplineHandbookView';

export type SubpageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata(props: SubpageProps): Promise<Metadata> {
  const { locale } = await props.params;
  const t = await getTranslations({
    locale,
    namespace: 'DisciplinePage',
  });

  return {
    description: t('meta_description'),
    title: `Buku Pedoman Tata Tertib & Poin - ${t('meta_title')}`,
  };
}

export default async function BukuPedomanPage(props: SubpageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <DisciplineHandbookView />;
}
