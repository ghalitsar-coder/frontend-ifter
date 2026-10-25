'use client';

import { Show, SignOutButton } from '@clerk/nextjs';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { MaterialIcon } from '@/components/landing/MaterialIcon';
import { LocaleSwitcher } from '@/components/LocaleSwitcher';
import { Link } from '@/libs/I18nNavigation';
import { dashboardRoles, roleConfigs } from './navigation';
import type { DashboardRole, NavBadgeTone, NavItem, RoleCallout } from './navigation';

const badgeToneClassName: Record<NavBadgeTone, string> = {
  amber: 'bg-amber-gold text-pine-deep',
  sick: 'bg-status-sick text-pine-deep',
  permission: 'bg-status-permission text-pine-deep',
  error: 'bg-error text-on-primary',
  pine: 'bg-pine-deep text-amber-gold',
  muted: 'bg-tertiary-container text-primary-fixed-dim',
  surface: 'bg-amber-surface text-amber-dark',
  present: 'bg-status-present text-pine-deep',
};

const resolveRole = (value: string | null): DashboardRole =>
  dashboardRoles.find((role) => role === value) ?? 'admin';

const NavItemRow = (props: {
  item: NavItem;
  collapsed: boolean;
  activeClassName: string;
  activeIconClassName: string;
}) => {
  const rowClassName = `flex items-center rounded-xl py-2 font-label-md text-label-md transition-colors ${
    props.collapsed ? 'justify-center px-0' : 'justify-between px-3'
  } ${
    props.item.active
      ? props.activeClassName
      : 'text-primary-fixed-dim hover:bg-pine-hover hover:text-on-primary'
  }`;

  const content = (
    <>
      <div className="flex items-center gap-2.5 truncate">
        <MaterialIcon
          className={`shrink-0 text-[18px] ${props.item.active ? props.activeIconClassName : ''}`}
          name={props.item.icon}
        />
        {props.collapsed ? null : <span className="truncate">{props.item.label}</span>}
      </div>
      {props.collapsed ? null : (
        <>
          {props.item.badge ? (
            <span
              className={`shrink-0 px-1.5 py-0.5 text-[10px] font-bold ${
                props.item.badge.box ? 'rounded' : 'rounded-full'
              } ${badgeToneClassName[props.item.badge.tone]}`}
            >
              {props.item.badge.label}
            </span>
          ) : null}
          {props.item.dot ? (
            <span
              className={`size-2 shrink-0 rounded-full ${
                props.item.dot === 'amber' ? 'bg-amber-gold' : 'bg-status-absent'
              }`}
            />
          ) : null}
          {props.item.arrow ? (
            <MaterialIcon
              className="shrink-0 text-[16px] text-primary-fixed-dim/60"
              name="arrow_forward_ios"
            />
          ) : null}
        </>
      )}
    </>
  );

  return props.item.href ? (
    <Link className={rowClassName} href={props.item.href}>
      {content}
    </Link>
  ) : (
    <div className={rowClassName}>{content}</div>
  );
};

