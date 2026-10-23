'use client';

import { SignOutButton } from '@clerk/nextjs';
import {
  Bell,
  Calendar,
  CheckCircle2,
  LayoutDashboard,
  LogOut,
  Menu,
  School,
  ShieldAlert,
  User,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link, usePathname } from '@/libs/I18nNavigation';

/**
 * Attendly school management responsive application shell.
 * Replaces default boilerplate template with modern Pine & Amber layout.
 *
 * @param props - Layout properties containing page children.
 * @returns Shell JSX layout.
 */
export function AttendlyShell(props: {
  children: React.ReactNode;
  userEmail?: string;
}) {
  const t = useTranslations('DashboardLayout');
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Navigation menu groupings
  const navSections = [
    {
      title: 'Menu Utama',
      items: [
        {
          label: t('dashboard_link'),
          href: '/dashboard',
          icon: LayoutDashboard,
          badge: null,
        },
        {
          label: t('presensi_link'),
          href: '/dashboard/presensi',
          icon: UserCheck,
          badge: 'Sesi Aktif',
        },
        {
          label: t('kedisiplinan_link'),
          href: '/dashboard/kedisiplinan',
          icon: ShieldAlert,
          badge: null,
        },
      ],
    },
    {
      title: 'Master Data & Penugasan',
      items: [
        {
          label: t('master_guru_link'),
          href: '/dashboard/master-guru',
          icon: Users,
          badge: 'FR-A03',
        },
      ],
    },
    {
      title: 'Konfigurasi Sistem',
      items: [
        {
          label: t('user_profile_link'),
          href: '/dashboard/user-profile',
          icon: User,
          badge: null,
        },
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-[#F8F9F8] text-[#111816] flex flex-col selection:bg-[#F2C96C] selection:text-[#173F36]">
      {/* Top Header Bar */}
      <header className="sticky top-0 z-40 h-16 w-full border-b border-[#E4E8E6] bg-white/95 backdrop-blur-md px-4 sm:px-6 lg:px-8 flex items-center justify-between shadow-xs">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            className="lg:hidden p-2 rounded-xl text-[#6E7A76] hover:text-[#173F36] hover:bg-[#E9F0EE] transition-colors cursor-pointer"
            aria-label="Toggle navigasi mobile"
          >
            {isMobileMenuOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>

          <Link href="/dashboard" className="flex items-center gap-2.5">
            <div className="size-9 rounded-xl bg-[#173F36] text-white flex items-center justify-center font-bold shadow-xs">
              <School className="size-5 text-[#F2C96C]" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-extrabold text-[#173F36] tracking-tight leading-none">
                Attendly
              </span>
              <span className="text-[10px] text-[#6E7A76] font-medium tracking-tight">
                Sistem Presensi & Akademik
              </span>
            </div>
          </Link>
        </div>

        {/* Center: Academic Period & Date Pill (Desktop) */}
        <div className="hidden md:flex items-center gap-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E9F0EE] border border-[#D4DAD7] text-xs font-semibold text-[#173F36]">
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
            className="relative p-2 rounded-xl text-[#6E7A76] hover:text-[#173F36] hover:bg-[#E9F0EE] transition-colors cursor-pointer"
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
          <SignOutButton>
            <button
              type="button"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-[#6E7A76] hover:text-red-700 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
              title={t('sign_out')}
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">{t('sign_out')}</span>
            </button>
          </SignOutButton>
        </div>
      </header>

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex w-full">
        {/* Desktop Fixed Sidebar */}
        <aside className="hidden lg:flex w-64 xl:w-72 flex-col justify-between border-r border-[#E4E8E6] bg-white p-4 shrink-0">
          <div className="space-y-6">
            {/* Academic Cycle Status Card */}
            <div className="rounded-xl border border-[#F2C96C]/40 bg-[#FDF8ED] p-3 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#785a00]" />
                  <span className="text-xs font-bold text-[#785a00]">
                    2026/2027 Ganjil
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-[#F2C96C] text-[#173F36]">
                  Aktif
                </span>
              </div>
              <p className="text-[11px] text-[#6E7A76] mt-1 leading-snug">
                Semester gasal aktif • 18 Rombongan belajar
              </p>
            </div>

            {/* Navigation Menus */}
            {navSections.map((section) => (
              <div key={section.title} className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E7A76] px-3 block">
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
                        className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
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
                            className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
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

          {/* Bottom System Health Status */}
          <div className="pt-4 border-t border-[#E4E8E6] space-y-2">
            <div className="rounded-xl bg-[#E9F0EE] p-3 flex items-center justify-between">
              <div className="flex flex-col">
                <span className="text-[10px] text-[#6E7A76] font-medium">
                  Attendly Gateway v2.4
                </span>
                <span className="text-xs font-bold text-[#173F36] flex items-center gap-1.5">
                  <span className="size-2 rounded-full bg-emerald-500 animate-pulse" />
                  Sistem Normal
                </span>
              </div>
              <CheckCircle2 className="size-4 text-[#173F36]" />
            </div>
            {props.userEmail && (
              <p className="text-[10px] text-[#6E7A76] truncate px-1">
                Akun: {props.userEmail}
              </p>
            )}
          </div>
        </aside>

        {/* Mobile Navigation Drawer Backdrop & Modal */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => {
                setIsMobileMenuOpen(false);
              }}
              aria-hidden="true"
            />
            <div className="relative w-72 max-w-[85vw] bg-white h-full p-4 flex flex-col justify-between shadow-2xl z-10 animate-in slide-in-from-left duration-200">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[#E4E8E6]">
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-lg bg-[#173F36] text-white flex items-center justify-center font-bold">
                      <School className="size-4 text-[#F2C96C]" />
                    </div>
                    <span className="text-base font-bold text-[#173F36]">Attendly</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-1 rounded-lg text-[#6E7A76] hover:bg-[#E9F0EE]"
                    aria-label="Tutup menu"
                  >
                    <X className="size-5" />
                  </button>
                </div>

                {navSections.map((section) => (
                  <div key={section.title} className="space-y-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#6E7A76] px-3 block">
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
                            className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
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
                                className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
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

              <div className="pt-3 border-t border-[#E4E8E6]">
                <SignOutButton>
                  <button
                    type="button"
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 transition-colors"
                  >
                    <LogOut className="size-4" />
                    <span>{t('sign_out')}</span>
                  </button>
                </SignOutButton>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Workspace Container */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto w-full">
            {props.children}
          </div>
        </main>
      </div>
    </div>
  );
}
