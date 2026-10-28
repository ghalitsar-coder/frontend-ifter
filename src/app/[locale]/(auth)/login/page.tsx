import { setRequestLocale } from 'next-intl/server';
import { PresensiAuthGate } from '@/components/presensi/PresensiAuthGate';

export type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Sign-in page of the Attendly portal: restored sessions go straight to the dashboard.
 *
 * @param props - Route params including locale.
 * @returns Login screen behind the session gate.
 */
export default async function LoginPage(props: LoginPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <PresensiAuthGate />;
}
