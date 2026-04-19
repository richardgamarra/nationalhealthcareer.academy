"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";
import { useLang } from "@/context/LangContext";

function ShieldLogo() {
  return (
    <svg
      width="38"
      height="38"
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M22 2L6 9v11c0 10 7 19 16 21 9-2 16-11 16-21V9L22 2z"
        fill="#1e4d9b"
        stroke="#60a5fa"
        strokeWidth="1.5"
      />
      <rect x="18" y="12" width="8" height="20" rx="2" fill="white" />
      <rect x="12" y="18" width="20" height="8" rx="2" fill="white" />
    </svg>
  );
}

export default function Navbar() {
  const path = usePathname();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, t, toggle } = useLang();

  const navLinks = [
    { href: "/courses", label: t.nav.programs },
    { href: "/courses", label: t.nav.courses },
    { href: "/#about", label: t.nav.about },
    { href: "/#contact", label: t.nav.contact },
  ];

  return (
    <header style={{ background: "#0f2b5b", borderBottom: "2px solid #1d4ed8" }}>
      {/* Main bar */}
      <nav
        className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center justify-between text-white"
        style={{ height: "64px" }}
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0">
          <ShieldLogo />
          <div className="leading-none">
            <div className="text-white font-extrabold text-[14px] sm:text-[15px] tracking-tight leading-tight">
              National Health Career
            </div>
            <div
              className="font-medium text-[9px] sm:text-[10px] tracking-[2px] uppercase"
              style={{ color: "#93c5fd" }}
            >
              Academy
            </div>
          </div>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-5 text-sm">
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="transition-colors hover:text-blue-300"
              style={{ color: "#bfdbfe" }}
            >
              {l.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              className="transition-colors hover:text-blue-300"
              style={{
                color: path.startsWith("/admin") ? "#60a5fa" : "#bfdbfe",
                fontWeight: path.startsWith("/admin") ? 600 : 400,
              }}
            >
              {t.nav.admin}
            </Link>
          )}

          {/* Language toggle */}
          <button
            onClick={toggle}
            className="text-[11px] font-semibold px-2 py-0.5 rounded border transition-colors hover:bg-blue-800"
            style={{ color: "#93c5fd", borderColor: "#1d4ed8" }}
            aria-label="Toggle language"
          >
            {lang === "en" ? "ES 🌐" : "EN 🌐"}
          </button>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2 sm:gap-3">
          {session ? (
            <>
              <Link
                href="/dashboard"
                className="hidden md:inline text-sm transition-colors hover:text-blue-300"
                style={{ color: "#bfdbfe" }}
              >
                {t.nav.dashboard}
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="hidden md:inline text-sm transition-colors hover:text-red-400"
                style={{ color: "#bfdbfe" }}
              >
                {t.nav.signOut}
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="hidden md:inline text-sm transition-colors hover:text-blue-300"
              style={{ color: "#bfdbfe" }}
            >
              {t.nav.signIn}
            </Link>
          )}

          <Link
            href="/courses"
            className="bg-blue-600 text-white text-xs sm:text-sm font-semibold px-3 sm:px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
          >
            {t.nav.enrollNow}
          </Link>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex flex-col gap-1 p-2 rounded"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label="Toggle navigation menu"
          >
            <span
              className="block w-5 h-0.5 transition-all"
              style={{
                background: "#bfdbfe",
                transform: mobileOpen ? "rotate(45deg) translate(2px, 5px)" : "",
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all"
              style={{
                background: "#bfdbfe",
                opacity: mobileOpen ? 0 : 1,
              }}
            />
            <span
              className="block w-5 h-0.5 transition-all"
              style={{
                background: "#bfdbfe",
                transform: mobileOpen ? "rotate(-45deg) translate(2px, -5px)" : "",
              }}
            />
          </button>
        </div>
      </nav>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div
          className="md:hidden px-4 pb-4 flex flex-col gap-3 text-sm"
          style={{ background: "#0c2351", borderTop: "1px solid #1d4ed8" }}
        >
          {navLinks.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="transition-colors hover:text-blue-300 py-1"
              style={{ color: "#bfdbfe" }}
              onClick={() => setMobileOpen(false)}
            >
              {l.label}
            </Link>
          ))}

          {isAdmin && (
            <Link
              href="/admin"
              className="transition-colors hover:text-blue-300 py-1"
              style={{ color: "#bfdbfe" }}
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.admin}
            </Link>
          )}

          <div
            className="border-t pt-3 flex flex-col gap-2"
            style={{ borderColor: "#1d4ed8" }}
          >
            <button
              onClick={() => { toggle(); setMobileOpen(false); }}
              className="text-left text-[11px] font-semibold w-fit px-2 py-0.5 rounded border"
              style={{ color: "#93c5fd", borderColor: "#1d4ed8" }}
            >
              {lang === "en" ? "ES 🌐" : "EN 🌐"}
            </button>

            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="py-1 transition-colors hover:text-blue-300"
                  style={{ color: "#bfdbfe" }}
                  onClick={() => setMobileOpen(false)}
                >
                  {t.nav.dashboard}
                </Link>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="text-left py-1 transition-colors hover:text-red-400"
                  style={{ color: "#bfdbfe" }}
                >
                  {t.nav.signOut}
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="py-1 transition-colors hover:text-blue-300"
                style={{ color: "#bfdbfe" }}
                onClick={() => setMobileOpen(false)}
              >
                {t.nav.signIn}
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
