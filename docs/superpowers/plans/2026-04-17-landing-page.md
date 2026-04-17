# Landing Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the minimal homepage (`src/app/page.tsx`) with a full institutional-quality landing page that positions National Health Career Academy as a serious US healthcare education provider.

**Architecture:** Eight standalone React Server Components in `src/components/home/`, composed in `src/app/page.tsx`. No new dependencies — Tailwind CSS v4 + Next.js 16 Image only. Complex gradients use inline `style` props; Tailwind handles spacing/layout/typography.

**Tech Stack:** Next.js 16 App Router, Tailwind CSS v4, `next/image` for all remote images (Unsplash), TypeScript.

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `public/logo.svg` | CREATE | Shield & Cross SVG asset |
| `next.config.ts` | MODIFY | Add `images.unsplash.com` remotePattern |
| `src/components/layout/Navbar.tsx` | MODIFY | Shield logo + institutional nav links |
| `src/components/home/HeroSection.tsx` | CREATE | Hero with gradient bg + Unsplash photo |
| `src/components/home/StatsBar.tsx` | CREATE | 5-stat dark bar |
| `src/components/home/ProgramsSection.tsx` | CREATE | 8-card program grid |
| `src/components/home/PathwaySection.tsx` | CREATE | 4-step pathway + team photo banner |
| `src/components/home/WhySection.tsx` | CREATE | 6 value-prop cards + accent photo |
| `src/components/home/TestimonialsSection.tsx` | CREATE | 3 student testimonials on dark bg |
| `src/components/home/SalariesSection.tsx` | CREATE | 4 salary cards + map photo |
| `src/components/home/CtaBanner.tsx` | CREATE | Final CTA with background image |
| `src/app/page.tsx` | MODIFY | Compose all sections |

---

## Task 1: Infrastructure — logo SVG + next.config.ts remotePatterns

**Files:**
- Create: `public/logo.svg`
- Modify: `next.config.ts`

- [ ] **Step 1: Create the Shield & Cross logo SVG**

Create `public/logo.svg` with this exact content:

```svg
<svg width="42" height="42" viewBox="0 0 44 44" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M22 2L6 9v11c0 10 7 19 16 21 9-2 16-11 16-21V9L22 2z"
        fill="#1e4d9b" stroke="#60a5fa" stroke-width="1.5"/>
  <rect x="18" y="12" width="8" height="20" rx="2" fill="white"/>
  <rect x="12" y="18" width="20" height="8" rx="2" fill="white"/>
</svg>
```

- [ ] **Step 2: Update next.config.ts to allow Unsplash images**

Replace `next.config.ts` with:

```ts
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 3: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors (zero output)

- [ ] **Step 4: Commit**

```bash
git add public/logo.svg next.config.ts
git commit -m "feat: add shield logo SVG and Unsplash remotePattern"
```

---

## Task 2: Navbar — institutional redesign

**Files:**
- Modify: `src/components/layout/Navbar.tsx`

The navbar gains the shield SVG logo, a new dark navy background, updated links (Programs · Courses · About · Contact + EN/ES toggle), and an "Enroll Now →" CTA. Auth buttons are kept.

- [ ] **Step 1: Replace Navbar.tsx with institutional version**

```tsx
"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";

