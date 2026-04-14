import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] px-4 text-center">
      <h1 className="text-4xl font-bold mb-4">
        National Health Career <span className="text-blue-600">Academy</span>
      </h1>
      <p className="text-gray-600 text-lg mb-8 max-w-xl">
        Cybersecurity and Health IT courses with live instructor-led sessions.
        Learn at your own pace or join scheduled live classes via Zoom.
      </p>
      <div className="flex gap-4">
        <Link
          href="/courses"
          className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Browse Courses
        </Link>
        <Link
          href="/calendar"
          className="border border-gray-300 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Live Class Schedule
        </Link>
      </div>
    </div>
  );
}
