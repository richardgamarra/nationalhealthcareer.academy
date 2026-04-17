import Image from "next/image";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section
      className="relative w-full py-16 sm:py-20 px-4 sm:px-6 overflow-hidden text-center"
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
        <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-white mb-4 leading-tight">
          Ready to Start Your Healthcare Career?
        </h2>
        <p
          className="text-sm sm:text-base md:text-lg mb-7 sm:mb-8"
          style={{ color: "#bfdbfe" }}
        >
          Join thousands of students already on their path to NHA certification
          and a rewarding career.
        </p>
        <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4">
          <Link
            href="/courses"
            className="bg-blue-600 text-white font-semibold px-7 sm:px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            Browse All Programs →
          </Link>
          <Link
            href="/#contact"
            className="font-semibold px-7 sm:px-8 py-3 rounded-lg transition-colors text-sm"
            style={{
              border: "2px solid rgba(255,255,255,0.45)",
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
