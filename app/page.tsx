'use client';

import { TopNav } from '../components/navigation/TopNav';
import { HeroSection } from '../components/sections/HeroSection';
import { AboutSection } from '../components/sections/AboutSection';
import FeaturesSection  from '../components/sections/FeaturesSection';
import { SecuritySection } from '../components/sections/SecuritySection';
import { OpenSourceSection } from '../components/sections/OpenSourceSection';
import { Footer } from '../components/sections/Footer';
import { CyberPattern } from '../components/ui/CyberPattern';

export default function Home() {
  return (
    <div className="min-h-screen relative">
      {/* Background layers */}
      <div className="fixed inset-0 bg-gradient-to-r from-white via-white to-white/90 dark:from-gray-900 dark:via-gray-900 dark:to-gray-900/90" />
      <div className="fixed inset-0 bg-gradient-to-r from-transparent via-blue-500/10 to-purple-600/30" />
      <CyberPattern />

      {/* Content */}
      <div className="relative flex flex-col min-h-screen">
        <TopNav />
        <main className="flex-grow">
          <HeroSection />
          <AboutSection />
          <FeaturesSection />
          <SecuritySection />
          <OpenSourceSection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
