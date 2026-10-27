import { setRequestLocale } from 'next-intl/server';
import { PendaftaranWizard } from '@/components/pendaftaran/PendaftaranWizard';

type PendaftaranPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Public portal where a school registers itself with Attendly.
 *
 * @param props - Route params including locale.
 * @returns Registration wizard.
 */
export default async function PendaftaranPage(props: PendaftaranPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <PendaftaranWizard />;
}
