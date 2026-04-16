'use client';
import { useState } from 'react';
import type { QuizQuestion } from '@/types';

interface Props {
  questions: QuizQuestion[];
  onChange: (questions: QuizQuestion[]) => void;
}

const BLANK_Q: Omit<QuizQuestion, 'id' | 'lesson_id' | 'sort_order'> = {
  type: 'multiple_choice', question: '', options: ['', '', '', ''], correct_answer: '0',
};

export default function QuizBuilder({ questions, onChange }: Props) {
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ ...BLANK_Q });

  function updateQuestion(idx: number, patch: Partial<QuizQuestion>) {
    const next = questions.map((q, i) => i === idx ? { ...q, ...patch } : q);
    onChange(next);
  }

  function deleteQuestion(idx: number) {
    onChange(questions.filter((_, i) => i !== idx));
  }

  function saveNew() {
    if (!draft.question.trim()) return;
    onChange([...questions, { ...draft, id: 0, lesson_id: 0, sort_order: questions.length + 1 }]);
    setDraft({ ...BLANK_Q });
    setAdding(false);
  }

  return (
    <div className="space-y-3">
      {questions.length === 0 && !adding && (
        <p className="text-sm text-gray-400 text-center py-6">No questions yet.</p>
      )}

      {questions.map((q, idx) => (
        <div key={idx} className="border border-gray-200 rounded-lg p-4 bg-white">
          <div className="flex justify-between items-start mb-2">
            <span className="text-xs font-semibold text-blue-600 uppercase">{q.type.replace(/_/g, ' ')}</span>
            <button type="button" onClick={() => deleteQuestion(idx)} className="text-red-400 text-xs hover:text-red-600">Delete</button>
          </div>
          <input value={q.question} onChange={(e) => updateQuestion(idx, { question: e.target.value })}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm mb-2" placeholder="Question text" />
          {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options?.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2 mb-1">
              <input type="radio" name={`correct-${idx}`} checked={q.correct_answer === String(oi)}
                onChange={() => updateQuestion(idx, { correct_answer: String(oi) })} />
              <input value={opt} onChange={(e) => {
                  const opts = [...(q.options || [])]; opts[oi] = e.target.value;
                  updateQuestion(idx, { options: opts });
                }} className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm" placeholder={`Option ${oi + 1}`} />
            </div>
          ))}
          {q.type === 'short_answer' && (
            <p className="text-xs text-gray-400 italic">Short answer — not auto-graded</p>
          )}
        </div>
      ))}

      {adding ? (
        <div className="border border-blue-200 rounded-lg p-4 bg-blue-50">
          <div className="flex gap-2 mb-3">
            {(['multiple_choice', 'true_false', 'short_answer'] as const).map((t) => (
              <button key={t} type="button" onClick={() => setDraft({ ...BLANK_Q, type: t,
                  options: t === 'true_false' ? ['True', 'False'] : t === 'multiple_choice' ? ['', '', '', ''] : null,
                  correct_answer: t === 'short_answer' ? null : '0' })}
                className={`text-xs px-3 py-1.5 rounded-lg font-medium ${draft.type === t ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600'}`}>
                {t.replace(/_/g, ' ')}
              </button>
            ))}
          </div>
          <input value={draft.question} onChange={(e) => setDraft({ ...draft, question: e.target.value })}
            className="w-full border border-gray-200 rounded px-3 py-1.5 text-sm mb-2 bg-white" placeholder="Question text" />
          {(draft.type === 'multiple_choice' || draft.type === 'true_false') && draft.options?.map((opt, oi) => (
            <div key={oi} className="flex items-center gap-2 mb-1">
              <input type="radio" name="new-correct" checked={draft.correct_answer === String(oi)}
                onChange={() => setDraft({ ...draft, correct_answer: String(oi) })} />
              <input value={opt} onChange={(e) => {
                  const opts = [...(draft.options || [])]; opts[oi] = e.target.value;
                  setDraft({ ...draft, options: opts });
                }} className="flex-1 border border-gray-200 rounded px-2 py-1 text-sm bg-white" placeholder={`Option ${oi + 1}`} />
            </div>
          ))}
          <div className="flex gap-2 mt-3">
            <button type="button" onClick={saveNew} className="bg-blue-600 text-white px-4 py-1.5 rounded text-sm font-medium">Add Question</button>
            <button type="button" onClick={() => setAdding(false)} className="text-gray-500 text-sm px-2">Cancel</button>
          </div>
        </div>
      ) : (
        <button type="button" onClick={() => setAdding(true)}
          className="w-full border border-dashed border-gray-300 rounded-lg py-3 text-sm text-gray-500 hover:border-blue-400 hover:text-blue-600 transition-colors">
          + Add Question
        </button>
      )}
    </div>
  );
}
