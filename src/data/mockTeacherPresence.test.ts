import { describe, expect, it } from 'vitest';
import {
  countTeachingSessions,
  filterTeachingSessions,
  mockJournalOptions,
  mockTeacherAttendance,
  mockTeacherHistory,
  mockTeachingSessions,
} from '@/data/mockTeacherPresence';

describe('teaching schedule filters', () => {
  it('counts sessions per status pill', () => {
    expect(countTeachingSessions(mockTeachingSessions)).toStrictEqual({
      all: 4,
      ongoing: 1,
      done: 1,
      upcoming: 2,
    });
  });

  it('returns only sessions matching the selected filter', () => {
    const ongoing = filterTeachingSessions(mockTeachingSessions, 'ongoing');
    expect(ongoing).toHaveLength(1);
    expect(ongoing.at(0)?.status).toBe('berlangsung');

    expect(filterTeachingSessions(mockTeachingSessions, 'all')).toHaveLength(4);
    expect(filterTeachingSessions(mockTeachingSessions, 'upcoming')).toHaveLength(2);
    expect(filterTeachingSessions(mockTeachingSessions, 'done')).toHaveLength(1);
  });
});

describe('teacher presence fixtures', () => {
  it('records a punctual check-in before the late limit', () => {
    expect(mockTeacherAttendance.status).toBe('tepat_waktu');
    expect(mockTeacherAttendance.checkInTime < mockTeacherAttendance.lateLimit).toBeTruthy();
    expect(mockTeacherAttendance.isCheckedIn).toBeTruthy();
  });

  it('uses unique journal and history identifiers', () => {
    const journalIds = new Set(mockJournalOptions.map((option) => option.id));
    const historyIds = new Set(mockTeacherHistory.map((row) => row.id));

    expect(journalIds.size).toBe(mockJournalOptions.length);
    expect(historyIds.size).toBe(mockTeacherHistory.length);
  });
});
