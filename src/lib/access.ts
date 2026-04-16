import type { Course, Lesson, Enrollment } from '@/types';

/**
 * The free lesson is the lowest sort_order lesson in the lowest sort_order course.
 * Computed at request time — no DB flag needed.
 */
export function isFreeLesson(
  lesson: Pick<Lesson, 'course_id' | 'sort_order'>,
  courses: Pick<Course, 'id' | 'sort_order'>[],
  allLessons: Pick<Lesson, 'course_id' | 'sort_order'>[]
): boolean {
  if (courses.length === 0) return false;
  const minCourseSortOrder = Math.min(...courses.map((c) => c.sort_order));
  const firstCourse = courses.find((c) => c.sort_order === minCourseSortOrder);
  if (!firstCourse || lesson.course_id !== firstCourse.id) return false;
  const lessonsInFirstCourse = allLessons.filter((l) => l.course_id === firstCourse.id);
  if (lessonsInFirstCourse.length === 0) return false;
  const minLessonSortOrder = Math.min(...lessonsInFirstCourse.map((l) => l.sort_order));
  return lesson.sort_order === minLessonSortOrder;
}

/**
 * Returns true if the user can view this lesson.
 * Admin and instructor always can. Free lesson always can. Otherwise must be enrolled.
 */
export function canAccessLesson(
  lesson: Pick<Lesson, 'course_id' | 'sort_order'>,
  courses: Pick<Course, 'id' | 'sort_order'>[],
  allLessons: Pick<Lesson, 'course_id' | 'sort_order'>[],
  enrollments: Pick<Enrollment, 'course_id'>[],
  role: 'student' | 'instructor' | 'admin'
): boolean {
  if (role === 'admin' || role === 'instructor') return true;
  if (isFreeLesson(lesson, courses, allLessons)) return true;
  return enrollments.some((e) => e.course_id === lesson.course_id);
}
