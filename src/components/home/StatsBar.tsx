const stats = [
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        {/* Mobile: 2-col grid. Desktop: single row with dividers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-4 gap-4 md:gap-0">
          {stats.map((stat, i) => (
            <div
              key={stat.label}
              className="flex items-center justify-center md:justify-start"
            >
              {/* Vertical divider — between items on desktop only */}
              {i > 0 && (
                <div
                  className="hidden md:block w-px h-10 mr-6"
                  style={{ background: "rgba(96,165,250,0.25)" }}
                  aria-hidden="true"
                />
              )}
              <div className="text-center md:text-left">
                <div
                  className="text-xl sm:text-2xl font-extrabold leading-none"
                  style={{ color: "#ffffff" }}
                >
                  {stat.value}
                </div>
                <div
                  className="text-[10px] sm:text-xs font-medium mt-1 leading-tight"
                  style={{ color: "#93c5fd" }}
                >
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
