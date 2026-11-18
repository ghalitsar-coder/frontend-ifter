import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { DisciplineSummonsView } from '@/components/kedisiplinan/pages/DisciplineSummonsView';

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
    title: `Pemanggilan Orang Tua - ${t('meta_title')}`,
  };
}

export default async function PemanggilanOrangTuaPage(props: SubpageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <DisciplineSummonsView />;
}
