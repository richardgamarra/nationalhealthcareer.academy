'use client';
import { useState, useEffect } from 'react';
import type { Lesson, QuizQuestion } from '@/types';
import TiptapEditor from '@/components/editor/TiptapEditor';
import QuizBuilder from '@/components/admin/QuizBuilder';

interface Props {
  lesson: Lesson;
  initialQuestions: QuizQuestion[];
  onSaved: () => void;
}

type Tab = 'text' | 'document' | 'presentation' | 'quiz';

export default function LessonEditor({ lesson: initial, initialQuestions, onSaved }: Props) {
  const [lesson, setLesson] = useState(initial);
  const [questions, setQuestions] = useState(initialQuestions);
  const [activeTab, setActiveTab] = useState<Tab>(initial.type as Tab);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    setLesson(initial);
    setQuestions(initialQuestions);
    setActiveTab(initial.type as Tab);
  }, [initial.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function save() {
    setSaving(true); setMsg('');
    try {
      const res = await fetch(`/api/admin/lessons/${lesson.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...lesson, type: activeTab, questions: activeTab === 'quiz' ? questions : undefined }),
      });
      if (res.ok) { setMsg('Saved'); onSaved(); } else { setMsg('Save failed'); }
    } catch {
      setMsg('Save failed');
    } finally {
      setSaving(false);
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      const res = await fetch('/api/admin/upload', { method: 'POST', body: fd });
      if (res.ok) {
        const { url } = await res.json();
        setLesson((l) => ({ ...l, file_path: url }));
      } else {
        setMsg('Upload failed');
      }
    } finally {
      setUploading(false);
    }
  }

  const TABS: { key: Tab; label: string; icon: string }[] = [
    { key: 'text', label: 'Text', icon: '📄' },
    { key: 'document', label: 'PDF', icon: '📎' },
    { key: 'presentation', label: 'Presentation', icon: '📊' },
    { key: 'quiz', label: 'Quiz', icon: '📋' },
  ];

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4">
      {/* Lesson title */}
      <div className="flex justify-between items-center mb-4 gap-4">
        <input value={lesson.title} onChange={(e) => setLesson((l) => ({ ...l, title: e.target.value }))}
          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <div className="flex items-center gap-2">
          {msg && <span className={`text-xs ${msg === 'Saved' ? 'text-green-600' : 'text-red-500'}`}>{msg}</span>}
          <button type="button" onClick={save} disabled={saving}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {/* Section title */}
      <input value={lesson.section_title || ''} onChange={(e) => setLesson((l) => ({ ...l, section_title: e.target.value }))}
        placeholder="Section (optional)"
        className="border border-gray-200 rounded-lg px-3 py-1.5 text-xs text-gray-500 mb-4 focus:outline-none focus:ring-1 focus:ring-blue-400" />

      {/* Type tabs */}
      <div className="flex border-b border-gray-200 mb-4">
        {TABS.map((t) => (
          <button key={t.key} type="button" onClick={() => setActiveTab(t.key)}
            className={`px-4 py-2 text-sm font-medium flex items-center gap-1.5 border-b-2 transition-colors ${activeTab === t.key ? 'border-blue-600 text-blue-600' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'text' && (
        <TiptapEditor content={lesson.content || ''} onChange={(html) => setLesson((l) => ({ ...l, content: html }))} />
      )}

      {(activeTab === 'document' || activeTab === 'presentation') && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
            <p className="text-sm text-gray-500 mb-3">
              {activeTab === 'document' ? 'Upload PDF (max 50MB)' : 'Upload PPTX file (max 50MB)'}
            </p>
            <input type="file" accept={activeTab === 'document' ? '.pdf' : '.pptx'}
              onChange={handleFileUpload} className="hidden" id={`file-upload-${lesson.id}`} />
            <label htmlFor={`file-upload-${lesson.id}`}
              className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm cursor-pointer hover:bg-blue-700">
              {uploading ? 'Uploading…' : 'Choose File'}
            </label>
          </div>
          {lesson.file_path && (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <span className="text-sm text-green-700 font-medium">{lesson.file_path.split('/').pop()}</span>
              <a href={lesson.file_path} target="_blank" rel="noopener noreferrer"
                className="text-xs text-blue-600 hover:underline">Preview</a>
            </div>
          )}
        </div>
      )}

      {activeTab === 'quiz' && (
        <QuizBuilder questions={questions} onChange={setQuestions} />
      )}
    </div>
  );
}
