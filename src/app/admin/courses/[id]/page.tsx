'use client';
import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import type { Course, Lesson, QuizQuestion } from '@/types';
import LessonTree from '@/components/admin/LessonTree';
import LessonEditor from '@/components/admin/LessonEditor';

type CopyMoveState = { lessonId: number; mode: 'copy' | 'move' } | null;

export default function CourseEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [activeQuestions, setActiveQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Course title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [courseTitle, setCourseTitle] = useState('');
  const [savingTitle, setSavingTitle] = useState(false);

  // Copy/Move modal
  const [copyMoveModal, setCopyMoveModal] = useState<CopyMoveState>(null);
  const [allCourses, setAllCourses] = useState<{ id: number; title: string }[]>([]);
  const [copyMoveTargetId, setCopyMoveTargetId] = useState<number | ''>('');
  const [copyMoveWorking, setCopyMoveWorking] = useState(false);

  const loadCourse = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/courses/${id}`);
      if (!res.ok) throw new Error(`Failed to load course (${res.status})`);
      const data = await res.json();
      setCourse(data.course);
      setCourseTitle(data.course.title);
      setLessons(data.lessons ?? []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load course');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/login');
      return;
    }
    loadCourse();
  }, [session, status, loadCourse, router]);

  // Load all courses for copy/move dropdown
  useEffect(() => {
    fetch('/api/admin/courses')
      .then((r) => r.json())
      .then((data) => setAllCourses(data.courses ?? []))
      .catch(() => {});
  }, []);

  async function selectLesson(lesson: Lesson) {
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`);
      if (!res.ok) throw new Error(`Failed to load lesson (${res.status})`);
      const data = await res.json();
      setActiveLesson(data.lesson);
      setActiveQuestions(data.questions ?? []);
    } catch (err) {
      console.error('selectLesson error:', err);
      alert(err instanceof Error ? err.message : 'Failed to load lesson');
    }
  }

  async function handleAddSection() {
    const title = prompt('Section title:');
    if (!title) return;
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: Number(id), section_title: title, title: 'New Lesson', type: 'text', sort_order: lessons.length + 1 }),
    });
    if (res.ok) {
      loadCourse();
    } else {
      console.error('handleAddSection failed:', res.status);
      alert('Failed to add section — please try again');
    }
  }

  async function handleAddLesson(sectionTitle: string | null) {
    const title = prompt('Lesson title:');
    if (!title) return;
    const res = await fetch('/api/admin/lessons', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: Number(id), section_title: sectionTitle, title, type: 'text', sort_order: lessons.length + 1 }),
    });
    if (res.ok) {
      loadCourse();
    } else {
      console.error('handleAddLesson failed:', res.status);
      alert('Failed to add lesson — please try again');
    }
  }

  async function handleReorder(orderedIds: number[]) {
    const res = await fetch('/api/admin/lessons/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderedIds }),
    });
    if (!res.ok) {
      console.error('handleReorder failed:', res.status);
      alert('Failed to reorder lessons. Please try again.');
    }
  }

  async function handleSaveCourseTitle() {
    if (!course || !courseTitle.trim()) return;
    setSavingTitle(true);
    try {
      await fetch(`/api/admin/courses/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...course, title: courseTitle.trim() }),
      });
      setCourse((c) => c ? { ...c, title: courseTitle.trim() } : c);
      setEditingTitle(false);
    } finally {
      setSavingTitle(false);
    }
  }

  async function handleRenameLesson(lessonId: number, newTitle: string) {
    const lesson = lessons.find((l) => l.id === lessonId);
    if (!lesson) return;
    await fetch(`/api/admin/lessons/${lessonId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...lesson, title: newTitle }),
    });
    loadCourse();
  }

  async function handleRenameSection(oldTitle: string, newTitle: string) {
    const sectionLessons = lessons.filter((l) => l.section_title === oldTitle);
    await Promise.all(sectionLessons.map((l) =>
      fetch(`/api/admin/lessons/${l.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...l, section_title: newTitle }),
      })
    ));
    loadCourse();
  }

  async function handleDeleteLesson(lessonId: number) {
    await fetch(`/api/admin/lessons/${lessonId}`, { method: 'DELETE' });
    if (activeLesson?.id === lessonId) setActiveLesson(null);
    loadCourse();
  }

  function handleCopyLesson(lessonId: number) {
    setCopyMoveModal({ lessonId, mode: 'copy' });
    setCopyMoveTargetId('');
  }

  function handleMoveLesson(lessonId: number) {
    setCopyMoveModal({ lessonId, mode: 'move' });
    setCopyMoveTargetId('');
  }

  async function handleConfirmCopyMove() {
    if (!copyMoveModal || !copyMoveTargetId) return;
    const { lessonId, mode } = copyMoveModal;
    setCopyMoveWorking(true);
    try {
      const endpoint = mode === 'copy'
        ? `/api/admin/lessons/${lessonId}/copy`
        : `/api/admin/lessons/${lessonId}/move`;
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_course_id: Number(copyMoveTargetId) }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data.error || `Failed to ${mode} lesson`);
        return;
      }
      setCopyMoveModal(null);
      setCopyMoveTargetId('');
      if (mode === 'move') {
        if (activeLesson?.id === lessonId) setActiveLesson(null);
        loadCourse();
      }
    } finally {
      setCopyMoveWorking(false);
    }
  }

  if (status === 'loading' || loading) return <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading…</div>;

  if (error) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm max-w-md text-center">
        <p className="font-medium mb-2">Error loading course</p>
        <p>{error}</p>
        <button type="button" onClick={() => { setError(''); setLoading(true); loadCourse(); }}
          className="mt-3 text-red-600 underline text-xs">Try again</button>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen">
      {/* Top bar */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => router.push('/admin/courses')} className="text-blue-600 text-sm hover:underline">← Courses</button>
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveCourseTitle();
                  if (e.key === 'Escape') { setCourseTitle(course?.title ?? ''); setEditingTitle(false); }
                }}
                autoFocus
                className="border border-blue-400 rounded-lg px-2 py-1 text-sm font-semibold text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                type="button"
                onClick={handleSaveCourseTitle}
                disabled={savingTitle}
                className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >{savingTitle ? 'Saving…' : 'Save'}</button>
              <button
                type="button"
                onClick={() => { setCourseTitle(course?.title ?? ''); setEditingTitle(false); }}
                className="text-xs text-gray-500 hover:text-gray-700"
              >Cancel</button>
            </div>
          ) : (
            <h1
              className="text-base font-semibold text-gray-900 cursor-pointer hover:text-blue-600 group"
              title="Click to edit course title"
              onClick={() => setEditingTitle(true)}
            >
              {course?.title}
              <span className="ml-1 opacity-0 group-hover:opacity-100 text-xs text-blue-400">✏️</span>
            </h1>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${course?.is_published ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
            {course?.is_published ? 'Published' : 'Draft'}
          </span>
          <span className="text-sm font-semibold text-gray-700">${Number(course?.price ?? 0).toFixed(2)}</span>
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
            onRenameLesson={handleRenameLesson}
            onRenameSection={handleRenameSection}
            onDeleteLesson={handleDeleteLesson}
            onCopyLesson={handleCopyLesson}
            onMoveLesson={handleMoveLesson}
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

      {/* Copy/Move Modal */}
      {copyMoveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
            <h2 className="text-sm font-semibold text-gray-900 mb-4">
              {copyMoveModal.mode === 'copy' ? 'Copy' : 'Move'} lesson to another course
            </h2>
            <label className="block text-xs text-gray-600 mb-2">Select target course</label>
            <select
              value={copyMoveTargetId}
              onChange={(e) => setCopyMoveTargetId(e.target.value === '' ? '' : Number(e.target.value))}
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
            >
              <option value="">— Choose a course —</option>
              {allCourses
                .filter((c) => c.id !== Number(id))
                .map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => { setCopyMoveModal(null); setCopyMoveTargetId(''); }}
                className="text-sm text-gray-500 hover:text-gray-700 px-3 py-1.5"
              >Cancel</button>
              <button
                type="button"
                onClick={handleConfirmCopyMove}
                disabled={!copyMoveTargetId || copyMoveWorking}
                className="text-sm bg-blue-600 text-white px-4 py-1.5 rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >{copyMoveWorking ? 'Working…' : (copyMoveModal.mode === 'copy' ? 'Copy' : 'Move')}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
