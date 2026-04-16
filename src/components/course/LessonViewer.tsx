import sanitizeHtml from 'sanitize-html';
import type { Lesson, QuizQuestion } from '@/types';

interface Props { lesson: Lesson; questions: QuizQuestion[]; }

export default function LessonViewer({ lesson, questions }: Props) {
  if (lesson.type === 'text') {
    const safe = sanitizeHtml(lesson.content || '', {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(['h1', 'h2', 'h3', 'u', 'del', 'img']),
      allowedAttributes: {
        ...sanitizeHtml.defaults.allowedAttributes,
        'a': ['href', 'name', 'target', 'rel'],
        'img': ['src', 'alt', 'width', 'height'],
      },
    });
    return (
      <div className="prose prose-sm max-w-none p-6"
        dangerouslySetInnerHTML={{ __html: safe || '<p class="text-gray-400">No content yet.</p>' }} />
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
    const baseUrl = (process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://nationalhealthcareer.com').replace(/\/$/, '');
    const absoluteUrl = `${baseUrl}${url}`;
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
      <div className="bg-gray-50 min-h-full p-6 md:p-10">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">{lesson.title}</h1>
          {questions.length > 0 && (
            <p className="text-sm text-gray-500 mb-8">{questions.length} question{questions.length !== 1 ? 's' : ''}</p>
          )}
          {questions.length === 0 && (
            <p className="text-gray-400 text-base mt-8 text-center">No questions yet.</p>
          )}
          <div className="space-y-5">
            {questions.map((q, idx) => (
              <div key={q.id} className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                {/* Question header */}
                <div className="px-6 py-5 border-b border-gray-100">
                  <div className="flex items-start gap-4">
                    <span className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-600 text-white text-sm font-bold flex items-center justify-center mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-base font-medium text-gray-900 leading-relaxed">{q.question}</p>
                  </div>
                </div>
                {/* Options */}
                <div className="px-6 py-4 space-y-2">
                  {(q.type === 'multiple_choice' || q.type === 'true_false') && q.options?.map((opt, oi) => (
                    <label key={oi}
                      className="flex items-center gap-4 px-4 py-3 rounded-xl border border-gray-200 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors group">
                      <input type="radio" name={`q-${q.id}`} className="w-4 h-4 accent-blue-600 flex-shrink-0" />
                      <span className="text-base text-gray-800 group-hover:text-blue-700">{opt}</span>
                    </label>
                  ))}
                  {q.type === 'short_answer' && (
                    <textarea
                      rows={4}
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-base text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      placeholder="Write your answer here…"
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
          {questions.length > 0 && (
            <p className="text-sm text-gray-400 text-center mt-8 italic">Quiz grading coming in a future update.</p>
          )}
        </div>
      </div>
    );
  }

  if (lesson.type === 'link') {
    const url = lesson.file_path;
    if (!url) return <p className="p-6 text-gray-400 text-sm">No link set yet.</p>;
    return (
      <div className="flex flex-col h-full p-4 gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600 truncate">{url}</span>
          <a href={url} target="_blank" rel="noopener noreferrer"
            className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 shrink-0">
            Open in new tab ↗
          </a>
        </div>
        <iframe
          src={url}
          className="flex-1 w-full border border-gray-200 rounded-lg min-h-[500px]"
          title={lesson.title}
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      </div>
    );
  }

  return null;
}
