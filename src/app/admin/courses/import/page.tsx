'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface CoursePreview {
  moodleId: number; title: string; slug: string;
  lessonCount: number; questionCount: number; alreadyImported: boolean;
}

export default function ImportPage() {
  const router = useRouter();
  const [step, setStep] = useState<'idle' | 'scanning' | 'preview' | 'importing' | 'done'>('idle');
  const [courses, setCourses] = useState<CoursePreview[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [results, setResults] = useState<{ title: string; status: string }[]>([]);
  const [error, setError] = useState('');

  async function handleScan() {
    setStep('scanning'); setError('');
    try {
      const res = await fetch('/api/admin/import/scan');
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Scan failed'); setStep('idle'); return; }
      setCourses(data.courses);
      setSelected(new Set(data.courses.filter((c: CoursePreview) => !c.alreadyImported).map((c: CoursePreview) => c.moodleId)));
      setStep('preview');
    } catch {
      setError('Network error — could not reach the server.');
      setStep('idle');
    }
  }

  async function handleImport() {
    setStep('importing'); setError('');
    try {
      const res = await fetch('/api/admin/import/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedMoodleIds: Array.from(selected) }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? 'Import failed'); setStep('preview'); return; }
      setResults(data.results);
      setStep('done');
    } catch {
      setError('Network error — import could not be completed.');
      setStep('preview');
    }
  }

  function toggleCourse(id: number) {
    setSelected((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <button onClick={() => router.push('/admin/courses')} className="text-blue-600 text-sm hover:underline">← Back to Courses</button>
        <h1 className="text-2xl font-bold">Import from Moodle</h1>
      </div>

      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}

      {step === 'idle' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 mb-6 text-sm">This will scan your Moodle database and show you a preview of all courses, lessons, and quiz questions before importing.</p>
          <button onClick={handleScan} className="bg-green-700 text-white px-6 py-2 rounded-lg font-semibold hover:bg-green-800 transition-colors">
            Scan Moodle Database
          </button>
        </div>
      )}

      {step === 'scanning' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 text-sm animate-pulse">Scanning Moodle database…</p>
        </div>
      )}

      {step === 'preview' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100 flex justify-between items-center">
            <p className="text-sm text-gray-500">Found {courses.length} courses. Select which to import.</p>
            <button onClick={handleImport} disabled={selected.size === 0}
              className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 disabled:opacity-50">
              Import {selected.size} Course{selected.size !== 1 ? 's' : ''}
            </button>
          </div>
          {courses.map((c) => (
            <label
              key={c.moodleId}
              className={`flex items-center gap-4 px-4 py-3 border-b border-gray-50 last:border-0 ${c.alreadyImported ? 'opacity-60' : 'cursor-pointer hover:bg-gray-50'}`}
            >
              <input
                type="checkbox"
                checked={selected.has(c.moodleId)}
                onChange={() => toggleCourse(c.moodleId)}
                disabled={c.alreadyImported}
                aria-label={c.alreadyImported ? `${c.title} (already imported)` : c.title}
                className="w-4 h-4"
              />
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">{c.title}</p>
                <p className="text-xs text-gray-400">{c.lessonCount} lessons · {c.questionCount} quiz questions</p>
              </div>
              {c.alreadyImported && <span className="text-xs bg-gray-100 text-gray-500 rounded px-2 py-0.5">Already imported</span>}
            </label>
          ))}
        </div>
      )}

      {step === 'importing' && (
        <div className="bg-white border border-gray-200 rounded-xl p-8 text-center shadow-sm">
          <p className="text-gray-500 text-sm animate-pulse">Importing courses… this may take a moment.</p>
        </div>
      )}

      {step === 'done' && (
        <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
          <div className="p-4 border-b border-gray-100">
            <p className="text-sm font-semibold text-gray-700">Import complete</p>
          </div>
          {results.map((r) => (
            <div key={r.title} className="flex items-center justify-between px-4 py-3 border-b border-gray-50 last:border-0">
              <span className="text-sm text-gray-800">{r.title}</span>
              <span className={`text-xs px-2 py-0.5 rounded font-medium ${
                r.status === 'imported' ? 'bg-green-100 text-green-700' :
                r.status === 'skipped' ? 'bg-gray-100 text-gray-500' : 'bg-red-100 text-red-700'}`}>
                {r.status}
              </span>
            </div>
          ))}
          <div className="p-4">
            <button onClick={() => router.push('/admin/courses')} className="bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
              View Courses
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
