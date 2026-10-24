import { setRequestLocale } from 'next-intl/server';
import { UserProfileView } from '@/components/auth/UserProfileView';

export default async function UserProfilePage(props: { params: Promise<{ locale: string }> }) {
  const { locale } = await props.params;
  setRequestLocale(locale);

  return <UserProfileView />;
}
