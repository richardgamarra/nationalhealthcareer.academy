'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import type { Course, Lesson, QuizQuestion } from '@/types';
import LessonTree from '@/components/admin/LessonTree';
import LessonEditor from '@/components/admin/LessonEditor';

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);

  const loadCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`);
      const data = await res.json();
      setCourse(data.course);
      setLessons(data.lessons ?? []);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => { loadCourse(); }, [loadCourse]);

  async function selectLesson(lesson: Lesson) {
    const res = await fetch(`/api/admin/lessons/${lesson.id}`);
    const data = await res.json();
    setActiveLesson(data.lesson);
    setActiveQuestions(data.questions ?? []);
  }

  async function handleAddSection() {
    const title = prompt('Section title:');
    if (!title) return;
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: Number(id), section_title: title, title: 'New Lesson', type: 'text', sort_order: lessons.length + 1 }),
    });
    if (res.ok) loadCourse();
  }

  async function handleAddLesson(sectionTitle: string | null) {
    const title = prompt('Lesson title:');
    if (!title) return;
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: Number(id), section_title: sectionTitle, title, type: 'text', sort_order: lessons.length + 1 }),
    });
    if (res.ok) loadCourse();
  }

  async function handleReorder(orderedIds: number[]) {
    await fetch('/api/admin/lessons/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
  }

  if (loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading…</div>;

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/admin/courses')} className="text-blue-600 text-sm hover:underline">← Courses</button>
          <h1 className="text-base font-semibold text-gray-900">{course?.title}</h1>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course?.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {course?.is_published ? 'Published' : 'Draft'}
          </span>
          <span className="text-sm font-semibold text-gray-700">${course?.price?.toFixed(2)}</span>
        </div>
      </div>

      {/* Split layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Lesson tree */}
        <div className="w-64 border-r border-gray-200 bg-gray-50 flex-shrink-0">
          <LessonTree
            lessons={lessons}
            activeLessonId={activeLesson?.id ?? null}
            onSelect={selectLesson}
            onReorder={handleReorder}
            onAddLesson={handleAddLesson}
            onAddSection={handleAddSection}
          />
        </div>

        {/* Right: Lesson editor */}
        <div className="flex-1 overflow-y-auto">
          {activeLesson ? (
            <LessonEditor
              lesson={activeLesson}
              initialQuestions={activeQuestions}
              onSaved={loadCourse}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-300 text-sm">
              Select a lesson from the left panel to edit
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
