import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DisciplineInspectionView } from '@/components/kedisiplinan/pages/DisciplineInspectionView';

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
    title: `Pemeriksaan Kelas Harian - ${t('meta_title')}`,
  };
}

export default async function PemeriksaanHarianPage(props: SubpageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <DisciplineInspectionView />;
}
