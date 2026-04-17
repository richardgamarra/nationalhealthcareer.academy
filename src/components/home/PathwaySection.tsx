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
      className="w-full py-12 sm:py-16 px-4 sm:px-6"
      style={{ background: "#ffffff", borderTop: "1px solid #e2e8f0" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-10">
          <h2
            className="text-2xl sm:text-3xl font-extrabold mb-3"
            style={{ color: "#0f2b5b" }}
          >
            Your Path to Certification
          </h2>
          <p
            className="text-sm sm:text-base max-w-xl mx-auto"
            style={{ color: "#475569" }}
          >
            Four steps stand between you and a rewarding healthcare career. We
            guide you through every one.
          </p>
        </div>

        {/* Steps — vertical stack on mobile, horizontal row on desktop */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 sm:gap-0 mb-8 sm:mb-10">
          {steps.map((step, i) => (
            <div
              key={step.number}
              className="flex sm:flex-col items-center sm:items-center gap-4 sm:gap-3 flex-1 relative w-full sm:w-auto"
            >
              {/* Connecting line between steps — desktop only */}
              {i < steps.length - 1 && (
                <div
                  className="hidden sm:block absolute left-1/2 top-7 w-full h-0.5 z-0 pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(to right, #2563eb40, #bfdbfe)",
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
              <div className="sm:text-center">
                <div
                  className="font-bold text-sm sm:text-base leading-tight"
                  style={{
                    color: step.color === "#16a34a" ? "#16a34a" : "#0f2b5b",
                  }}
                >
                  {step.title}
                </div>
                <div
                  className="text-xs sm:text-sm mt-0.5"
                  style={{ color: "#64748b" }}
                >
                  {step.description}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Team photo banner */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "180px", borderRadius: "12px" }}
        >
          <Image
            src="https://images.unsplash.com/photo-1551076805-e1869033e561?w=1200&q=80"
            alt="Diverse professional medical team"
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 100vw, 1280px"
          />
          <div
            className="absolute inset-0 flex items-center px-6 sm:px-10"
            style={{
              background:
                "linear-gradient(to right, rgba(15,43,91,0.75), rgba(15,43,91,0.3))",
            }}
          >
            <p className="text-white font-semibold text-lg sm:text-xl md:text-2xl max-w-md">
              Your future starts with a single step.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center mt-6 sm:mt-8">
          <Link
            href="/courses"
            className="inline-block bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Start Your Journey →
          </Link>
        </div>
      </div>
    </section>
  );
}
