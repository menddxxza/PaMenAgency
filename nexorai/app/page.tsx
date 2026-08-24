import { LandingNav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { DemoFlow } from '@/components/landing/demo-flow';
import { Calculator } from '@/components/landing/calculator';
import { AgentsPreview } from '@/components/landing/agents-preview';
import { PricingSection } from '@/components/landing/pricing-section';
import { Footer } from '@/components/landing/footer';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-bg">
      <LandingNav />
      <main>
        <Hero />
        <DemoFlow />
        <Calculator />
        <AgentsPreview />
        <PricingSection />
      </main>
      <Footer />
    </div>
  );
}
