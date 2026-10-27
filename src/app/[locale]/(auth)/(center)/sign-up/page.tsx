import { redirect } from '@/libs/I18nNavigation';

/**
 * School registration replaced Clerk sign-up, so the old route forwards to the Attendly wizard.
 *
 * @param props - Route params including locale.
 */
export default async function SignUpPage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  redirect({ href: '/pendaftaran', locale });
}
