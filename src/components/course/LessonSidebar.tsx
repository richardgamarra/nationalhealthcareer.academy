'use client';
import type { Lesson } from '@/types';

interface Props {
  lessons: Lesson[];
  activeLessonId: number;
  price: number;
  enrolled: boolean;
  freeIds: Set<number>;
  courseSlug: string;
}

const TYPE_ICON: Record<string, string> = { text: '📄', document: '📎', presentation: '📊', quiz: '📋' };

export default function LessonSidebar({ lessons, activeLessonId, price, enrolled, freeIds, courseSlug }: Props) {
  const sections = Array.from(new Set(lessons.map((l) => l.section_title ?? ''))).filter(Boolean);
  const noSection = lessons.filter((l) => !l.section_title);

  function renderLesson(l: Lesson) {
    const accessible = enrolled || freeIds.has(l.id);
    const isActive = l.id === activeLessonId;

    if (!accessible) {
      return (
        <span key={l.id} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs mb-0.5 text-gray-300 cursor-not-allowed">
          <span>{TYPE_ICON[l.type] || '📄'}</span>
          <span className="flex-1 truncate">{l.title}</span>
          <span>🔒</span>
        </span>
      );
    }

    return (
      <a key={l.id} href={`/courses/${courseSlug}?lesson=${l.id}`}
        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-left text-xs mb-0.5 transition-colors block ${
          isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'
        }`}>
        <span>{TYPE_ICON[l.type] || '📄'}</span>
        <span className="flex-1 truncate">{l.title}</span>
        {freeIds.has(l.id) && <span className={`text-xs font-bold ${isActive ? 'text-blue-200' : 'text-green-500'}`}>FREE</span>}
      </a>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-3 flex flex-col">
      <div className="flex-1">
        {sections.map((sec) => (
          <div key={sec} className="mb-4">
            <p className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-2">{sec}</p>
            {lessons.filter((l) => l.section_title === sec).map(renderLesson)}
          </div>
        ))}
        {noSection.map(renderLesson)}
      </div>
      {!enrolled && (
        <div className="mt-4 border border-gray-200 rounded-xl p-4 text-center">
          <p className="text-lg font-bold text-gray-900 mb-1">${price.toFixed(2)}</p>
          <p className="text-xs text-gray-400 mb-3">Unlock all lessons</p>
          <a href="enroll" className="block w-full bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors">
            Enroll Now
          </a>
        </div>
      )}
    </div>
  );
}
