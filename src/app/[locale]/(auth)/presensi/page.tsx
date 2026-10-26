import { setRequestLocale } from 'next-intl/server';
import { PresensiAuthGate } from '@/components/presensi/PresensiAuthGate';

export type PresensiPageProps = {
  params: Promise<{ locale: string }>;
};

/**
 * Daily class attendance page using the Attendly Stitch design.
 *
 * @param props - Route params including locale.
 * @returns Attendance workspace.
 */
export default async function PresensiPage(props: PresensiPageProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <PresensiAuthGate />;
}
