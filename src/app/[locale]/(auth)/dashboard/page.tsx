import { setRequestLocale } from 'next-intl/server';
import { Hello } from '@/components/Hello';
import { readBackendToken } from '@/libs/BackendSession';
import {
  dashboardHrefForRoles,
  dashboardRoleForRoles,
  decodeBackendToken,
} from '@/libs/DashboardAccess';
import { redirect } from '@/libs/I18nNavigation';

export default async function DashboardPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const token = await readBackendToken();
  const session = decodeBackendToken(token);
  if (session && !session.expired) {
    const role = dashboardRoleForRoles(session.roles);
    if (role === 'kesiswaan' || role === 'guru') {
      redirect({ href: dashboardHrefForRoles(session.roles), locale });
    }
  }

  return (
    <div className="py-5 [&_p]:my-6">
      <Hello />
    </div>
  );
}
