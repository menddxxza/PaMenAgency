import { LandingNav } from '@/components/landing/nav';
import { Hero } from '@/components/landing/hero';
import { Sectors } from '@/components/landing/sectors';
import { Features } from '@/components/landing/features';
import { HowItWorks } from '@/components/landing/how-it-works';
import { PricingSection } from '@/components/landing/pricing-section';
import { Footer } from '@/components/landing/footer';
import { InstallDrawer } from '@/components/landing/install-drawer';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <LandingNav />
      <main className="flex-1">
        <Hero />
        <Sectors />
        <Features />
        <HowItWorks />
        <PricingSection />
      </main>
      <Footer />
      <InstallDrawer />
    </div>
  );
}
