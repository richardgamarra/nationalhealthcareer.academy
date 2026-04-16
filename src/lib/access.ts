import type { Course, Lesson, Enrollment } from '@/types';

/**
 * The free lesson is the lowest sort_order lesson in the lowest sort_order course.
 * Computed at request time — no DB flag needed.
 */
export function isFreeLesson(
  lesson: Pick<Lesson, 'course_id' | 'sort_order'>,
  courses: Pick<Course, 'id' | 'sort_order'>[]
): boolean {
  if (courses.length === 0) return false;
  const minSortOrder = Math.min(...courses.map((c) => c.sort_order));
  const firstCourse = courses.find((c) => c.sort_order === minSortOrder);
  if (!firstCourse || lesson.course_id !== firstCourse.id) return false;
  return lesson.sort_order === 1;
}

/**
 * Returns true if the user can view this lesson.
 * Admin always can. Free lesson always can. Otherwise must be enrolled.
 */
export function canAccessLesson(
  lesson: Pick<Lesson, 'course_id' | 'sort_order'>,
  courses: Pick<Course, 'id' | 'sort_order'>[],
  enrollments: Pick<Enrollment, 'course_id' | 'progress_pct'>[],
  role: 'student' | 'instructor' | 'admin'
): boolean {
  if (role === 'admin') return true;
  if (isFreeLesson(lesson, courses)) return true;
  return enrollments.some((e) => e.course_id === lesson.course_id);
}
