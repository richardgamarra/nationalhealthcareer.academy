import { describe, it, expect } from 'vitest';
import { isFreeLesson, canAccessLesson } from '@/lib/access';

const courses = [
  { id: 1, sort_order: 1 },
  { id: 2, sort_order: 2 },
];

const lessons = [
  { id: 10, course_id: 1, sort_order: 1, type: 'text' as const },
  { id: 11, course_id: 1, sort_order: 2, type: 'text' as const },
  { id: 20, course_id: 2, sort_order: 1, type: 'text' as const },
];

describe('isFreeLesson', () => {
  it('returns true for the first lesson of the first course', () => {
    expect(isFreeLesson(lessons[0], courses)).toBe(true);
  });
  it('returns false for the second lesson of the first course', () => {
    expect(isFreeLesson(lessons[1], courses)).toBe(false);
  });
  it('returns false for any lesson in course 2+', () => {
    expect(isFreeLesson(lessons[2], courses)).toBe(false);
  });
});

describe('canAccessLesson', () => {
  const enrollments = [{ course_id: 1, progress_pct: 50 }];

  it('allows admin always', () => {
    expect(canAccessLesson(lessons[1], courses, [], 'admin')).toBe(true);
  });
  it('allows free lesson without enrollment', () => {
    expect(canAccessLesson(lessons[0], courses, [], 'student')).toBe(true);
  });
  it('blocks non-free lesson when not enrolled', () => {
    expect(canAccessLesson(lessons[1], courses, [], 'student')).toBe(false);
  });
  it('allows non-free lesson when enrolled in that course', () => {
    expect(canAccessLesson(lessons[1], courses, enrollments, 'student')).toBe(true);
  });
});