const navLinks = [
  { href: "/courses", label: "Programs" },
  { href: "/courses", label: "Courses" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
];

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

  return (
    <nav
      className="text-white px-6 flex items-center justify-between"
      style={{
        background: "#0f2b5b",
        borderBottom: "2px solid #1d4ed8",
        height: "64px",
        minHeight: "64px",
      }}
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 shrink-0">
        <ShieldLogo />
        <div className="leading-none">
          <div className="text-white font-extrabold text-[15px] tracking-tight leading-tight">
            National Health Career
          </div>
          <div
            className="font-medium text-[10px] tracking-[2px] uppercase"
            style={{ color: "#93c5fd" }}
          >
            Academy
          </div>
        </div>
      </Link>

      {/* Center nav links — hidden on mobile */}
      <div className="hidden md:flex items-center gap-6 text-sm">
        {navLinks.map((l) => (
          <Link
            key={l.label}
            href={l.href}
            className="transition-colors hover:text-blue-300"
            style={{
              color: path === l.href ? "#60a5fa" : "#bfdbfe",
              fontWeight: path === l.href ? 600 : 400,
            }}
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
            }}
          >
            Admin
          </Link>
        )}

        {/* EN/ES toggle */}
        <button
          className="text-[11px] font-medium px-2 py-0.5 rounded border transition-colors hover:bg-blue-800"
          style={{ color: "#93c5fd", borderColor: "#1d4ed8" }}
          aria-label="Toggle language"
        >
          EN / ES
        </button>
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {session ? (
          <>
            <Link
              href="/dashboard"
              className="hidden md:inline text-sm transition-colors hover:text-blue-300"
              style={{ color: "#bfdbfe" }}
            >
              Dashboard
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="text-sm transition-colors hover:text-red-400"
              style={{ color: "#bfdbfe" }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              href="/login"
              className="hidden md:inline text-sm transition-colors hover:text-blue-300"
              style={{ color: "#bfdbfe" }}
            >
              Sign In
            </Link>
            <Link
              href="/courses"
              className="bg-blue-600 text-white text-sm font-semibold px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              Enroll Now →
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/Navbar.tsx
git commit -m "feat: institutional navbar with shield logo and updated links"
```

---

## Task 3: HeroSection

**Files:**
- Create: `src/components/home/HeroSection.tsx`

Full-width gradient hero. Left side: badge, H1, body copy, two CTAs, trust bullets. Right side: Unsplash healthcare photo (hidden on mobile).

- [ ] **Step 1: Create HeroSection.tsx**

```tsx
import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0f2b5b 0%, #1e4d9b 55%, #1a6b9a 100%)",
        minHeight: "520px",
      }}
    >
      <div className="relative max-w-7xl mx-auto px-6 py-16 flex items-center">
        {/* Left content — 55% on desktop, full width on mobile */}
        <div className="w-full md:w-[55%] z-10">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-sm font-medium px-4 py-1.5 rounded-full mb-6"
            style={{
              background: "rgba(37,99,235,0.25)",
              border: "1px solid rgba(96,165,250,0.4)",
              color: "#bfdbfe",
            }}
          >
            🎓 NHA Certification Exam Prep | English &amp; Spanish
          </div>

          {/* H1 */}
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-white mb-4">
            Launch Your Healthcare Career
            <br />
            <span style={{ color: "#60a5fa" }}>in as Little as 4–6 Months</span>
          </h1>

          {/* Body */}
          <p className="text-base md:text-lg mb-8 leading-relaxed max-w-lg" style={{ color: "#bfdbfe" }}>
            Online, self-paced programs designed to prepare you for nationally
            recognized NHA certifications. Join thousands of graduates now
            working in hospitals and clinics across the United States.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4 mb-8">
            <Link
              href="/courses"
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
            >
              Browse Programs →
            </Link>
            <Link
              href="/courses"
              className="font-semibold px-6 py-3 rounded-lg transition-colors text-sm"
              style={{
                border: "2px solid rgba(255,255,255,0.5)",
                color: "white",
              }}
              onMouseEnter={(e) =>
                ((e.target as HTMLAnchorElement).style.background =
                  "rgba(255,255,255,0.1)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLAnchorElement).style.background = "")
              }
            >
              Free Info Session
            </Link>
          </div>

          {/* Trust row */}
          <ul className="flex flex-wrap gap-x-5 gap-y-2 text-sm" style={{ color: "#93c5fd" }}>
            {[
              "No prior experience required",
              "Available in English & Spanish",
              "100% Online & Self-Paced",
              "NHA Exam Prep Included",
            ].map((item) => (
              <li key={item} className="flex items-center gap-1.5">
                <span style={{ color: "#4ade80" }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right image — desktop only */}
        <div
          className="hidden md:block absolute right-0 top-0 w-[45%] h-full"
          style={{ minHeight: "520px" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80"
            alt="Female medical professional in scrubs smiling"
            fill
            priority
            className="object-cover object-center"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 15%, black 40%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.6) 15%, black 40%)",
            }}
          />
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/home/HeroSection.tsx
git commit -m "feat: add HeroSection with gradient bg and healthcare photo"
```

---

## Task 4: StatsBar

**Files:**
- Create: `src/components/home/StatsBar.tsx`

Dark navy stats bar with 5 columns separated by vertical dividers. No images.

- [ ] **Step 1: Create StatsBar.tsx**

```tsx
const stats = [
  { value: "2,400+", label: "Graduates" },
  { value: "8", label: "Certification Programs" },
  { value: "94%", label: "NHA Pass Rate" },
  { value: "$38K–$55K", label: "Avg. Starting Salary (USA)" },
  { value: "4.8 ★", label: "Instructor Rating" },
];

export default function StatsBar() {
  return (
    <div
      className="w-full"
      style={{
        background: "#1e3a8a",
        borderBottom: "2px solid #1d4ed8",
      }}
    >
      <div className="max-w-7xl mx-auto px-6 py-5 flex flex-wrap justify-center md:justify-between gap-y-4">
        {stats.map((stat, i) => (
          <div key={stat.label} className="flex items-center">
            {/* Divider (not before first item) */}
            {i > 0 && (
              <div
                className="hidden md:block w-px h-10 mr-8"
                style={{ background: "rgba(96,165,250,0.25)" }}
                aria-hidden="true"
              />
            )}
            <div className="text-center md:text-left px-2 md:px-0">
              <div
                className="text-2xl font-extrabold leading-none"
                style={{ color: "#ffffff" }}
              >
                {stat.value}
              </div>
              <div
                className="text-xs font-medium mt-1 whitespace-nowrap"
                style={{ color: "#93c5fd" }}
              >
                {stat.label}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/home/StatsBar.tsx
git commit -m "feat: add StatsBar with 5 institutional stats"
```

---

## Task 5: ProgramsSection

**Files:**
- Create: `src/components/home/ProgramsSection.tsx`

Light gray background. 8 program cards in a 4-col grid (2-col on mobile). Each card has a colored top border, program thumbnail, cert badge, tag badge, title, and cert info.

- [ ] **Step 1: Create ProgramsSection.tsx**

```tsx
import Image from "next/image";
import Link from "next/link";

const programs = [
  {
    title: "Medical Assistant",
    cert: "CCMA Prep",
    borderColor: "#2563eb",
    tag: "Most Popular",
    tagColor: "#2563eb",
    slug: "medical-assistant",
    image: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&q=80",
    imageAlt: "Medical assistant professional",
  },
  {
    title: "Phlebotomy Technician",
    cert: "CPT Prep",
    borderColor: "#0891b2",
    tag: "High Demand",
    tagColor: "#0891b2",
    slug: "phlebotomy-technician",
    image: "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=120&q=80",
    imageAlt: "Phlebotomy technician drawing blood",
  },
  {
    title: "EKG Technician",
    cert: "CET Prep",
    borderColor: "#dc2626",
    tag: "Growing Field",
    tagColor: "#dc2626",
    slug: "ekg-technician",
    image: "https://images.unsplash.com/photo-1516069677018-378515003435?w=120&q=80",
    imageAlt: "EKG heart monitor",
  },
  {
    title: "Medical Coding & Billing",
    cert: "CBCS Prep",
    borderColor: "#16a34a",
    tag: "Remote-Friendly",
    tagColor: "#16a34a",
    slug: "medical-coding-billing",
    image: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&q=80",
    imageAlt: "Medical coding on computer",
  },
  {
    title: "Anatomy & Physiology",
    cert: "Foundation",
    borderColor: "#7c3aed",
    tag: "Core Prerequisite",
    tagColor: "#7c3aed",
    slug: "anatomy-physiology",
    image: "https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=120&q=80",
    imageAlt: "Anatomy medical study",
  },
  {
    title: "Medical Law & Ethics",
    cert: "HIPAA · Rights",
    borderColor: "#ca8a04",
    tag: "Required for MA",
    tagColor: "#ca8a04",
    slug: "medical-law-ethics",
    image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=120&q=80",
    imageAlt: "Legal books and gavel",
  },
  {
    title: "Intro to Healthcare",
    cert: "Start here",
    borderColor: "#0f172a",
    tag: "First Lesson Free",
    tagColor: "#0f172a",
    slug: "intro-healthcare",
    image: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&q=80",
    imageAlt: "Healthcare introduction",
  },
  {
    title: "Medical Insurance",
    cert: "CMAA Prep",
    borderColor: "#db2777",
    tag: "Office-Focused",
    tagColor: "#db2777",
    slug: "medical-insurance",
    image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=120&q=80",
    imageAlt: "Medical insurance paperwork",
  },
];

export default function ProgramsSection() {
  return (
    <section
      className="w-full py-16 px-6"
      style={{ background: "#f8fafc" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-extrabold mb-3"
            style={{ color: "#0f2b5b" }}
          >
            NHA Certification Programs
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#475569" }}>
            Choose from 8 nationally recognized career tracks — all fully online,
            bilingual, and designed around the official NHA exam competencies.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {programs.map((p) => (
            <Link
              key={p.slug}
              href={`/courses`}
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              style={{ borderTop: `4px solid ${p.borderColor}` }}
            >
              {/* Card top: tag + image */}
              <div className="flex items-center justify-between px-4 pt-4 pb-2">
                <span
                  className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    background: `${p.tagColor}18`,
                    color: p.tagColor,
                  }}
                >
                  ● {p.tag}
                </span>
                <div className="relative w-12 h-12 shrink-0 ml-2">
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
              </div>

              {/* Card body */}
              <div className="px-4 pb-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3
                    className="font-bold text-sm leading-tight mb-1"
                    style={{ color: "#0f2b5b" }}
                  >
                    {p.title}
                  </h3>
                  <p className="text-[11px]" style={{ color: "#64748b" }}>
                    {p.cert}
                  </p>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* View all */}
        <div className="text-center">
          <Link
            href="/courses"
            className="inline-block font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors hover:bg-blue-50"
            style={{
              border: "2px solid #2563eb",
              color: "#2563eb",
            }}
          >
            View All Programs →
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/home/ProgramsSection.tsx
git commit -m "feat: add ProgramsSection with 8 certification program cards"
```

---

## Task 6: PathwaySection

**Files:**
- Create: `src/components/home/PathwaySection.tsx`

White background. 4-step horizontal flow with connecting lines. Below steps: full-width healthcare team banner image with text overlay.

- [ ] **Step 1: Create PathwaySection.tsx**

```tsx
import Image from "next/image";
import Link from "next/link";

const steps = [
  {
    number: "1",
    title: "Choose a Program",
    description: "8 career tracks available",
    color: "#2563eb",
  },
  {
    number: "2",
    title: "Learn Online",
    description: "Self-paced, EN & ES",
    color: "#2563eb",
  },
  {
    number: "3",
    title: "Pass the NHA Exam",
    description: "Fully prepared with us",
    color: "#2563eb",
  },
  {
    number: "4",
    title: "Get Hired",
    description: "$38K–$55K/yr USA",
    color: "#16a34a",
  },
];

export default function PathwaySection() {
  return (
    <section
      className="w-full py-16 px-6"
      style={{
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-extrabold mb-3"
            style={{ color: "#0f2b5b" }}
          >
            Your Path to Certification
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#475569" }}>
            Four steps stand between you and a rewarding healthcare career. We
            guide you through every one.
          </p>
        </div>

        {/* Steps */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8 md:gap-0 mb-10">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex md:flex-col items-center md:items-center gap-4 md:gap-3 flex-1 relative"
            >
              {/* Connecting line — between steps on desktop */}
              {i < steps.length - 1 && (
                <div
                  className="hidden md:block absolute left-1/2 top-7 w-full h-0.5 z-0"
                  style={{
                    background: "linear-gradient(to right, #2563eb, #bfdbfe)",
                    transform: "translateX(50%)",
                  }}
                  aria-hidden="true"
                />
              )}

              {/* Circle */}
              <div
                className="relative z-10 flex items-center justify-center w-14 h-14 rounded-full text-white font-extrabold text-xl shrink-0 shadow-md"
                style={{ background: step.color }}
              >
                {step.number}
              </div>

              {/* Text */}
              <div className="md:text-center">
                <div
                  className="font-bold text-base leading-tight"
                  style={{ color: step.color === "#16a34a" ? "#16a34a" : "#0f2b5b" }}
                >
                  {step.title}
                </div>
                <div className="text-sm mt-0.5" style={{ color: "#64748b" }}>
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Banner image */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "200px", borderRadius: "12px" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80"
            alt="Diverse professional medical team"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          {/* Overlay */}
          <div
            className="absolute inset-0 flex items-center px-8"
            style={{
              background:
                "linear-gradient(to right, rgba(15,43,91,0.7), rgba(15,43,91,0.3))",
            }}
          >
            <p className="text-white font-semibold text-xl md:text-2xl">
              Your future starts with a single step.
            </p>
          </div>
        </div>

        {/* CTA below banner */}
        <div className="text-center mt-8">
          <Link
            href="/courses"
            className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm inline-block"
          >
            Start Your Journey →
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/home/PathwaySection.tsx
git commit -m "feat: add PathwaySection with 4-step flow and team photo"
```

---

## Task 7: WhySection

**Files:**
- Create: `src/components/home/WhySection.tsx`

Light blue background. Section title + 6 value-prop cards in a 3-col grid. Accent photo on right side (desktop only).

- [ ] **Step 1: Create WhySection.tsx**

```tsx
import Image from "next/image";

const cards = [
  {
    icon: "🎓",
    title: "Expert-Led Instruction",
    description:
      "Certified healthcare educators with real clinical experience in US hospitals and clinics.",
  },
  {
    icon: "🌐",
    title: "Bilingual — English & Spanish",
    description:
      "Every program is available in both languages. No student gets left behind.",
  },
  {
    icon: "📱",
    title: "100% Online & Self-Paced",
    description:
      "Study from anywhere, anytime. No rigid schedule, no commute, no classroom.",
  },
  {
    icon: "🏆",
    title: "NHA Exam Preparation",
    description:
      "Curriculum built around official NHA competencies — CCMA, CPT, CET, CBCS and more.",
  },
  {
    icon: "💼",
    title: "Career Support",
    description:
      "Resume guidance, interview prep, and salary benchmarks for the US healthcare market.",
  },
  {
    icon: "💰",
    title: "Affordable Tuition",
    description:
      "A fraction of the cost of community college — with the same nationally recognized NHA certification outcome.",
  },
];

export default function WhySection() {
  return (
    <section
      className="w-full py-16 px-6"
      style={{ background: "#f0f7ff" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading row: title + accent image */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-10">
          <div className="md:max-w-xl">
            <h2
              className="text-3xl font-extrabold mb-3"
              style={{ color: "#0f2b5b" }}
            >
              Why NHA Academy?
            </h2>
            <p className="text-base" style={{ color: "#475569" }}>
              We built this academy for working adults who need flexibility,
              affordability, and real results — in both English and Spanish.
            </p>
          </div>

          {/* Accent image — desktop only */}
          <div
            className="hidden md:block shrink-0 overflow-hidden"
            style={{ width: "280px", height: "200px", borderRadius: "12px" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80"
              alt="Student studying online with laptop"
              width={280}
              height={200}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* 3-col card grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ border: "1px solid #dbeafe" }}
            >
              <div className="text-3xl mb-3">{card.icon}</div>
              <h3
                className="font-bold text-base mb-2"
                style={{ color: "#0f2b5b" }}
              >
                {card.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: "#475569" }}>
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/home/WhySection.tsx
git commit -m "feat: add WhySection with 6 value-prop cards and accent photo"
```

---

## Task 8: TestimonialsSection

**Files:**
- Create: `src/components/home/TestimonialsSection.tsx`

Dark navy background. 3-column grid of quote cards (1-col on mobile). Each card: colored left border, circular avatar, name, credential badge, quote.

- [ ] **Step 1: Create TestimonialsSection.tsx**

```tsx
import Image from "next/image";

const testimonials = [
  {
    name: "Maria G.",
    credential: "CCMA, Houston TX",
    quote:
      "I went from zero healthcare experience to a certified Medical Assistant in 5 months. The bilingual materials made all the difference — I could study in Spanish when English got tough.",
    borderColor: "#2563eb",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&q=80",
    avatarAlt: "Maria G., Medical Assistant graduate",
  },
  {
    name: "James R.",
    credential: "CET, Miami FL",
    quote:
      "The EKG program was incredibly thorough. The practice quizzes are almost exactly like the real CET exam. I passed on my first attempt and had a job offer within 3 weeks.",
    borderColor: "#16a34a",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80",
    avatarAlt: "James R., EKG Technician graduate",
  },
  {
    name: "Carmen V.",
    credential: "CPT, Orlando FL",
    quote:
      "As a single mother working full-time, self-paced learning was the only option for me. NHA Academy made it possible. I'm now a Certified Phlebotomy Technician earning $22/hr.",
    borderColor: "#0891b2",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80",
    avatarAlt: "Carmen V., Phlebotomy Technician graduate",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      className="w-full py-16 px-6"
      style={{ background: "#0f2b5b" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-white mb-3">
            Student Success Stories
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#93c5fd" }}>
            Real graduates. Real careers. Real results across the United States.
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl p-6 flex flex-col gap-4"
              style={{
                background: "rgba(255,255,255,0.06)",
                borderLeft: `4px solid ${t.borderColor}`,
                border: `1px solid rgba(96,165,250,0.15)`,
                borderLeftWidth: "4px",
                borderLeftColor: t.borderColor,
              }}
            >
              {/* Avatar + name */}
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12 shrink-0">
                  <Image
                    src={t.avatar}
                    alt={t.avatarAlt}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
                <div>
                  <div className="text-white font-bold text-sm">{t.name}</div>
                  <span
                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                    style={{
                      background: `${t.borderColor}30`,
                      color: t.borderColor === "#2563eb" ? "#60a5fa" : t.borderColor === "#16a34a" ? "#4ade80" : "#22d3ee",
                    }}
                  >
                    {t.credential}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <blockquote
                className="text-sm leading-relaxed italic"
                style={{ color: "#bfdbfe" }}
              >
                &ldquo;{t.quote}&rdquo;
              </blockquote>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/home/TestimonialsSection.tsx
git commit -m "feat: add TestimonialsSection with 3 student quote cards"
```

---

## Task 9: SalariesSection

**Files:**
- Create: `src/components/home/SalariesSection.tsx`

Green-accented background. 4 salary cards. Below: Unsplash healthcare workplace photo with BLS caption overlay.

- [ ] **Step 1: Create SalariesSection.tsx**

```tsx
import Image from "next/image";

const salaries = [
  {
    career: "Medical Assistant",
    range: "$38K–$50K",
    cert: "CCMA Certified",
    icon: "🩺",
  },
  {
    career: "Phlebotomy Technician",
    range: "$36K–$52K",
    cert: "CPT Certified",
    icon: "💉",
  },
  {
    career: "EKG Technician",
    range: "$40K–$58K",
    cert: "CET Certified",
    icon: "📈",
  },
  {
    career: "Coding & Billing",
    range: "$42K–$62K",
    cert: "CBCS Certified",
    icon: "💻",
  },
];

export default function SalariesSection() {
  return (
    <section
      className="w-full py-16 px-6"
      style={{
        background: "#ecfdf5",
        borderTop: "3px solid #16a34a",
        borderBottom: "3px solid #16a34a",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-10">
          <h2
            className="text-3xl font-extrabold mb-3"
            style={{ color: "#0f2b5b" }}
          >
            Healthcare Salary Outcomes
          </h2>
          <p className="text-base max-w-xl mx-auto" style={{ color: "#475569" }}>
            NHA-certified graduates across the US report competitive starting
            salaries within months of completing their programs.
          </p>
        </div>

        {/* Salary cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 mb-8">
          {salaries.map((s) => (
            <div
              key={s.career}
              className="bg-white rounded-xl p-6 text-center shadow-sm"
              style={{ border: "1px solid #bbf7d0" }}
            >
              <div className="text-3xl mb-3">{s.icon}</div>
              <div
                className="font-bold text-base mb-1"
                style={{ color: "#0f2b5b" }}
              >
                {s.career}
              </div>
              <div
                className="text-2xl font-extrabold mb-2"
                style={{ color: "#16a34a" }}
              >
                {s.range}
              </div>
              <div
                className="text-xs font-semibold px-3 py-1 rounded-full inline-block"
                style={{ background: "#dcfce7", color: "#15803d" }}
              >
                {s.cert}
              </div>
            </div>
          ))}
        </div>

        {/* Banner image with BLS caption */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "160px", borderRadius: "12px" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1579621970590-9d624316904b?w=800&q=80"
            alt="US healthcare workplace"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div
            className="absolute inset-0 flex items-end justify-center pb-4"
            style={{ background: "rgba(22,163,74,0.25)" }}
          >
            <p
              className="text-[11px] font-medium px-4 py-1.5 rounded-full"
              style={{ background: "rgba(0,0,0,0.55)", color: "#d1fae5" }}
            >
              Data sourced from U.S. Bureau of Labor Statistics, Indeed &amp; Glassdoor — 2025 national averages
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/home/SalariesSection.tsx
git commit -m "feat: add SalariesSection with 4 salary cards and BLS caption"
```

---

## Task 10: CtaBanner

**Files:**
- Create: `src/components/home/CtaBanner.tsx`

Dark navy gradient with hospital corridor background image at 15% opacity. H2, subtext, two CTA buttons.

- [ ] **Step 1: Create CtaBanner.tsx**

```tsx
import Image from "next/image";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section
      className="relative w-full py-20 px-6 overflow-hidden text-center"
      style={{
        background: "linear-gradient(135deg, #1e3a8a, #0f2b5b)",
      }}
    >
      {/* Background image at low opacity */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=1400&q=80"
          alt=""
          fill
          className="object-cover"
          style={{ opacity: 0.15 }}
          sizes="100vw"
        />
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-3xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-extrabold text-white mb-4">
          Ready to Start Your Healthcare Career?
        </h2>
        <p className="text-base md:text-lg mb-8" style={{ color: "#bfdbfe" }}>
          Join thousands of students already on their path to NHA certification
          and a rewarding career.
        </p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link
            href="/courses"
            className="bg-blue-600 text-white font-semibold px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Browse All Programs →
          </Link>
          <Link
            href="/#contact"
            className="font-semibold px-8 py-3 rounded-lg transition-colors text-sm"
            style={{
              border: "2px solid rgba(255,255,255,0.5)",
              color: "white",
            }}
          >
            Contact Admissions
          </Link>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/components/home/CtaBanner.tsx
git commit -m "feat: add CtaBanner with gradient bg and hospital corridor photo"
```

---

## Task 11: Assemble page.tsx

**Files:**
- Modify: `src/app/page.tsx`

Replace the minimal placeholder with the composition of all 8 landing page sections in order.

- [ ] **Step 1: Replace src/app/page.tsx**

```tsx
import HeroSection from "@/components/home/HeroSection";
import StatsBar from "@/components/home/StatsBar";
import ProgramsSection from "@/components/home/ProgramsSection";
import PathwaySection from "@/components/home/PathwaySection";
import WhySection from "@/components/home/WhySection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import SalariesSection from "@/components/home/SalariesSection";
import CtaBanner from "@/components/home/CtaBanner";

export default function Home() {
  return (
    <main>
      <HeroSection />
      <StatsBar />
      <ProgramsSection />
      <PathwaySection />
      <WhySection />
      <TestimonialsSection />
      <SalariesSection />
      <CtaBanner />
    </main>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles cleanly**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: compose landing page from institutional sections"
```

---

## Task 12: Final QA & Verification

**Files:** (none created — visual review only)

- [ ] **Step 1: Run the development server**

```bash
npm run dev
```

Open `http://localhost:3000` (or the configured port).

- [ ] **Step 2: Visual checklist**

Check each section renders correctly:
- [ ] Navbar: dark navy (#0f2b5b), shield logo, "Enroll Now →" button visible
- [ ] Hero: gradient background, healthcare photo on right (desktop), hidden on mobile
- [ ] Stats bar: dark blue (#1e3a8a), 5 stats with dividers
- [ ] Programs: light gray (#f8fafc), 8 cards in 4-col grid
- [ ] Pathway: 4 numbered steps, "Get Hired" in green, team photo banner
- [ ] Why: light blue (#f0f7ff), 6 cards, accent photo on right (desktop)
- [ ] Testimonials: dark navy (#0f2b5b), 3 cards with avatars and colored borders
- [ ] Salaries: green background, 4 salary cards, BLS caption photo
- [ ] CTA banner: dark navy gradient with background photo, 2 buttons

- [ ] **Step 3: Mobile check**

Resize browser to ~375px width and verify:
- Hero image is hidden on mobile
- Program cards are 2-col
- Testimonial cards are 1-col
- Nav links are hidden (burger menu not required by spec)

- [ ] **Step 4: TypeScript final check**

Run: `npx tsc --noEmit`

Expected: no errors

- [ ] **Step 5: Final commit**

```bash
git add -A
git commit -m "feat: complete institutional landing page redesign

- Shield & Cross SVG logo
- Institutional navbar with Enroll Now CTA
- Hero with gradient and healthcare photo
- Stats bar, programs grid, pathway steps
- Why section, testimonials, salary outcomes
- Final CTA banner
- Unsplash remotePattern configured"
```

---

## Spec Coverage Check

| Spec Requirement | Task |
|-----------------|------|
| Shield & Cross SVG → `public/logo.svg` | Task 1 |
| `images.unsplash.com` remotePattern | Task 1 |
| Navbar: shield logo, #0f2b5b bg, 64px height, Enroll Now | Task 2 |
| Hero: gradient, right-side Unsplash photo, badge, H1, CTAs, trust row | Task 3 |
| Hero: image hidden on mobile | Task 3 |
| Hero image uses `priority` prop | Task 3 |
| Stats bar: 5 stats, #1e3a8a bg | Task 4 |
| Programs: 8 cards, 4-col grid, colored top borders, card images | Task 5 |
| Pathway: 4 steps, connecting lines, "Get Hired" in green, team photo | Task 6 |
| Why: 6 cards, #f0f7ff bg, accent photo desktop-only | Task 7 |
| Testimonials: 3 cards, avatars, colored borders, #0f2b5b bg | Task 8 |
| Salaries: 4 cards, green bg, BLS photo with caption | Task 9 |
| CTA banner: gradient, background photo at 0.15 opacity, 2 CTAs | Task 10 |
| page.tsx composes all sections | Task 11 |
| Responsive (4→2→1 col), mobile-friendly | All tasks |
| No new dependencies | All tasks |
| Existing routes preserved | Not modified |
