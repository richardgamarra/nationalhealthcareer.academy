'use client';
import { useState, useEffect, useRef } from 'react';
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
  onRenameLesson: (lessonId: number, newTitle: string) => Promise<void>;
  onRenameSection: (oldTitle: string, newTitle: string) => Promise<void>;
  onDeleteLesson: (lessonId: number) => Promise<void>;
  onCopyLesson: (lessonId: number) => void;
  onMoveLesson: (lessonId: number) => void;
}

const TYPE_ICON: Record<string, string> = {
  text: '📄', document: '📎', presentation: '📊', quiz: '📋', link: '🔗',
};

interface SortableLessonProps {
  lesson: Lesson;
  isActive: boolean;
  onSelect: () => void;
  onRenameLesson: (lessonId: number, newTitle: string) => Promise<void>;
  onDeleteLesson: (lessonId: number) => Promise<void>;
  onCopyLesson: (lessonId: number) => void;
  onMoveLesson: (lessonId: number) => void;
  openMenuId: number | null;
  setOpenMenuId: (id: number | null) => void;
}

function SortableLesson({
  lesson, isActive, onSelect, onRenameLesson, onDeleteLesson, onCopyLesson, onMoveLesson,
  openMenuId, setOpenMenuId,
}: SortableLessonProps) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({ id: lesson.id });
  const style = { transform: CSS.Transform.toString(transform), transition };

  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(lesson.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const isMenuOpen = openMenuId === lesson.id;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  async function commitRename() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== lesson.title) {
      await onRenameLesson(lesson.id, trimmed);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setEditValue(lesson.title); setEditing(false); }
  }

  async function handleDelete(e: React.MouseEvent) {
    e.stopPropagation();
    if (window.confirm(`Delete lesson "${lesson.title}"?`)) {
      await onDeleteLesson(lesson.id);
    }
  }

  function handlePencil(e: React.MouseEvent) {
    e.stopPropagation();
    setEditValue(lesson.title);
    setEditing(true);
  }

  function handleMenuToggle(e: React.MouseEvent) {
    e.stopPropagation();
    setOpenMenuId(isMenuOpen ? null : lesson.id);
  }

  function handleCopy(e: React.MouseEvent) {
    e.stopPropagation();
    setOpenMenuId(null);
    onCopyLesson(lesson.id);
  }

  function handleMove(e: React.MouseEvent) {
    e.stopPropagation();
    setOpenMenuId(null);
    onMoveLesson(lesson.id);
  }

  const showActions = hovered || isActive || editing || isMenuOpen;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center gap-1 px-2 py-1.5 rounded-md cursor-pointer mb-0.5 ${isActive ? 'bg-blue-600 text-white' : 'hover:bg-gray-100 text-gray-700'}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => { if (!editing) onSelect(); }}
    >
      <span {...attributes} {...listeners} className="cursor-grab text-gray-300 hover:text-gray-500 text-xs select-none flex-shrink-0">⠿</span>
      <span className="text-sm flex-shrink-0">{TYPE_ICON[lesson.type] || '📄'}</span>

      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
          className="flex-1 text-xs border border-blue-400 rounded px-1 py-0.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 min-w-0"
        />
      ) : (
        <span className="text-xs flex-1 truncate min-w-0">{lesson.title}</span>
      )}

      {showActions && !editing && (
        <div className="flex items-center gap-0.5 flex-shrink-0 ml-auto" onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            title="Rename lesson"
            onClick={handlePencil}
            className={`p-0.5 rounded text-xs hover:bg-black/10 ${isActive ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
          >✏️</button>
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              title="More options"
              onClick={handleMenuToggle}
              className={`p-0.5 rounded text-xs hover:bg-black/10 ${isActive ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-gray-700'}`}
            >⋯</button>
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 bg-white border border-gray-200 rounded-lg shadow-lg py-1 min-w-[140px]">
                <button
                  type="button"
                  onClick={handleCopy}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >Copy to course…</button>
                <button
                  type="button"
                  onClick={handleMove}
                  className="w-full text-left px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-50"
                >Move to course…</button>
              </div>
            )}
          </div>
          <button
            type="button"
            title="Delete lesson"
            onClick={handleDelete}
            className={`p-0.5 rounded text-xs hover:bg-black/10 ${isActive ? 'text-white/80 hover:text-white' : 'text-gray-400 hover:text-red-500'}`}
          >🗑️</button>
        </div>
      )}
    </div>
  );
}

interface SectionHeaderProps {
  title: string;
  onRenameSection: (oldTitle: string, newTitle: string) => Promise<void>;
}

function SectionHeader({ title, onRenameSection }: SectionHeaderProps) {
  const [editing, setEditing] = useState(false);
  const [editValue, setEditValue] = useState(title);
  const [hovered, setHovered] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  async function commitRename() {
    const trimmed = editValue.trim();
    if (trimmed && trimmed !== title) {
      await onRenameSection(title, trimmed);
    }
    setEditing(false);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') commitRename();
    if (e.key === 'Escape') { setEditValue(title); setEditing(false); }
  }

  return (
    <div
      className="flex items-center gap-1 mb-1"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {editing ? (
        <input
          ref={inputRef}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={commitRename}
          onKeyDown={handleKeyDown}
          className="flex-1 text-xs border border-blue-400 rounded px-1 py-0.5 text-gray-900 focus:outline-none focus:ring-1 focus:ring-blue-500 font-semibold uppercase tracking-wide"
        />
      ) : (
        <span className="text-xs font-semibold text-blue-500 uppercase tracking-wide truncate flex-1">{title}</span>
      )}
      {hovered && !editing && (
        <button
          type="button"
          title="Rename section"
          onClick={() => { setEditValue(title); setEditing(true); }}
          className="p-0.5 rounded text-xs text-gray-400 hover:text-gray-700 hover:bg-gray-100 flex-shrink-0"
        >✏️</button>
      )}
    </div>
  );
}

export default function LessonTree({
  lessons, activeLessonId, onSelect, onReorder, onAddLesson, onAddSection,
  onRenameLesson, onRenameSection, onDeleteLesson, onCopyLesson, onMoveLesson,
}: Props) {
  const [items, setItems] = useState(lessons);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);

  useEffect(() => {
    setItems(lessons);
  }, [lessons]); // eslint-disable-line react-hooks/exhaustive-deps

  // Close menu when clicking outside
  useEffect(() => {
    if (!openMenuId) return;
    function handleClickOutside() { setOpenMenuId(null); }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenuId]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

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

  const sharedLessonProps = {
    onRenameLesson,
    onDeleteLesson,
    onCopyLesson,
    onMoveLesson,
    openMenuId,
    setOpenMenuId,
  };

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
              <SectionHeader title={sec} onRenameSection={onRenameSection} />
              {items.filter((l) => l.section_title === sec).map((l) => (
                <SortableLesson
                  key={l.id}
                  lesson={l}
                  isActive={l.id === activeLessonId}
                  onSelect={() => onSelect(l)}
                  {...sharedLessonProps}
                />
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
                <SortableLesson
                  key={l.id}
                  lesson={l}
                  isActive={l.id === activeLessonId}
                  onSelect={() => onSelect(l)}
                  {...sharedLessonProps}
                />
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
