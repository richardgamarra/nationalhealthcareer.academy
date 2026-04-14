"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/calendar", label: "Live Classes" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const path = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg tracking-tight">
        NHA <span className="text-blue-400">Academy</span>
      </Link>
      <div className="flex items-center gap-6 text-sm">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`hover:text-blue-400 transition-colors ${
              path === l.href ? "text-blue-400 font-semibold" : "text-gray-300"
            }`}
          >
            {l.label}
          </Link>
        ))}

        {isAdmin && (
          <Link
            href="/admin"
            className={`hover:text-blue-400 transition-colors ${
              path.startsWith("/admin") ? "text-blue-400 font-semibold" : "text-gray-300"
            }`}
          >
            Admin
          </Link>
        )}

        {session ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="text-gray-300 hover:text-red-400 transition-colors"
          >
            Sign Out
          </button>
        ) : (
          <Link
            href="/login"
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
