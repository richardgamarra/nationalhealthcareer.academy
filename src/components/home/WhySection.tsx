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
      className="w-full py-12 sm:py-16 px-4 sm:px-6"
      style={{ background: "#f0f7ff" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Heading row */}
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6 mb-8 sm:mb-10">
          <div className="md:max-w-xl">
            <h2
              className="text-2xl sm:text-3xl font-extrabold mb-3"
              style={{ color: "#0f2b5b" }}
            >
              Why NHA Academy?
            </h2>
            <p className="text-sm sm:text-base" style={{ color: "#475569" }}>
              We built this academy for working adults who need flexibility,
              affordability, and real results — in both English and Spanish.
            </p>
          </div>

          {/* Accent image — desktop only */}
          <div
            className="hidden md:block shrink-0 overflow-hidden rounded-xl"
            style={{ width: "280px", height: "200px" }}
          >
            <Image
              src="https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=600&q=80"
              alt="Student studying online with a laptop"
              width={280}
              height={200}
              className="object-cover w-full h-full"
            />
          </div>
        </div>

        {/* Card grid — 1-col mobile, 2-col sm, 3-col desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-5">
          {cards.map((card) => (
            <div
              key={card.title}
              className="bg-white rounded-xl p-5 sm:p-6 shadow-sm hover:shadow-md transition-shadow"
              style={{ border: "1px solid #dbeafe" }}
            >
              <div className="text-2xl sm:text-3xl mb-3">{card.icon}</div>
              <h3
                className="font-bold text-sm sm:text-base mb-2"
                style={{ color: "#0f2b5b" }}
              >
                {card.title}
              </h3>
              <p
                className="text-xs sm:text-sm leading-relaxed"
                style={{ color: "#475569" }}
              >
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
