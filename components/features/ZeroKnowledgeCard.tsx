'use client';

import FeatureCard from '../ui/FeatureCard';

export default function ZeroKnowledgeCard() {
  return (
    <FeatureCard
      title="Zero-Knowledge Architecture"
      description="Complete privacy with a true zero-knowledge system. Your data never leaves your device unencrypted, and only you hold the keys."
      icon={<span className="text-5xl">🔒</span>}
      features={[
        'Client-side encryption only - data never leaves your device unencrypted',
        'No server storage of sensitive information',
        'Encryption keys remain solely on your device',
        'No password recovery - you maintain full control',
        'Immune to server-side breaches'
      ]}
    />
  );
}
