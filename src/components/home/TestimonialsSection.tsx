import Image from "next/image";

const testimonials = [
  {
    name: "Maria G.",
    credential: "CCMA · Houston, TX",
    quote:
      "I went from zero healthcare experience to a certified Medical Assistant in 5 months. The bilingual materials made all the difference — I could study in Spanish when English got tough.",
    borderColor: "#2563eb",
    badgeBg: "#1e3a8a",
    badgeText: "#60a5fa",
    avatar:
      "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=96&q=80",
    avatarAlt: "Maria G., Medical Assistant graduate",
  },
  {
    name: "James R.",
    credential: "CET · Miami, FL",
    quote:
      "The EKG program was incredibly thorough. The practice quizzes are almost exactly like the real CET exam. I passed on my first attempt and had a job offer within 3 weeks.",
    borderColor: "#16a34a",
    badgeBg: "#14532d",
    badgeText: "#4ade80",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=96&q=80",
    avatarAlt: "James R., EKG Technician graduate",
  },
  {
    name: "Carmen V.",
    credential: "CPT · Orlando, FL",
    quote:
      "As a single mother working full-time, self-paced learning was the only option for me. NHA Academy made it possible. I'm now a Certified Phlebotomy Technician earning $22/hr.",
    borderColor: "#0891b2",
    badgeBg: "#164e63",
    badgeText: "#22d3ee",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=96&q=80",
    avatarAlt: "Carmen V., Phlebotomy Technician graduate",
  },
];

export default function TestimonialsSection() {
  return (
    <section
      className="w-full py-12 sm:py-16 px-4 sm:px-6"
      style={{ background: "#0f2b5b" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mb-3">
            Student Success Stories
          </h2>
          <p
            className="text-sm sm:text-base max-w-xl mx-auto"
            style={{ color: "#93c5fd" }}
          >
            Real graduates. Real careers. Real results across the United States.
          </p>
        </div>

        {/* 1-col mobile, 3-col desktop */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="rounded-xl p-5 sm:p-6 flex flex-col gap-4"
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(96,165,250,0.15)",
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
                    style={{ background: t.badgeBg, color: t.badgeText }}
                  >
                    {t.credential}
                  </span>
                </div>
              </div>

              {/* Quote */}
              <blockquote
                className="text-xs sm:text-sm leading-relaxed italic"
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
