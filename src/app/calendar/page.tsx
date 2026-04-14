import pool from "@/lib/db";
import { LiveClass } from "@/types";

async function getLiveClasses(): Promise<LiveClass[]> {
  const [rows] = await pool.query(
    "SELECT * FROM live_classes WHERE starts_at >= NOW() ORDER BY starts_at LIMIT 20"
  );
  return rows as LiveClass[];
}

function formatDate(dt: string) {
  return new Date(dt).toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default async function CalendarPage() {
  let classes: LiveClass[] = [];
  let error = "";

  try {
    classes = await getLiveClasses();
  } catch {
    error = "Could not load schedule. Database not connected yet.";
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Live Class Schedule</h1>
      <p className="text-gray-500 mb-8">Join live sessions via Zoom — up to 25 students</p>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 mb-6">
          {error}
        </div>
      )}

      {classes.length === 0 && !error && (
        <p className="text-gray-400">No upcoming classes scheduled.</p>
      )}

      <div className="flex flex-col gap-4">
        {classes.map((cls) => (
          <div
            key={cls.id}
            className="bg-white border border-gray-200 rounded-xl p-5 flex items-start justify-between"
          >
            <div>
              <h2 className="font-semibold text-lg">{cls.title}</h2>
              {cls.description && (
                <p className="text-gray-500 text-sm mt-1">{cls.description}</p>
              )}
              <p className="text-sm text-gray-400 mt-2">
                {formatDate(cls.starts_at)} &bull; {cls.duration_min} min &bull;{" "}
                {cls.instructor}
              </p>
            </div>
            <a
              href={cls.zoom_link}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-4 shrink-0 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
            >
              Join Zoom
            </a>
          </div>
        ))}
      </div>
    </div>
  );
}
