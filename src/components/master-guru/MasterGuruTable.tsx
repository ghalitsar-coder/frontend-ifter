import {
  CalendarDays,
  Edit2,
  GraduationCap,
  Link2,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TeacherAccount } from '@/lib/api/master-guru';
import type { TeacherProfile } from '@/types/masterGuru';

/**
 * Tone classes for the role badge in the roles column.
 * @param isAdmin - Role text mentions Admin.
 * @param isHomeroom - Role text mentions Wali.
 * @param isPiket - Role text mentions Piket.
 * @returns Tailwind class fragment for the badge.
 */
function roleBadgeTone(isAdmin: boolean, isHomeroom: boolean, isPiket: boolean): string {
  if (isAdmin) {
    return 'border border-amber-300 bg-amber-100 text-amber-900';
  }
  if (isHomeroom) {
    return 'border border-emerald-200 bg-emerald-50 text-emerald-800';
  }
  if (isPiket) {
    return 'border border-sky-200 bg-sky-50 text-sky-800';
  }
  return 'bg-slate-100 text-slate-700';
}

/**
 * Responsive table displaying educator records, homeroom classes, and picket assignments.
 *
 * @param props - Component properties.
 * @returns Table JSX element.
 */
export function MasterGuruTable(props: {
  teachers: TeacherProfile[];
  onEditTeacher: (teacher: TeacherProfile) => void;
  onAssignHomeroom: (teacher: TeacherProfile) => void;
  accounts?: Record<string, TeacherAccount>;
  isStatusUpdating?: boolean;
  onToggleStatus?: (teacherId: string, name: string, next: 'active' | 'inactive') => void;
}) {
  const t = useTranslations('MasterGuruPage');

  if (props.teachers.length === 0) {
    return (
      <div className="bg-surface-card rounded-2xl border border-dashed border-border-control p-12 text-center">
        <div className="text-text-muted mx-auto mb-3 flex size-12 items-center justify-center rounded-full bg-slate-100">
          <GraduationCap className="size-6" />
        </div>
        <h3 className="mb-1 text-base font-bold text-pine-deep">{t('empty_teachers_title')}</h3>
        <p className="text-text-muted mx-auto max-w-sm text-xs">{t('empty_teachers_desc')}</p>
      </div>
    );
  }

  return (
    <div className="bg-surface-card overflow-hidden rounded-2xl border border-border-control shadow-xs">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs sm:text-sm">
          <thead>
            <tr className="bg-canvas-base text-text-muted border-b border-border-subtle text-[11px] font-semibold tracking-wider uppercase">
              <th className="px-4 py-3.5 sm:px-6">{t('th_educator_name')}</th>
              <th className="px-4 py-3.5">{t('th_contacts')}</th>
              <th className="px-4 py-3.5">{t('th_system_roles')}</th>
              <th className="px-4 py-3.5">{t('th_homeroom_assignment')}</th>
              <th className="px-4 py-3.5">{t('th_picket_schedule')}</th>
              <th className="px-4 py-3.5">{t('th_status')}</th>
              <th className="px-4 py-3.5 text-right sm:px-6">{t('th_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {props.teachers.map((teacher) => {
              const initials = teacher.name
                .replace(/^(Drs\.|Bpk\.|Ibu)\s+/iu, '')
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <tr key={teacher.id} className="group transition-colors hover:bg-slate-50/80">
                  {/* Name & NIP */}
                  {/* oxlint-disable-next-line jsx-a11y/control-has-associated-label -- table cell groups the row's avatar, name and action controls */}
                  <td className="px-4 py-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-pine-deep text-xs font-bold text-white shadow-xs ring-1 ring-border-subtle">
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-text-primary leading-tight font-bold transition-colors group-hover:text-pine-deep">
                          {teacher.name}
                        </span>
                        <span className="text-text-muted mt-0.5 text-[11px]">
                          {t('label_nip')}: {teacher.nip}
                        </span>
                        {teacher.subject !== '' && (
                          <span className="text-[10px] font-medium text-amber-800">
                            {teacher.subject}
                          </span>
                        )}
                        {props.accounts?.[teacher.id] !== undefined && (
                          <span
                            className="mt-0.5 flex items-center gap-1 text-[10px] font-semibold text-emerald-700"
                            title={`Akun sistem terhubung: @${props.accounts[teacher.id]?.username}`}
                          >
                            <Link2 className="size-3 shrink-0" />@
                            {props.accounts[teacher.id]?.username}
                          </span>
                        )}
                      </div>
                    </div>
                  </td>

                  {/* Contacts */}
                  <td className="px-4 py-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <a
                        href={`mailto:${teacher.email}`}
                        aria-label={teacher.email}
                        className="text-text-muted flex items-center gap-1.5 transition-colors hover:text-pine-deep"
                      >
                        <Mail className="text-text-muted size-3 shrink-0" />
                        <span className="max-w-[150px] truncate">{teacher.email}</span>
                      </a>
                      <a
                        href={`https://wa.me/${teacher.phone.replaceAll(/[^0-9]/gu, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={teacher.phone}
                        className="flex items-center gap-1.5 font-medium text-emerald-700 transition-colors hover:text-emerald-800"
                      >
                        <Phone className="size-3 shrink-0 text-emerald-600" />
                        <span>{teacher.phone}</span>
                      </a>
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="px-4 py-4">
                    <div className="flex max-w-[170px] flex-wrap gap-1">
                      {teacher.roles.map((role) => {
                        const isHomeroom = role.includes('Wali');
                        const isPiket = role.includes('Piket');
                        const isAdmin = role.includes('Admin');

                        return (
                          <span
                            key={role}
                            className={`rounded-md px-2 py-0.5 text-[10px] font-bold tracking-tight whitespace-nowrap ${roleBadgeTone(isAdmin, isHomeroom, isPiket)}`}
                          >
                            {role}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Homeroom Assignment */}
                  <td className="px-4 py-4">
                    {teacher.homeroomClass ? (
                      <div className="flex flex-col">
                        <span className="flex items-center gap-1 text-xs font-bold text-pine-deep sm:text-sm">
                          <GraduationCap className="size-3.5 shrink-0 text-pine-deep" />
                          {teacher.homeroomClass.className}
                        </span>
                        <span className="text-text-muted mt-0.5 text-[11px]">
                          {teacher.homeroomClass.studentCount > 0 && (
                            <>
                              ({teacher.homeroomClass.studentCount} {t('unit_students')})
                            </>
                          )}
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs italic">
                        {t('label_unassigned_homeroom')}
                      </span>
                    )}
                  </td>

                  {/* Picket Duty */}
                  <td className="px-4 py-4">
                    {teacher.picketDuty ? (
                      <div className="flex flex-col text-xs">
                        <span className="text-text-primary flex items-center gap-1 font-semibold">
                          <CalendarDays className="size-3 shrink-0 text-amber-600" />
                          {teacher.picketDuty.day}
                        </span>
                        <span className="text-text-muted mt-0.5 flex items-center gap-1 text-[11px]">
                          <MapPin className="text-text-muted size-3 shrink-0" />
                          <span className="max-w-[130px] truncate">
                            {teacher.picketDuty.postLocation}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-text-muted text-xs italic">
                        {t('label_no_piket_schedule')}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-4 py-4">
                    {props.onToggleStatus === undefined ? (
                      <span
                        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold ${
                          teacher.status === 'active'
                            ? 'bg-emerald-100/70 text-emerald-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            teacher.status === 'active' ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        />
                        {teacher.status === 'active'
                          ? t('status_badge_active')
                          : t('status_badge_leave')}
                      </span>
                    ) : (
                      <button
                        type="button"
                        disabled={props.isStatusUpdating ?? false}
                        title="Klik untuk mengubah status aktif/nonaktif"
                        onClick={() => {
                          props.onToggleStatus?.(
                            teacher.id,
                            teacher.name,
                            teacher.status === 'active' ? 'inactive' : 'active',
                          );
                        }}
                        className={`inline-flex cursor-pointer items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition-colors disabled:opacity-50 ${
                          teacher.status === 'active'
                            ? 'bg-emerald-100/70 text-emerald-800 hover:bg-emerald-200/80'
                            : 'bg-amber-100 text-amber-800 hover:bg-amber-200/80'
                        }`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${
                            teacher.status === 'active' ? 'bg-emerald-600' : 'bg-amber-600'
                          }`}
                        />
                        {teacher.status === 'active'
                          ? t('status_badge_active')
                          : t('status_badge_leave')}
                      </button>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-4 text-right sm:px-6">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          props.onAssignHomeroom(teacher);
                        }}
                        className="cursor-pointer rounded-lg p-1.5 text-pine-deep transition-colors hover:bg-pine-light"
                        title={t('btn_manage_assignment')}
                        aria-label={t('btn_manage_assignment')}
                      >
                        <Settings className="size-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          props.onEditTeacher(teacher);
                        }}
                        className="text-text-muted cursor-pointer rounded-lg p-1.5 transition-colors hover:bg-slate-100 hover:text-pine-deep"
                        title={t('btn_edit_teacher')}
                        aria-label={t('btn_edit_teacher')}
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <a
                        href={`https://wa.me/${teacher.phone.replaceAll(/[^0-9]/gu, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-lg p-1.5 text-emerald-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                        title={t('btn_chat_whatsapp')}
                        aria-label={t('btn_chat_whatsapp')}
                      >
                        <MessageCircle className="size-4" />
                      </a>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
