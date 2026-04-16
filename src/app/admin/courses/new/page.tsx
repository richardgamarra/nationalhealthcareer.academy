'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function NewCoursePage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [form, setForm] = useState({ title: '', slug: '', description: '', category: 'healthcare', level: 'beginner', price: '0', sort_order: '0', is_published: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (status === 'loading') return;
    if (!session || (session.user as any)?.role !== 'admin') {
      router.push('/login');
    }
  }, [session, status, router]);

  function handleTitle(title: string) {
    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    setForm((f) => ({ ...f, title, slug }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true); setError('');
    try {
      const res = await fetch('/api/admin/courses', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, price: parseFloat(form.price) || 0, sort_order: parseInt(form.sort_order) || 0 }),
      });
      if (res.ok) {
        const { id } = await res.json();
        router.push(`/admin/courses/${id}`);
      } else {
        const d = await res.json();
        setError(d.error || 'Failed to create course');
      }
    } catch {
      setError('Network error — please try again');
    } finally {
      setSaving(false);
    }
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';
  const labelCls = 'block text-sm font-medium text-gray-700 mb-1';

  if (status === 'loading' || !session || (session.user as any)?.role !== 'admin') {
    return <div className="flex items-center justify-center min-h-[60vh] text-gray-400">Loading…</div>;
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <div className="mb-6 flex items-center gap-4">
        <button type="button" onClick={() => router.push('/admin/courses')} className="text-blue-600 text-sm hover:underline">← Back</button>
        <h1 className="text-2xl font-bold">New Course</h1>
      </div>
      {error && <div className="mb-4 bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm">{error}</div>}
      <form onSubmit={handleSubmit} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm space-y-4">
        <div><label className={labelCls}>Title</label><input required className={inputCls} value={form.title} onChange={(e) => handleTitle(e.target.value)} /></div>
        <div><label className={labelCls}>Slug (auto-generated)</label><input className={`${inputCls} bg-gray-50 text-gray-400`} value={form.slug} readOnly /></div>
        <div><label className={labelCls}>Description</label><textarea className={inputCls} rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} /></div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Category</label>
            <select className={inputCls} value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              <option value="healthcare">HealthCare</option>
              <option value="medical-assistant">Medical Assistant</option>
            </select>
          </div>
          <div><label className={labelCls}>Level</label>
            <select className={inputCls} value={form.level} onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div><label className={labelCls}>Price ($)</label><input type="number" step="0.01" min="0" className={inputCls} value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} /></div>
          <div><label className={labelCls}>Sort Order</label><input type="number" min="0" className={inputCls} value={form.sort_order} onChange={(e) => setForm((f) => ({ ...f, sort_order: e.target.value }))} /></div>
        </div>
        <div className="flex items-center gap-2">
          <input type="checkbox" id="published" checked={form.is_published} onChange={(e) => setForm((f) => ({ ...f, is_published: e.target.checked }))} className="w-4 h-4" />
          <label htmlFor="published" className="text-sm text-gray-700">Publish immediately</label>
        </div>
        <button type="submit" disabled={saving} className="w-full bg-blue-600 text-white py-2 rounded-lg font-semibold text-sm hover:bg-blue-700 disabled:opacity-50">
          {saving ? 'Creating…' : 'Create Course & Add Lessons'}
        </button>
      </form>
    </div>
  );
}
