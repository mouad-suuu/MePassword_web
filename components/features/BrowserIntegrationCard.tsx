'use client';

import FeatureCard from '../ui/FeatureCard';

export default function BrowserIntegrationCard() {
  return (
    <FeatureCard
      title="Seamless Browser Integration"
      description="Effortlessly manage your passwords across all major browsers with our intelligent form detection and auto-fill capabilities."
      icon={<span className="text-5xl">🌐</span>}
      features={[
        'Smart form detection and auto-fill',
        'Secure browser communication',
        'Cross-browser compatibility',
        'Context-aware suggestions',
        'One-click password updates'
      ]}
    />
  );
}
