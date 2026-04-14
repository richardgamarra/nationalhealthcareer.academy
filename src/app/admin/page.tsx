export const dynamic = "force-dynamic";

import { auth } from "@/auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import Link from "next/link";

async function getStats() {
  const [[courseRows], [studentRows], [enrollRows], [classRows]] =
    await Promise.all([
      pool.query("SELECT COUNT(*) as count FROM courses WHERE is_published = 1"),
      pool.query("SELECT COUNT(*) as count FROM students WHERE role = 'student'"),
      pool.query("SELECT COUNT(*) as count FROM enrollments"),
      pool.query(
        "SELECT * FROM live_classes WHERE starts_at >= NOW() ORDER BY starts_at LIMIT 5"
      ),
    ]);

  return {
    courses: (courseRows as any[])[0].count as number,
    students: (studentRows as any[])[0].count as number,
    enrollments: (enrollRows as any[])[0].count as number,
    upcomingClasses: classRows as any[],
  };
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

export default async function AdminPage() {
  const session = await auth();
  if (!session || (session.user as any)?.role !== "admin") {
    redirect("/login");
  }

  let stats = { courses: 0, students: 0, enrollments: 0, upcomingClasses: [] as any[] };
  let dbError = false;

  try {
    stats = await getStats();
  } catch {
    dbError = true;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1 text-sm">
            Welcome back, {session.user?.name}
          </p>
        </div>
        <Link
          href="/admin/courses/new"
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
        >
          + New Course
        </Link>
      </div>

      {dbError && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-yellow-800 mb-6 text-sm">
          Could not load stats — database not connected.
        </div>
      )}

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
        <StatCard label="Published Courses" value={stats.courses} icon="📚" />
        <StatCard label="Students" value={stats.students} icon="🎓" />
        <StatCard label="Total Enrollments" value={stats.enrollments} icon="📋" />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-10">
        <AdminLink href="/admin/courses" title="Manage Courses" desc="View, edit, and publish courses" />
        <AdminLink href="/admin/students" title="Manage Students" desc="View enrolled students and progress" />
        <AdminLink href="/admin/live-classes" title="Live Classes" desc="Schedule and manage Zoom sessions" />
        <AdminLink href="/courses" title="View Course Catalog" desc="See what students see" />
      </div>

      {/* Upcoming classes */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Upcoming Live Classes</h2>
        {stats.upcomingClasses.length === 0 ? (
          <p className="text-gray-400 text-sm">No upcoming classes scheduled.</p>
        ) : (
          <div className="flex flex-col gap-3">
            {stats.upcomingClasses.map((cls: any) => (
              <div
                key={cls.id}
                className="bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between"
              >
                <div>
                  <p className="font-medium">{cls.title}</p>
                  <p className="text-sm text-gray-400 mt-0.5">
                    {formatDate(cls.starts_at)} &bull; {cls.duration_min} min &bull;{" "}
                    {cls.instructor}
                  </p>
                </div>
                <a
                  href={cls.zoom_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 text-sm font-medium hover:underline shrink-0 ml-4"
                >
                  Zoom Link
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-6 flex items-center gap-4">
      <span className="text-3xl">{icon}</span>
      <div>
        <p className="text-2xl font-bold">{value}</p>
        <p className="text-sm text-gray-500">{label}</p>
      </div>
    </div>
  );
}

function AdminLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      className="bg-white border border-gray-200 rounded-xl p-5 hover:border-blue-400 hover:shadow-sm transition-all group"
    >
      <p className="font-semibold group-hover:text-blue-600 transition-colors">{title}</p>
      <p className="text-sm text-gray-500 mt-0.5">{desc}</p>
    </Link>
  );
}
