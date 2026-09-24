import { LandingNav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { ComparisonClock } from '@/components/landing/comparison-clock';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { PricingSection } from '@/components/landing/pricing-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <ComparisonClock />
        <Features />
        <HowItWorks />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
