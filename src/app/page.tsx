import React from 'react';
import { Hero } from '@/components/landing/Hero';
import { PhilosophySection } from '@/components/landing/PhilosophySection';
import { TrustSection } from '@/components/landing/TrustSection';

export default function HomePage() {
  return (
    <div className="flex-1 flex flex-col">
      <Hero />
      <PhilosophySection />
      <TrustSection />
    </div>
  );
}
