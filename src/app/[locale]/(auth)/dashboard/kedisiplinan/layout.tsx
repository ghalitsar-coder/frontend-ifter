import { setRequestLocale } from 'next-intl/server';
import { readBackendToken } from '@/libs/BackendSession';
import { dashboardHrefForRoles, decodeBackendToken } from '@/libs/DashboardAccess';
import { redirect } from '@/libs/I18nNavigation';

type DisciplineLayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

/**
 * Server-side role guard for `/dashboard/kedisiplinan` and all sub-pages: only signed-in users
 * carrying the `kesiswaan` role may view or manage student discipline records.
 *
 * @param props - Route params and nested page content.
 * @returns Nested discipline page when authorized, otherwise redirects.
 */
export default async function DisciplineLayout(props: DisciplineLayoutProps) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  const token = await readBackendToken();
  const session = decodeBackendToken(token);

  if (session === null || session.expired) {
    redirect({ href: '/sign-in', locale });
  } else if (!session.roles.includes('kesiswaan')) {
    redirect({ href: dashboardHrefForRoles(session.roles), locale });
  }

  return props.children;
}
