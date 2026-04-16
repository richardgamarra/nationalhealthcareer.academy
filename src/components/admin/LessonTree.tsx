'use client';
import { useState, useEffect } from 'react';
import {
  DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent,
} from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy, arrayMove } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Lesson } from '@/types';

interface Props {
  lessons: Lesson[];
  activeLessonId: number | null;
  onSelect: (lesson: Lesson) => void;
  onReorder: (orderedIds: number[]) => void;
  onAddLesson: (sectionTitle: string | null) => void;
  onAddSection: () => void;
}

const TYPE_ICON: Record<string, string> = {
  text: '📄', document: '📎', presentation: '📊', quiz: '📋',
};

function SortableLesson({ lesson, isActive, onSelect }: { lesson: Lesson; isActive: boolean; onSelect: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  return (
    <div ref={setNodeRef} style={style}
      className={`flex items-center gap-2 px-2 py-1.5 rounded-md cursor-pointer mb-0.5 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
      onClick={onSelect}>
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 text-xs select-none">⠿</span>
      <span className="text-sm">{TYPE_ICON[lesson.type] || '📄'}</span>
      <span className="text-xs flex-1 truncate">{lesson.title}</span>
    </div>
  );
}

export default function LessonTree({ lessons, activeLessonId, onSelect, onReorder, onAddLesson, onAddSection }: Props) {
  const [items, setItems] = useState(lessons);

  useEffect(() => {
    setItems(lessons);
  }, [lessons]); // eslint-disable-line react-hooks/exhaustive-deps

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  // Group lessons by section_title
  const sections = Array.from(new Set(items.map((l) => l.section_title ?? ''))).filter(Boolean);
  const unsectioned = items.filter((l) => !l.section_title);

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIdx = items.findIndex((l) => l.id === active.id);
      const newIdx = items.findIndex((l) => l.id === over.id);
      const next = arrayMove(items, oldIdx, newIdx);
      setItems(next);
      onReorder(next.map((l) => l.id));
    }
  }

  return (
    <div className="h-full overflow-y-auto p-3">
      <div className="flex justify-between items-center mb-3">
        <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Lessons</span>
        <button type="button" onClick={onAddSection}
          className="text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700">+ Section</button>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items.map((l) => l.id)} strategy={verticalListSortingStrategy}>

          {sections.map((sec) => (
            <div key={sec} className="mb-3">
              <div className="flex justify-between items-center mb-1">
                <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide truncate">{sec}</span>
              </div>
              {items.filter((l) => l.section_title === sec).map((l) => (
                <SortableLesson key={l.id} lesson={l} isActive={l.id === activeLessonId} onSelect={() => onSelect(l)} />
              ))}
              <button type="button" onClick={() => onAddLesson(sec)}
                className="w-full mt-1 border border-dashed border-gray-200 rounded py-1 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500">
                + Add Lesson
              </button>
            </div>
          ))}

          {unsectioned.length > 0 && (
            <div className="mb-3">
              {unsectioned.map((l) => (
                <SortableLesson key={l.id} lesson={l} isActive={l.id === activeLessonId} onSelect={() => onSelect(l)} />
              ))}
            </div>
          )}

        </SortableContext>
      </DndContext>

      <button type="button" onClick={() => onAddLesson(null)}
        className="w-full border border-dashed border-gray-200 rounded py-1.5 text-xs text-gray-400 hover:border-blue-300 hover:text-blue-500 mt-2">
        + Add Lesson
      </button>
    </div>
  );
}
