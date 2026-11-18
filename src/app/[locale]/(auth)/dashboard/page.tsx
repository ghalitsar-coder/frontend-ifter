import { setRequestLocale } from 'next-intl/server';
import { Hello } from '@/components/Hello';
import { readBackendToken } from '@/libs/BackendSession';
import { decodeBackendToken } from '@/libs/DashboardAccess';
import { redirect } from '@/libs/I18nNavigation';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const token = await readBackendToken();
  const session = decodeBackendToken(token);
  if (session && !session.expired) {
    if (session.roles.includes('kesiswaan')) {
      redirect({ href: '/dashboard/kedisiplinan?role=kesiswaan', locale });
    } else if (session.roles.includes('guru')) {
      redirect({ href: '/dashboard/presensi', locale });
    }
  }

  return (
    <div className="py-5 [&_p]:my-6">
      <Hello />
    </div>
  );
}
