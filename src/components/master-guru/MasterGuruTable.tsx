import {
  CalendarDays,
  Edit2,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Settings,
} from 'lucide-react';
import { useTranslations } from 'next-intl';
import type { TeacherProfile } from '@/types/masterGuru';

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
}) {
  const t = useTranslations('MasterGuruPage');

  if (props.teachers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-border-control bg-surface-card p-12 text-center">
        <div className="mx-auto size-12 rounded-full bg-slate-100 flex items-center justify-center text-text-muted mb-3">
          <GraduationCap className="size-6" />
        </div>
        <h3 className="text-base font-bold text-pine-deep mb-1">
          {t('empty_teachers_title')}
        </h3>
        <p className="text-xs text-text-muted max-w-sm mx-auto">
          {t('empty_teachers_desc')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-border-control bg-surface-card shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs sm:text-sm">
          <thead>
            <tr className="bg-canvas-base border-b border-border-subtle text-text-muted font-semibold text-[11px] uppercase tracking-wider">
              <th className="py-3.5 px-4 sm:px-6">{t('th_educator_name')}</th>
              <th className="py-3.5 px-4">{t('th_contacts')}</th>
              <th className="py-3.5 px-4">{t('th_system_roles')}</th>
              <th className="py-3.5 px-4">{t('th_homeroom_assignment')}</th>
              <th className="py-3.5 px-4">{t('th_picket_schedule')}</th>
              <th className="py-3.5 px-4">{t('th_status')}</th>
              <th className="py-3.5 px-4 sm:px-6 text-right">{t('th_actions')}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {props.teachers.map((teacher) => {
              const initials = teacher.name
                .replace(/^(Drs\.|Bpk\.|Ibu)\s+/i, '')
                .split(' ')
                .map((part) => part[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();

              return (
                <tr
                  key={teacher.id}
                  className="hover:bg-slate-50/80 transition-colors group"
                >
                  {/* Name & NIP */}
                  <td className="py-4 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <div className="size-10 rounded-xl bg-pine-deep text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs ring-1 ring-border-subtle">
                        {initials}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-text-primary group-hover:text-pine-deep transition-colors leading-tight">
                          {teacher.name}
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          {t('label_nip')}: {teacher.nip}
                        </span>
                        <span className="text-[10px] text-amber-800 font-medium">
                          {teacher.subject}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Contacts */}
                  <td className="py-4 px-4">
                    <div className="flex flex-col gap-1 text-xs">
                      <a
                        href={`mailto:${teacher.email}`}
                        className="text-text-muted hover:text-pine-deep flex items-center gap-1.5 transition-colors"
                      >
                        <Mail className="size-3 text-text-muted shrink-0" />
                        <span className="truncate max-w-[150px]">{teacher.email}</span>
                      </a>
                      <a
                        href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-700 hover:text-emerald-800 font-medium flex items-center gap-1.5 transition-colors"
                      >
                        <Phone className="size-3 text-emerald-600 shrink-0" />
                        <span>{teacher.phone}</span>
                      </a>
                    </div>
                  </td>

                  {/* Roles */}
                  <td className="py-4 px-4">
                    <div className="flex flex-wrap gap-1 max-w-[170px]">
                      {teacher.roles.map((role) => {
                        const isHomeroom = role.includes('Wali');
                        const isPiket = role.includes('Piket');
                        const isAdmin = role.includes('Admin');

                        return (
                          <span
                            key={role}
                            className={`px-2 py-0.5 rounded-md text-[10px] font-bold tracking-tight whitespace-nowrap ${
                              isAdmin
                                ? 'bg-amber-100 text-amber-900 border border-amber-300'
                                : isHomeroom
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : isPiket
                                    ? 'bg-sky-50 text-sky-800 border border-sky-200'
                                    : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {role}
                          </span>
                        );
                      })}
                    </div>
                  </td>

                  {/* Homeroom Assignment */}
                  <td className="py-4 px-4">
                    {teacher.homeroomClass ? (
                      <div className="flex flex-col">
                        <span className="font-bold text-pine-deep flex items-center gap-1 text-xs sm:text-sm">
                          <GraduationCap className="size-3.5 text-pine-deep shrink-0" />
                          {teacher.homeroomClass.className}
                        </span>
                        <span className="text-[11px] text-text-muted mt-0.5">
                          ({teacher.homeroomClass.studentCount} {t('unit_students')})
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted italic">
                        {t('label_unassigned_homeroom')}
                      </span>
                    )}
                  </td>

                  {/* Picket Duty */}
                  <td className="py-4 px-4">
                    {teacher.picketDuty ? (
                      <div className="flex flex-col text-xs">
                        <span className="font-semibold text-text-primary flex items-center gap-1">
                          <CalendarDays className="size-3 text-amber-600 shrink-0" />
                          {teacher.picketDuty.day}
                        </span>
                        <span className="text-[11px] text-text-muted flex items-center gap-1 mt-0.5">
                          <MapPin className="size-3 text-text-muted shrink-0" />
                          <span className="truncate max-w-[130px]">
                            {teacher.picketDuty.postLocation}
                          </span>
                        </span>
                      </div>
                    ) : (
                      <span className="text-xs text-text-muted italic">
                        {t('label_no_piket_schedule')}
                      </span>
                    )}
                  </td>

                  {/* Status */}
                  <td className="py-4 px-4">
                    {teacher.status === 'active' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100/70 text-emerald-800">
                        <span className="size-1.5 rounded-full bg-emerald-600" />
                        {t('status_badge_active')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800">
                        <span className="size-1.5 rounded-full bg-amber-600" />
                        {t('status_badge_leave')}
                      </span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-4 sm:px-6 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          props.onAssignHomeroom(teacher);
                        }}
                        className="p-1.5 rounded-lg text-pine-deep hover:bg-pine-light transition-colors cursor-pointer"
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
                        className="p-1.5 rounded-lg text-text-muted hover:text-pine-deep hover:bg-slate-100 transition-colors cursor-pointer"
                        title={t('btn_edit_teacher')}
                        aria-label={t('btn_edit_teacher')}
                      >
                        <Edit2 className="size-4" />
                      </button>
                      <a
                        href={`https://wa.me/${teacher.phone.replace(/[^0-9]/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded-lg text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 transition-colors"
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
