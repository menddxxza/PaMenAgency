import { LandingNav } from '@/components/landing/nav';
import { Journey } from '@/components/landing/journey';
import { Footer } from '@/components/landing/footer';
import { CustomCursor } from '@/components/landing/custom-cursor';
import { SmoothScroll } from '@/components/landing/smooth-scroll';
import { ScrollToTop } from '@/components/landing/scroll-to-top';

export default function LandingPage() {
  return (
    <div className="bg-void min-h-screen">
      <SmoothScroll />
      <CustomCursor />
      <LandingNav />
      <main>
        <Journey />
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
}