const Callout = (props: { callout: RoleCallout }) => {
  if (props.callout.kind === 'mandate') {
    return (
      <div className="flex flex-col gap-1 rounded-xl bg-pine-hover p-3 text-on-primary">
        <div className="flex items-center gap-1.5 text-amber-gold">
          <MaterialIcon className="text-[16px]" name="info" />
          <span className="font-eyebrow text-[11px] tracking-wider uppercase">
            {props.callout.title}
          </span>
        </div>
        <p className="font-caption text-[11px] leading-snug text-primary-fixed-dim">
          {props.callout.text}
        </p>
      </div>
    );
  }

  if (props.callout.kind === 'approval') {
    return (
      <div className="flex flex-col gap-2 rounded-xl bg-amber-surface p-3 text-amber-dark">
        <div className="flex items-center justify-between">
          <span className="font-label-md text-xs font-bold">{props.callout.title}</span>
          <span className="font-caption text-[10px]">{props.callout.period}</span>
        </div>
        <p className="font-caption text-[11px] leading-tight">{props.callout.text}</p>
        <button
          className="w-full rounded-lg bg-pine-deep py-1.5 font-label-md text-[11px] font-semibold text-on-primary transition-colors hover:bg-pine-hover"
          type="button"
        >
          {props.callout.action}
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between rounded-xl bg-tertiary-container/60 p-3 text-on-primary">
      <div className="flex items-center gap-2">
        <span className="size-2.5 rounded-full bg-status-present" />
        <span className="font-caption text-caption text-primary-fixed-dim">
          {props.callout.label}
        </span>
      </div>
      <span className="font-eyebrow text-[10px] font-bold tracking-wider text-amber-gold uppercase">
        {props.callout.value}
      </span>
    </div>
  );
};

export const DashboardShell = (props: { children: React.ReactNode }) => {
  const searchParams = useSearchParams();
  const role = resolveRole(searchParams.get('role'));
  const config = roleConfigs[role];
  const [collapsed, setCollapsed] = useState(false);

  return (
    <div className="min-h-screen bg-surface font-body-md text-on-surface antialiased">
      <aside
        aria-label="Navigasi utama"
        className={`fixed top-0 left-0 z-50 flex h-full flex-col justify-between bg-pine-deep text-on-primary shadow-[0_8px_24px_rgba(23,63,54,0.12)] transition-all duration-300 ${
          collapsed ? 'w-20' : 'w-72'
        }`}
        id="app-sidebar"
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <div
            className={`flex h-20 items-center border-b border-pine-hover ${
              collapsed ? 'justify-center px-0' : 'justify-between px-6'
            }`}
          >
            <div className="flex items-center gap-3 overflow-hidden">
              <div
                aria-hidden
                className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-amber-gold font-headline-sm font-bold text-pine-deep shadow-sm"
              >
                A
              </div>
              {collapsed ? null : (
                <div className="flex flex-col">
                  <span className="font-headline-sm text-lg leading-none font-bold tracking-tight text-on-primary">
                    Attendly
                  </span>
                  <span className="mt-1 font-caption text-caption tracking-wider text-primary-fixed-dim uppercase">
                    {config.workspace}
                  </span>
                </div>
              )}
            </div>
            <div className="flex shrink-0 items-center">
              <button
                aria-expanded={!collapsed}
                aria-label="Perkecil atau perluas sidebar"
                className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-pine-hover text-on-primary transition-colors hover:bg-pine-deep"
                onClick={() => {
                  setCollapsed(!collapsed);
                }}
                type="button"
              >
                <MaterialIcon className="text-[20px]" name={collapsed ? 'menu' : 'menu_open'} />
              </button>
            </div>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto p-3">
            {config.sections.map((section) => (
              <div key={section.title}>
                {collapsed ? null : (
                  <span className="px-2.5 font-eyebrow text-[11px] tracking-wider text-primary-fixed-dim/70 uppercase">
                    {section.title}
                  </span>
                )}
                <nav className="mt-1 space-y-0.5">
                  {section.items.map((item) => (
                    <NavItemRow
                      activeClassName={config.activeClassName}
                      activeIconClassName={config.activeIconClassName}
                      collapsed={collapsed}
                      item={item}
                      key={item.label}
                    />
                  ))}
                </nav>
              </div>
            ))}
            {config.callout && !collapsed ? <Callout callout={config.callout} /> : null}
          </div>
        </div>

        <div
          className={`flex items-center gap-2.5 bg-tertiary-container/40 p-3 ${
            collapsed ? 'justify-center px-0' : ''
          }`}
        >
          <div
            className={`flex size-8 shrink-0 items-center justify-center rounded-full text-xs font-bold ${config.user.avatarClassName}`}
          >
            {config.user.initials}
          </div>
          {collapsed ? null : (
            <div className="flex flex-col overflow-hidden">
              <span className="truncate font-label-md text-xs font-semibold text-on-primary">
                {config.user.name}
              </span>
              <span className="truncate font-caption text-[10px] text-primary-fixed-dim">
                {config.user.meta}
              </span>
            </div>
          )}
        </div>
      </aside>

      <div
        className={`flex min-h-screen flex-col transition-all duration-300 ${
          collapsed ? 'pl-20' : 'pl-72'
        }`}
      >
        <header
          className={`fixed top-0 right-0 z-40 flex h-20 items-center justify-between border-b border-border-subtle bg-surface-card/90 px-8 shadow-[0_1px_8px_rgba(23,63,54,0.03)] backdrop-blur-xl transition-all duration-300 ${
            collapsed ? 'left-20' : 'left-72'
          }`}
        >
          <div className="hidden items-center gap-6 md:flex">
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-headline-sm text-base font-bold text-text-primary">
                  SMP Negeri 1 Harapan Bangsa
                </span>
                <span className="inline-flex items-center rounded-full bg-status-present px-2 py-0.5 text-[11px] font-semibold tracking-wide text-pine-deep">
                  TA 2026/2027 Ganjil
                </span>
              </div>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-text-muted">
                <MaterialIcon className="text-[14px] text-amber-dark" name="calendar_today" />
                <span>Kamis, 24 Okt 2026</span>
                <span className="text-border-control">•</span>
                <span className="flex items-center gap-1 font-medium text-pine-deep">
                  <span className="size-1.5 animate-pulse rounded-full bg-pine-deep" />
                  Sesi Pagi Berjalan
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative hidden w-72 md:block">
              <MaterialIcon
                className="absolute top-1/2 left-3 -translate-y-1/2 text-[18px] text-text-muted"
                name="search"
              />
              <input
                aria-label="Pencarian NIS, nama siswa, atau guru"
                className="h-10 w-full rounded-xl border border-border-control bg-canvas-base pr-4 pl-9 text-sm text-text-primary transition-all placeholder:text-text-muted focus:border-pine-deep focus:ring-2 focus:ring-pine-deep/10 focus:outline-none"
                placeholder="Cari NIS, Siswa, Guru..."
                type="search"
              />
            </div>
            <button
              aria-label="Notifikasi terkini"
              className="relative flex size-10 items-center justify-center rounded-xl bg-canvas-base text-text-primary transition-colors hover:bg-pine-light"
              type="button"
            >
              <MaterialIcon className="text-[20px]" name="notifications" />
              <span className="absolute top-2 right-2 size-2 rounded-full bg-amber-gold ring-2 ring-surface-card" />
            </button>
            <LocaleSwitcher />
            <Show when="signed-in">
              <SignOutButton>
                <button
                  aria-label="Keluar"
                  className="flex size-10 items-center justify-center rounded-xl bg-canvas-base text-text-primary transition-colors hover:bg-pine-light"
                  type="button"
                >
                  <MaterialIcon className="text-[20px]" name="logout" />
                </button>
              </SignOutButton>
            </Show>
            <div className="hidden h-8 w-px bg-border-subtle sm:block" />
            <Link className="flex items-center gap-3 pl-1" href="/dashboard/user-profile">
              <div className="hidden flex-col text-right sm:flex">
                <span className="text-sm leading-snug font-semibold text-text-primary">
                  {config.user.name}
                </span>
                <span className="text-xs leading-tight text-text-muted">{config.headerRole}</span>
              </div>
              <div className="flex size-8 items-center justify-center rounded-full bg-pine-deep shadow-sm">
                <MaterialIcon className="text-[18px] text-on-primary" name="person" />
              </div>
            </Link>
          </div>
        </header>

        <main className="relative flex-1 bg-surface pt-20">
          <div className="flex w-full flex-col">{props.children}</div>
        </main>
      </div>
    </div>
  );
};
