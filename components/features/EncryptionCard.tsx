'use client';

import FeatureCard from '../ui/FeatureCard';

export default function EncryptionCard() {
  return (
    <FeatureCard
      title="Military-Grade Encryption"
      description="State-of-the-art encryption using AES-256-GCM, ensuring your passwords remain secure against even the most sophisticated attacks."
      icon={<span className="text-5xl">🛡️</span>}
      features={[
        'AES-256-GCM authenticated encryption',
        'Argon2id key derivation with high security parameters',
        'Unique salt generation for each encryption',
        'Perfect forward secrecy',
        'Quantum-resistant key lengths'
      ]}
    />
  );
}
