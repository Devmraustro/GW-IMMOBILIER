import { Hero } from '@/components/home/hero';
import { FeaturedProperties, FeaturedCars } from '@/components/home/featured-sections';
import { ServicesSection } from '@/components/home/services-section';
import { WhyUs } from '@/components/home/why-us';
import { AreasSection } from '@/components/home/areas-section';
import { WhatsAppCta } from '@/components/home/whatsapp-cta';

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProperties />
      <FeaturedCars />
      <ServicesSection />
      <WhyUs />
      <AreasSection />
      <WhatsAppCta />
    </>
  );
}
