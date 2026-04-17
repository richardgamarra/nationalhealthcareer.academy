import Image from "next/image";
import Link from "next/link";

const programs = [
  {
    title: "Medical Assistant",
    cert: "CCMA Prep",
    borderColor: "#2563eb",
    tag: "Most Popular",
    tagColor: "#2563eb",
    image:
      "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=120&q=80",
    imageAlt: "Medical assistant professional",
  },
  {
    title: "Phlebotomy Technician",
    cert: "CPT Prep",
    borderColor: "#0891b2",
    tag: "High Demand",
    tagColor: "#0891b2",
    image:
      "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=120&q=80",
    imageAlt: "Phlebotomy technician",
  },
  {
    title: "EKG Technician",
    cert: "CET Prep",
    borderColor: "#dc2626",
    tag: "Growing Field",
    tagColor: "#dc2626",
    image:
      "https://images.unsplash.com/photo-1516069677018-378515003435?w=120&q=80",
    imageAlt: "EKG heart monitor",
  },
  {
    title: "Medical Coding & Billing",
    cert: "CBCS Prep",
    borderColor: "#16a34a",
    tag: "Remote-Friendly",
    tagColor: "#16a34a",
    image:
      "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=120&q=80",
    imageAlt: "Medical coding on computer",
  },
  {
    title: "Anatomy & Physiology",
    cert: "Foundation",
    borderColor: "#7c3aed",
    tag: "Core Prerequisite",
    tagColor: "#7c3aed",
    image:
      "https://images.unsplash.com/photo-1530026405186-ed1f139313f3?w=120&q=80",
    imageAlt: "Anatomy study material",
  },
  {
    title: "Medical Law & Ethics",
    cert: "HIPAA · Rights",
    borderColor: "#ca8a04",
    tag: "Required for MA",
    tagColor: "#ca8a04",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=120&q=80",
    imageAlt: "Legal books and gavel",
  },
  {
    title: "Intro to Healthcare",
    cert: "Start here",
    borderColor: "#334155",
    tag: "First Lesson Free",
    tagColor: "#334155",
    image:
      "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?w=120&q=80",
    imageAlt: "Healthcare introduction",
  },
  {
    title: "Medical Insurance",
    cert: "CMAA Prep",
    borderColor: "#db2777",
    tag: "Office-Focused",
    tagColor: "#db2777",
    image:
      "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=120&q=80",
    imageAlt: "Medical insurance paperwork",
  },
];

export default function ProgramsSection() {
  return (
    <section className="w-full py-12 sm:py-16 px-4 sm:px-6" style={{ background: "#f8fafc" }}>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-3"
            style={{ color: "#0f2b5b" }}
          >
            NHA Certification Programs
          </h2>
          <p
            className="text-sm sm:text-base max-w-xl mx-auto"
            style={{ color: "#475569" }}
          >
            Choose from 8 nationally recognized career tracks — all fully online,
            bilingual, and designed around the official NHA exam competencies.
          </p>
        </div>

        {/* 4-col grid on desktop, 2-col on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {programs.map((p) => (
            <Link
              key={p.title}
              href="/courses"
              className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col"
              style={{ borderTop: `4px solid ${p.borderColor}` }}
            >
              {/* Tag + thumbnail */}
              <div className="flex items-center justify-between px-3 sm:px-4 pt-3 sm:pt-4 pb-2">
                <span
                  className="text-[9px] sm:text-[10px] font-semibold px-1.5 sm:px-2 py-0.5 rounded-full leading-tight"
                  style={{
                    background: `${p.tagColor}18`,
                    color: p.tagColor,
                  }}
                >
                  ● {p.tag}
                </span>
                <div className="relative w-10 h-10 sm:w-12 sm:h-12 shrink-0 ml-1">
                  <Image
                    src={p.image}
                    alt={p.imageAlt}
                    fill
                    className="rounded-full object-cover"
                    sizes="48px"
                  />
                </div>
              </div>

              {/* Body */}
              <div className="px-3 sm:px-4 pb-3 sm:pb-4">
                <h3
                  className="font-bold text-xs sm:text-sm leading-tight mb-1"
                  style={{ color: "#0f2b5b" }}
                >
                  {p.title}
                </h3>
                <p className="text-[10px] sm:text-[11px]" style={{ color: "#64748b" }}>
                  {p.cert}
                </p>
              </div>
            </Link>
          ))}
        </div>

        {/* View all */}
        <div className="text-center">
          <Link
            href="/courses"
            className="inline-block font-semibold text-sm px-6 py-2.5 rounded-lg transition-colors hover:bg-blue-50"
            style={{ border: "2px solid #2563eb", color: "#2563eb" }}
          >
            View All Programs →
          </Link>
        </div>
      </div>
    </section>
  );
}
