'use client';

import FeatureCard from '../ui/FeatureCard';

export default function PasswordGenCard() {
  return (
    <FeatureCard
      title="Advanced Password Generation"
      description="Generate cryptographically secure passwords that meet any requirement, with smart algorithms for maximum compatibility."
      icon={<span className="text-5xl">🎲</span>}
      features={[
        'True random number generation (CSPRNG)',
        'Customizable length and character sets',
        'Smart character distribution',
        'Password strength meter',
        'Site-specific generation rules'
      ]}
    />
  );
}
