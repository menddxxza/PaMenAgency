import { LandingNav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { Sectors } from '@/components/landing/sectors';
import { ComparisonClock } from '@/components/landing/comparison-clock';
import { DemoSearch } from '@/components/landing/demo-search';
import { Features } from '@/components/landing/features';
import { UseCases } from '@/components/landing/use-cases';
import { HowItWorks } from '@/components/landing/how-it-works';
import { PricingSection } from '@/components/landing/pricing-section';
import { Faq } from '@/components/landing/faq';
import { Footer } from '@/components/landing/footer';
import { InstallDrawer } from '@/components/landing/install-drawer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <Sectors />
        <ComparisonClock />
        <DemoSearch />
        <Features />
        <UseCases />
        <HowItWorks />
        <PricingSection />
        <Faq />
      </main>
      <Footer />
      <InstallDrawer />
    </div>
  );
}
