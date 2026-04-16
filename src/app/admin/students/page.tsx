'use client';
import { useState, useEffect } from 'react';
import type { Student, Course } from '@/types';

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [newForm, setNewForm] = useState({ name: '', email: '', password: '' });
  const [grantModal, setGrantModal] = useState<{ studentId: number; name: string } | null>(null);
  const [grantCourseId, setGrantCourseId] = useState('');
  const [pwModal, setPwModal] = useState<{ studentId: number; name: string } | null>(null);
  const [newPw, setNewPw] = useState('');
  const [msg, setMsg] = useState('');

  async function load() {
    const [sr, cr] = await Promise.all([fetch('/api/admin/students'), fetch('/api/admin/courses')]);
    setStudents(await sr.json());
    setCourses(await cr.json());
  }

  useEffect(() => { load(); }, []);

  async function createStudent(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch('/api/admin/students', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newForm),
    });
    if (res.ok) {
      setShowCreate(false);
      setNewForm({ name: '', email: '', password: '' });
      load();
      setMsg('Student created');
    } else {
      const d = await res.json();
      setMsg(d.error || 'Error creating student');
    }
  }

  async function toggleActive(student: Student) {
    await fetch(`/api/admin/students/${student.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ is_active: !student.is_active }),
    });
    load();
  }

  async function deleteStudent(id: number) {
    if (!confirm('Delete this student? This cannot be undone.')) return;
    await fetch(`/api/admin/students/${id}`, { method: 'DELETE' });
    load();
  }

  async function grantAccess() {
    if (!grantModal || !grantCourseId) return;
    await fetch(`/api/admin/students/${grantModal.studentId}/grant`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ course_id: Number(grantCourseId) }),
    });
    setGrantModal(null);
    setGrantCourseId('');
    setMsg('Access granted');
    load();
  }

  async function resetPassword() {
    if (!pwModal || !newPw) return;
    await fetch(`/api/admin/students/${pwModal.studentId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password: newPw }),
    });
    setPwModal(null);
    setNewPw('');
    setMsg('Password updated');
  }

  const inputCls = 'w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Students</h1>
        <button type="button" onClick={() => setShowCreate(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700">
          + Create Account
        </button>
      </div>

      {msg && (
        <div className="mb-4 bg-green-50 border border-green-200 text-green-700 rounded-lg p-3 text-sm">
          {msg}
          <button type="button" onClick={() => setMsg('')} className="ml-2 text-green-500">✕</button>
        </div>
      )}

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <form onSubmit={createStudent} className="bg-white rounded-xl p-6 shadow-xl w-full max-w-md space-y-4">
            <h2 className="font-bold text-lg">Create Student Account</h2>
            <input required placeholder="Full Name" className={inputCls} value={newForm.name}
              onChange={(e) => setNewForm((f) => ({ ...f, name: e.target.value }))} />
            <input required type="email" placeholder="Email" className={inputCls} value={newForm.email}
              onChange={(e) => setNewForm((f) => ({ ...f, email: e.target.value }))} />
            <input required type="password" placeholder="Temporary Password" className={inputCls} value={newForm.password}
              onChange={(e) => setNewForm((f) => ({ ...f, password: e.target.value }))} />
            <div className="flex gap-3">
              <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold">Create</button>
              <button type="button" onClick={() => setShowCreate(false)} className="flex-1 border border-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Grant modal */}
      {grantModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">Grant Course Access</h2>
            <p className="text-sm text-gray-500">Student: <strong>{grantModal.name}</strong></p>
            <select className={inputCls} value={grantCourseId} onChange={(e) => setGrantCourseId(e.target.value)}>
              <option value="">Select course…</option>
              {courses.map((c) => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
            <div className="flex gap-3">
              <button type="button" onClick={grantAccess} disabled={!grantCourseId}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">Grant Access</button>
              <button type="button" onClick={() => setGrantModal(null)} className="flex-1 border border-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Password modal */}
      {pwModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 shadow-xl w-full max-w-sm space-y-4">
            <h2 className="font-bold text-lg">Reset Password</h2>
            <p className="text-sm text-gray-500">Student: <strong>{pwModal.name}</strong></p>
            <input type="password" placeholder="New password" className={inputCls} value={newPw}
              onChange={(e) => setNewPw(e.target.value)} />
            <div className="flex gap-3">
              <button type="button" onClick={resetPassword} disabled={!newPw}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-semibold disabled:opacity-50">Update</button>
              <button type="button" onClick={() => setPwModal(null)} className="flex-1 border border-gray-200 rounded-lg text-sm">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              {['Name', 'Email', 'Status', 'Actions'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id} className="border-b border-gray-50 last:border-0">
                <td className="px-4 py-3 font-medium text-gray-900">{s.name}</td>
                <td className="px-4 py-3 text-gray-500">{s.email}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${s.is_active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.is_active ? 'Active' : 'Disabled'}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <button type="button" onClick={() => setGrantModal({ studentId: s.id, name: s.name })}
                      className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">+ Grant</button>
                    <button type="button" onClick={() => setPwModal({ studentId: s.id, name: s.name })}
                      className="text-xs bg-gray-50 text-gray-600 px-2 py-1 rounded hover:bg-gray-100">Reset PW</button>
                    <button type="button" onClick={() => toggleActive(s)}
                      className={`text-xs px-2 py-1 rounded ${s.is_active ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}>
                      {s.is_active ? 'Disable' : 'Enable'}
                    </button>
                    <button type="button" onClick={() => deleteStudent(s.id)}
                      className="text-xs text-red-400 hover:text-red-600 px-1">Delete</button>
                  </div>
                </td>
              </tr>
            ))}
            {students.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400 text-sm">No students yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
