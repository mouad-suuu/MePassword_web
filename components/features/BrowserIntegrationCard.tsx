'use client';

import FeatureCard from '../ui/FeatureCard';
import { MousePointerClick, Clock, Lock, Scan, FormInput } from 'lucide-react';

export default function BrowserIntegrationCard() {
  return (
    <FeatureCard
      title="Seamless Browser Integration"
      description="Experience password management that works for you with smart auto-detection, quick autofill, and instant form recognition - all with a single click while maintaining security."
      icon={
        <div className="relative w-16 h-16">
          <MousePointerClick className="w-16 h-16 text-primary stroke-[1.5]" />
        </div>
      }
      features={[
        {
          text: 'Smart form detection & instant autofill',
          icon: <FormInput className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Quick access in < 1 second',
          icon: <Clock className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Auto-lock for enhanced security',
          icon: <Lock className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Automatic credential detection',
          icon: <Scan className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'One-click save & update',
          icon: <MousePointerClick className="w-5 h-5 inline-block mr-2 text-primary" />
        }
      ]}
    />
  );
}
