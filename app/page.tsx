import { Navbar } from "@/components/landing/navbar";
import { Hero } from "@/components/landing/hero";
import { Features } from "@/components/landing/features";
import { Platforms } from "@/components/landing/platforms";
import { HowItWorks } from "@/components/landing/how-it-works";
import { Scale } from "@/components/landing/scale";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <Hero />
      <Features />
      <Platforms />
      <HowItWorks />
      <Scale />
      <Footer />
    </main>
  );
}
