'use client';

export default function CourseEditorError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="bg-white border border-red-200 rounded-xl shadow p-8 max-w-xl w-full mx-4">
        <h1 className="text-lg font-bold text-red-600 mb-2">Course Editor Error</h1>
        <p className="text-sm text-gray-700 mb-4">{error?.message || 'An unexpected error occurred.'}</p>
        {error?.digest && (
          <p className="text-xs text-gray-400 mb-4">Digest: {error.digest}</p>
        )}
        <pre className="text-xs bg-gray-100 rounded p-3 overflow-auto max-h-48 text-gray-600 mb-4">
          {error?.stack || 'No stack trace available.'}
        </pre>
        <button
          type="button"
          onClick={reset}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-blue-700"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
