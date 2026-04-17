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
