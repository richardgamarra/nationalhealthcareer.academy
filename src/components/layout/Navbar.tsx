"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Home" },
  { href: "/courses", label: "Courses" },
  { href: "/calendar", label: "Live Classes" },
  { href: "/dashboard", label: "Dashboard" },
];

export default function Navbar() {
  const path = usePathname();
  return (
    <nav className="bg-gray-900 text-white px-6 py-3 flex items-center justify-between">
      <Link href="/" className="font-bold text-lg tracking-tight">
        NHA <span className="text-blue-400">Academy</span>
      </Link>
      <div className="flex gap-6 text-sm">
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
      </div>
    </nav>
  );
}
