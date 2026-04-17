import Image from "next/image";
import Link from "next/link";

const trustItems = [
  "No prior experience required",
  "Available in English & Spanish",
  "100% Online & Self-Paced",
  "NHA Exam Prep Included",
];

export default function HeroSection() {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{
        background:
          "linear-gradient(135deg, #0f2b5b 0%, #1e4d9b 55%, #1a6b9a 100%)",
        minHeight: "520px",
      }}
    >
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 flex items-center min-h-[520px]">
        {/* Left content — full width on mobile, 55% on desktop */}
        <div className="w-full md:w-[58%] z-10 pr-0 md:pr-8">
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-medium px-3 sm:px-4 py-1.5 rounded-full mb-5 sm:mb-6"
            style={{
              background: "rgba(37,99,235,0.25)",
              border: "1px solid rgba(96,165,250,0.4)",
              color: "#bfdbfe",
            }}
          >
            🎓 NHA Certification Exam Prep | English &amp; Spanish
          </div>

          {/* H1 */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold leading-tight text-white mb-4">
            Launch Your Healthcare Career
            <br />
            <span style={{ color: "#60a5fa" }}>
              in as Little as 4–6 Months
            </span>
          </h1>

          {/* Body */}
          <p
            className="text-sm sm:text-base md:text-lg mb-6 sm:mb-8 leading-relaxed max-w-lg"
            style={{ color: "#bfdbfe" }}
          >
            Online, self-paced programs designed to prepare you for nationally
            recognized NHA certifications. Join thousands of graduates now
            working in hospitals and clinics across the United States.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6 sm:mb-8">
            <Link
              href="/courses"
              className="bg-blue-600 text-white font-semibold px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm text-center"
            >
              Browse Programs →
            </Link>
            <Link
              href="/courses"
              className="font-semibold px-6 py-3 rounded-lg transition-colors text-sm text-center"
              style={{
                border: "2px solid rgba(255,255,255,0.45)",
                color: "white",
              }}
            >
              Free Info Session
            </Link>
          </div>

          {/* Trust row */}
          <ul className="flex flex-wrap gap-x-4 gap-y-2 text-xs sm:text-sm">
            {trustItems.map((item) => (
              <li
                key={item}
                className="flex items-center gap-1.5"
                style={{ color: "#93c5fd" }}
              >
                <span style={{ color: "#4ade80" }}>✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Right photo — desktop only */}
        <div
          className="hidden md:block absolute right-0 top-0 h-full"
          style={{ width: "44%" }}
          aria-hidden="true"
        >
          <Image
            src="https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=800&q=80"
            alt="Female medical professional in scrubs smiling"
            fill
            priority
            className="object-cover object-center"
            style={{
              maskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 18%, black 45%)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.5) 18%, black 45%)",
            }}
            sizes="44vw"
          />
        </div>
      </div>
    </section>
  );
}
