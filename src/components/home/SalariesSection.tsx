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
      className="w-full py-12 sm:py-16 px-4 sm:px-6"
      style={{
        background: "#ecfdf5",
        borderTop: "3px solid #16a34a",
        borderBottom: "3px solid #16a34a",
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-3"
            style={{ color: "#0f2b5b" }}
          >
            Healthcare Salary Outcomes
          </h2>
          <p
            className="text-sm sm:text-base max-w-xl mx-auto"
            style={{ color: "#475569" }}
          >
            NHA-certified graduates across the US report competitive starting
            salaries within months of completing their programs.
          </p>
        </div>

        {/* 1-col mobile, 2-col sm, 4-col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5 mb-6 sm:mb-8">
          {salaries.map((s) => (
            <div
              key={s.career}
              className="bg-white rounded-xl p-5 sm:p-6 text-center shadow-sm"
              style={{ border: "1px solid #bbf7d0" }}
            >
              <div className="text-3xl mb-3">{s.icon}</div>
              <div
                className="font-bold text-sm sm:text-base mb-1"
                style={{ color: "#0f2b5b" }}
              >
                {s.career}
              </div>
              <div
                className="text-xl sm:text-2xl font-extrabold mb-3"
                style={{ color: "#16a34a" }}
              >
                {s.range}
              </div>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full"
                style={{ background: "#dcfce7", color: "#15803d" }}
              >
                {s.cert}
              </span>
            </div>
          ))}
        </div>

        {/* BLS banner image */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "140px", borderRadius: "12px" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1579621970590-9d624316904b?w=800&q=80"
            alt="US healthcare workplace"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div
            className="absolute inset-0 flex items-end justify-center pb-3 sm:pb-4"
            style={{ background: "rgba(22,163,74,0.22)" }}
          >
            <p
              className="text-[10px] sm:text-[11px] font-medium px-3 sm:px-4 py-1.5 rounded-full text-center max-w-sm sm:max-w-none"
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
