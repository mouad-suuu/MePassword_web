'use client';

import FeatureCard from '../ui/FeatureCard';
import { KeySquare, Shield, Binary, Fingerprint, Braces } from 'lucide-react';

export default function PasswordGenCard() {
  return (
    <FeatureCard
      title="Advanced Key & Password Security"
      description="Generate and manage cryptographically secure keys and passwords using industry-standard algorithms and secure storage practices."
      icon={
        <div className="relative w-16 h-16">
          <Binary className="w-16 h-16 text-primary stroke-[1.5]" />
        </div>
      }
      features={[
        {
          text: 'RSA-4096 for key generation',
          icon: <KeySquare className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Local secure key storage with TPM',
          icon: <Shield className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Hardware-backed encryption',
          icon: <Fingerprint className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Quantum-resistant key lengths',
          icon: <Binary className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Customizable password rules',
          icon: <Braces className="w-5 h-5 inline-block mr-2 text-primary" />
        }
      ]}
    />
  );
}
