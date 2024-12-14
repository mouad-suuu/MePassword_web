'use client';

import FeatureCard from '../ui/FeatureCard';
import { CloudOff, FileKey, HardDrive, KeyRound, Shield } from 'lucide-react';

export default function BackupRecoveryCard() {
  return (
    <FeatureCard
      title="Secure Backup & Recovery"
      description="Keep your passwords safe with encrypted local backups. Your data never leaves your device unencrypted, ensuring complete privacy even during backup and recovery."
      icon={
        <div className="relative w-16 h-16">
          <FileKey className="w-16 h-16 text-primary stroke-[1.5]" />
        </div>
      }
      features={[
        {
          text: 'End-to-end encrypted backups',
          icon: <Shield className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Offline-first backup storage',
          icon: <CloudOff className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Local device recovery keys',
          icon: <KeyRound className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Multiple backup locations',
          icon: <HardDrive className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Secure key restoration',
          icon: <FileKey className="w-5 h-5 inline-block mr-2 text-primary" />
        }
      ]}
    />
  );
}
