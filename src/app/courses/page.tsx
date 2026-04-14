import pool from "@/lib/db";
import { Course } from "@/types";
import Link from "next/link";

async function getCourses(): Promise<Course[]> {
  const [rows] = await pool.query(
    "SELECT * FROM courses WHERE is_published = 1 ORDER BY id"
  );
  return rows as Course[];
}

const levelColors = {
  beginner: "bg-green-100 text-green-800",
  intermediate: "bg-yellow-100 text-yellow-800",
  advanced: "bg-red-100 text-red-800",
};

export default async function CoursesPage() {
  let courses: Course[] = [];
  let error = "";

  try {
    courses = await getCourses();
  } catch {
    error = "Could not load courses. Database not connected yet.";
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <h1 className="text-3xl font-bold mb-2">Courses</h1>
      <p className="text-gray-500 mb-8">Cybersecurity &amp; Health IT training</p>

      {error && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4 text-yellow-800 mb-6">
          {error}
        </div>
      )}

      {courses.length === 0 && !error && (
        <p className="text-gray-400">No courses published yet.</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course) => (
          <Link
            key={course.id}
            href={`/courses/${course.slug}`}
            className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-md transition-shadow"
          >
            {course.thumbnail && (
              <img
                src={course.thumbnail}
                alt={course.title}
                className="w-full h-36 object-cover rounded-lg mb-4"
              />
            )}
            <span
              className={`text-xs font-semibold px-2 py-1 rounded-full ${
                levelColors[course.level] ?? "bg-gray-100 text-gray-600"
              }`}
            >
              {course.level}
            </span>
            <h2 className="font-semibold text-lg mt-2 mb-1">{course.title}</h2>
            <p className="text-gray-500 text-sm line-clamp-2">{course.description}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
