import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DisciplineCounselingView } from '@/components/kedisiplinan/pages/DisciplineCounselingView';

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
    title: `Rekam Bimbingan Konseling BK - ${t('meta_title')}`,
  };
}

export default async function RekamBimbinganPage(props: SubpageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <DisciplineCounselingView />;
}
