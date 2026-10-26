'use client';

import { useTranslations } from 'next-intl';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link, useRouter } from '@/libs/I18nNavigation';
import { signOut } from '@/services/presensiApi';
import type { DashboardRole, RoleConfig } from './navigation';

type ProfileMenuProps = {
  children: React.ReactNode;
  config: RoleConfig;
  role: DashboardRole;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom' | 'left' | 'right';
  triggerClassName?: string;
};

/**
 * Shared profile dropdown for the dashboard shell header and sidebar: the account identity,
 * profile/settings links that keep the active role, and the sign-out action.
 *
 * @param props - Role config, the current role, the trigger markup and menu placement.
 * @returns Dropdown menu wired to the shell navigation.
 */
export const ProfileMenu = (props: ProfileMenuProps) => {
  const t = useTranslations('DashboardLayout');
  const router = useRouter();
  const roleQuery = props.role === 'admin' ? '' : `&role=${props.role}`;

  const handleSignOut = async () => {
    await signOut();
    router.replace('/sign-in');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={props.triggerClassName}>{props.children}</DropdownMenuTrigger>
      <DropdownMenuContent align={props.align} className="w-64" side={props.side}>
        <DropdownMenuGroup>
          <DropdownMenuLabel className="flex flex-col gap-0.5 py-2">
            <span className="text-sm font-semibold text-text-primary">{props.config.user.name}</span>
            <span className="text-xs font-normal text-text-muted">{props.config.headerRole}</span>
          </DropdownMenuLabel>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href={`/dashboard/segera?item=${encodeURIComponent('Profil Saya')}${roleQuery}`} />
          }
        >
          {t('menu_profile')}
        </DropdownMenuItem>
        <DropdownMenuItem
          render={
            <Link
              href={`/dashboard/segera?item=${encodeURIComponent('Pengaturan Akun')}${roleQuery}`}
            />
          }
        >
          {t('menu_settings')}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut} variant="destructive">
          {t('menu_sign_out')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
