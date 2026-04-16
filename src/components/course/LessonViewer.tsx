import type { Lesson, QuizQuestion } from '@/types';

interface Props { lesson: Lesson; questions: QuizQuestion[]; }

export default function LessonViewer({ lesson, questions }: Props) {
  if (lesson.type === 'text') {
    return (
      <div className="prose prose-sm max-w-none p-6"
        dangerouslySetInnerHTML={{ __html: lesson.content || '<p class="text-gray-400">No content yet.</p>' }} />
    );
  }

  if (lesson.type === 'document') {
    const url = lesson.file_path;
    if (!url) return <p className="p-6 text-gray-400 text-sm">No document uploaded yet.</p>;
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        <div className="flex justify-end">
          <a href={url} download className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">⬇ Download PDF</a>
        </div>
        <iframe src={url} className="flex-1 w-full border border-gray-200 rounded-lg min-h-[500px]" title={lesson.title} />
      </div>
    );
  }

  if (lesson.type === 'presentation') {
    const url = lesson.file_path;
    if (!url) return <p className="p-6 text-gray-400 text-sm">No presentation uploaded yet.</p>;
    const absoluteUrl = `https://nationalhealthcareer.com${url}`;
    const viewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(absoluteUrl)}`;
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        <div className="flex justify-end">
          <a href={url} download className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700">⬇ Download PPTX</a>
        </div>
        <iframe src={viewerUrl} className="flex-1 w-full border border-gray-200 rounded-lg min-h-[500px]" title={lesson.title} />
      </div>
    );
  }

  if (lesson.type === 'quiz') {
    return (
      <div className="p-6 space-y-6">
        <h2 className="font-bold text-lg">{lesson.title}</h2>
        {questions.length === 0 && <p className="text-gray-400 text-sm">No questions yet.</p>}
        {questions.map((q, idx) => (
          <div key={q.id} className="bg-white border border-gray-200 rounded-xl p-4">
            <p className="font-medium text-gray-900 mb-3 text-sm">{idx + 1}. {q.question}</p>
            {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options?.map((opt, oi) => (
              <label key={oi} className="flex items-center gap-3 py-1.5 cursor-pointer group">
                <input type="radio" name={`q-${q.id}`} className="w-4 h-4" />
                <span className="text-sm text-gray-700 group-hover:text-blue-600">{opt}</span>
              </label>
            ))}
            {q.type === 'short_answer' && (
              <textarea rows={3} className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Your answer…" />
            )}
          </div>
        ))}
        {questions.length > 0 && (
          <button type="button" className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:bg-blue-700">Submit Quiz</button>
        )}
      </div>
    );
  }

  return null;
}
