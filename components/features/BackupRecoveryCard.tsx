'use client';

import FeatureCard from '../ui/FeatureCard';

export default function BackupRecoveryCard() {
  return (
    <FeatureCard
      title="Secure Backup & Recovery"
      description="Keep your passwords safe with encrypted backups and secure recovery options, all while maintaining zero-knowledge principles."
      icon={<span className="text-5xl">💾</span>}
      features={[
        'End-to-end encrypted backups',
        'Secure key recovery with Windows Hello',
        'Multi-device synchronization',
        'Versioned backup history',
        'Offline backup support'
      ]}
    />
  );
}
