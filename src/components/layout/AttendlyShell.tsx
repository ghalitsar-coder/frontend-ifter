'use client';

import {
  Bell,
  Calendar,
  ChartColumn,
  CheckCircle2,
  FileHeart,
  FilePenLine,
  GraduationCap,
  LayoutDashboard,
  LogOut,
  Menu,
  Nfc,
  School,
  Scale,
  ScanFace,
  ScrollText,
  Settings2,
  ShieldAlert,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth/AuthProvider';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { can, isStudentOnly, useRolesCatalog } from '@/lib/api/rbac';
import type { Capability } from '@/lib/api/rbac';
import { Link, useRouter, usePathname } from '@/libs/I18nNavigation';
import { getI18nPath } from '@/utils/Helpers';

/** One sidebar menu entry with the RBAC capability that gates its visibility. */
type NavItem = {
  label: string;
  href: string;
  icon: typeof LayoutDashboard;
  badge: string | null;
  capability: Capability;
};

type NavSection = {
  title: string;
  items: NavItem[];
};

/**
 * Attendly school management responsive application shell.
 * Replaces default boilerplate template with modern Pine & Amber layout.
 *
 * Menu visibility follows the 6-role matrix (docs/API_ADDENDUM.md §1–§2) via
 * `can(roles, capability)`; student-only accounts see no staff menu at all
 * and are redirected to the `/dashboard/murid` portal.
 *
 * @param props - Layout properties containing page children.
 * @returns Shell JSX layout.
 */
export function AttendlyShell(props: { children: React.ReactNode }) {
  const t = useTranslations('DashboardLayout');
  const auth = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Dynamic role catalog (GET /roles, admin-only endpoint; disabled otherwise).
  const roleCatalog = useRolesCatalog(auth.roles);
  const roleNameByCode = new Map((roleCatalog.data ?? []).map((entry) => [entry.code, entry.name]));

  const studentOnly = isStudentOnly(auth.roles);

  // Student portal gate: `student` reaches no staff route on the backend, so
  // any staff page opened by a student-only account bounces to /dashboard/murid.
  useEffect(() => {
    if (studentOnly && !pathname.startsWith('/dashboard/murid')) {
      router.replace(getI18nPath('/dashboard/murid', locale));
    }
  }, [studentOnly, pathname, locale, router]);

  // Navigation menu groupings — each item declares its capability and the
  // lists below are filtered against the signed-in roles before rendering.
  const navSections: NavSection[] = [
    {
      title: 'Menu Utama',
      items: [
        {
          label: t('dashboard_link'),
          href: '/dashboard',
          icon: LayoutDashboard,
          badge: null,
          capability: 'dashboard',
        },
        {
          label: t('presensi_link'),
          href: '/dashboard/presensi',
          icon: UserCheck,
          badge: 'Sesi Aktif',
          capability: 'attendance_ops',
        },
        {
          label: t('presensi_guru_link'),
          href: '/dashboard/presensi-guru',
          icon: ScanFace,
          badge: null,
          capability: 'attendance_ops',
        },
        {
          label: t('koreksi_link'),
          href: '/dashboard/koreksi-absensi',
          icon: FilePenLine,
          badge: 'FR-E05',
          capability: 'attendance_ops',
        },
        {
          label: t('izin_link'),
          href: '/dashboard/izin-dispensasi',
          icon: FileHeart,
          badge: 'FR-E06',
          capability: 'dispensations_read',
        },
        {
          label: t('piket_link'),
          href: '/dashboard/piket',
          icon: Nfc,
          badge: 'RFID',
          capability: 'attendance_ops',
        },
        {
          label: t('kedisiplinan_link'),
          href: '/dashboard/kedisiplinan',
          icon: ShieldAlert,
          badge: null,
          capability: 'discipline_ops',
        },
        {
          label: t('rekap_link'),
          href: '/dashboard/rekap',
          icon: ChartColumn,
          badge: null,
          capability: 'reports_read',
        },
      ],
    },
    {
      title: 'Master Data & Penugasan',
      items: [
        {
          label: t('master_siswa_link'),
          href: '/dashboard/master-siswa',
          icon: GraduationCap,
          badge: 'FR-A02',
          capability: 'master_data',
        },
        {
          label: t('master_guru_link'),
          href: '/dashboard/master-guru',
          icon: Users,
          badge: 'FR-A03',
          capability: 'master_data',
        },
        {
          label: t('tatib_link'),
          href: '/dashboard/aturan',
          icon: Scale,
          badge: 'FR-A05',
          capability: 'admin',
        },
      ],
    },
    {
      title: 'Konfigurasi Sistem',
      items: [
        {
          label: t('audit_link'),
          href: '/dashboard/audit-log',
          icon: ScrollText,
          badge: 'Admin',
          capability: 'admin',
        },
        {
          label: t('pengaturan_link'),
          href: '/dashboard/pengaturan',
          icon: Settings2,
          badge: 'FR-A06',
          // staff_tu sees the master-data part of the page (menu spec); the
          // attendance-settings API surface stays admin/read-gated.
          capability: 'settings',
        },
        {
          label: t('user_profile_link'),
          href: '/dashboard/user-profile',
          icon: User,
          badge: null,
          capability: 'authenticated',
        },
      ],
    },
  ];

  const visibleSections: NavSection[] = studentOnly
    ? []
    : navSections
        .map((section) => ({
          ...section,
          items: section.items.filter((item) => can(auth.roles, item.capability)),
        }))
        .filter((section) => section.items.length > 0);

  return (
    <div className="flex min-h-screen flex-col bg-[#F8F9F8] text-[#111816] selection:bg-[#F2C96C] selection:text-[#173F36]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-[#E4E8E6] bg-white/95 px-4 shadow-xs backdrop-blur-md sm:px-6 lg:px-8">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="cursor-pointer rounded-xl p-2 text-[#6E7A76] transition-colors hover:bg-[#E9F0EE] hover:text-[#173F36] lg:hidden"
            aria-label="Toggle navigasi mobile"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-[#173F36] font-bold text-white shadow-xs">
              <School className="size-5 text-[#F2C96C]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base leading-none font-extrabold tracking-tight text-[#173F36]">
                Attendly
              </span>
              <span className="text-[10px] font-medium tracking-tight text-[#6E7A76]">
                Sistem Presensi & Akademik
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Academic Period & Date Pill (Desktop) */}
        <div className="hidden items-center gap-3 md:flex">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#D4DAD7] bg-[#E9F0EE] px-3 py-1 text-xs font-semibold text-[#173F36]">
            <Calendar className="size-3.5 text-[#173F36]" />
            <span>T.A. 2026/2027 Ganjil</span>
            <span className="size-1.5 rounded-full bg-[#173F36]" />
            <span className="text-[#6E7A76]">Rabu, 21 Okt 2026</span>
          </div>
        </div>

        {/* Right: Quick Controls, Locale & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Notification Button */}
          <button
            type="button"
            className="relative cursor-pointer rounded-xl p-2 text-[#6E7A76] transition-colors hover:bg-[#E9F0EE] hover:text-[#173F36]"
            aria-label="Pemberitahuan sistem"
          >
            <Bell className="size-4 sm:size-5" />
            <span className="absolute top-1.5 right-1.5 size-2 rounded-full bg-red-500 ring-2 ring-white" />
          </button>

          <div className="h-6 w-px bg-[#E4E8E6]" />

          {/* Locale Switcher */}
          <LocaleSwitcher />

          <div className="h-6 w-px bg-[#E4E8E6]" />

          {/* Sign Out Button */}
          <button
            type="button"
            onClick={() => {
              void auth.logout();
            }}
            className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-transparent px-3 py-1.5 text-xs font-semibold text-[#6E7A76] transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-700"
            title={t('sign_out')}
          >
            <LogOut className="size-3.5" />
            <span className="hidden sm:inline">{t('sign_out')}</span>
          </button>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex w-full flex-1">
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden w-64 shrink-0 flex-col justify-between border-r border-[#E4E8E6] bg-white p-4 lg:flex xl:w-72">
          <div className="space-y-6">
            {/* Academic Cycle Status Card */}
            <div className="rounded-xl border border-[#F2C96C]/40 bg-[#FDF8ED] p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#785a00]" />
                  <span className="text-xs font-bold text-[#785a00]">2026/2027 Ganjil</span>
                </div>
                <span className="rounded-full bg-[#F2C96C] px-2 py-0.5 text-[10px] font-extrabold text-[#173F36]">
                  Aktif
                </span>
              </div>
              <p className="mt-1 text-[11px] leading-snug text-[#6E7A76]">
                Semester gasal aktif • 18 Rombongan belajar
              </p>
            </div>

            {/* Navigation Menus */}
            {visibleSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="block px-3 text-[10px] font-bold tracking-wider text-[#6E7A76] uppercase">
                  {section.title}
                </span>
                <div className="space-y-0.5">
                  {section.items.map((item) => {
                    const isActive =
                      item.href === '/dashboard'
                        ? pathname === '/dashboard' || pathname === '/dashboard/'
                        : pathname.startsWith(item.href);
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-xs font-semibold transition-all sm:text-sm ${
                          isActive
                            ? 'bg-[#173F36] text-white shadow-xs'
                            : 'text-[#414846] hover:bg-[#E9F0EE] hover:text-[#173F36]'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <Icon
                            className={`size-4 sm:size-4.5 ${
                              isActive ? 'text-[#F2C96C]' : 'text-[#6E7A76]'
                            }`}
                          />
                          <span>{item.label}</span>
                        </div>
                        {item.badge && (
                          <span
                            className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                              isActive ? 'bg-white/20 text-white' : 'bg-[#E9F0EE] text-[#173F36]'
                            }`}
                          >
                            {item.badge}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom System Health Status */}
          <div className="space-y-2 border-t border-[#E4E8E6] pt-4">
            <div className="flex items-center justify-between rounded-xl bg-[#E9F0EE] p-3">
              <div className="flex flex-col">
                <span className="text-[10px] font-medium text-[#6E7A76]">
                  Attendly Gateway v2.4
                </span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-[#173F36]">
                  <span className="size-2 animate-pulse rounded-full bg-emerald-500" />
                  Sistem Normal
                </span>
              </div>
              <CheckCircle2 className="size-4 text-[#173F36]" />
            </div>
            {(auth.user?.email ?? auth.user?.username) !== undefined && (
              <p className="truncate px-1 text-[10px] text-[#6E7A76]">
                Akun: {auth.user?.email ?? auth.user?.username}
              </p>
            )}
            {/* Role chips — names come from the dynamic GET /roles catalog for
                admins, raw codes for other roles (the endpoint is admin-only). */}
            {auth.roles.length > 0 && (
              <div className="flex flex-wrap gap-1 px-1">
                {auth.roles.map((role) => (
                  <span
                    key={role}
                    className="rounded-full bg-[#173F36]/5 px-2 py-0.5 text-[10px] font-semibold text-[#173F36]"
                  >
                    {roleNameByCode.get(role) ?? role}
                  </span>
                ))}
              </div>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer Backdrop & Modal */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              aria-hidden="true"
            />
            <div className="relative z-10 flex h-full w-72 max-w-[85vw] animate-in flex-col justify-between bg-white p-4 shadow-2xl duration-200 slide-in-from-left">
              <div className="space-y-6">
                <div className="flex items-center justify-between border-b border-[#E4E8E6] pb-3">
                  <div className="flex items-center gap-2">
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#173F36] font-bold text-white">
                      <School className="size-4 text-[#F2C96C]" />
                    </div>
                    <span className="text-base font-bold text-[#173F36]">Attendly</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className="rounded-lg p-1 text-[#6E7A76] hover:bg-[#E9F0EE]"
                    aria-label="Tutup menu"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {visibleSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <span className="block px-3 text-[10px] font-bold tracking-wider text-[#6E7A76] uppercase">
                      {section.title}
                    </span>
                    <div className="space-y-0.5">
                      {section.items.map((item) => {
                        const isActive =
                          item.href === '/dashboard'
                            ? pathname === '/dashboard' || pathname === '/dashboard/'
                            : pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                            }}
                            className={`flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold transition-all ${
                              isActive
                                ? 'bg-[#173F36] text-white shadow-xs'
                                : 'text-[#414846] hover:bg-[#E9F0EE] hover:text-[#173F36]'
                            }`}
                          >
                            <div className="flex items-center gap-2.5">
                              <Icon
                                className={`size-4.5 ${
                                  isActive ? 'text-[#F2C96C]' : 'text-[#6E7A76]'
                                }`}
                              />
                              <span>{item.label}</span>
                            </div>
                            {item.badge && (
                              <span
                                className={`rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                                  isActive
                                    ? 'bg-white/20 text-white'
                                    : 'bg-[#E9F0EE] text-[#173F36]'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-[#E4E8E6] pt-3">
                <button
                  type="button"
                  onClick={() => {
                    void auth.logout();
                  }}
                  className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl bg-red-50 px-3 py-2 text-xs font-bold text-red-700 transition-colors hover:bg-red-100"
                >
                  <LogOut className="size-4" />
                  <span>{t('sign_out')}</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace Container */}
        <main className="min-w-0 flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="mx-auto w-full max-w-7xl">{props.children}</div>
        </main>
      </div>
    </div>
  );
}
