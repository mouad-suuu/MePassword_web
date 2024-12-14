'use client';

import FeatureCard from '../ui/FeatureCard';
import { Fingerprint, Shield, Key, Scan, Lock } from 'lucide-react';
import { motion } from 'framer-motion';

export default function WindowsHelloCard() {
  return (
    <FeatureCard
      title="Windows Hello Integration"
      description="Secure your encryption keys with Windows Hello's advanced biometric authentication, leveraging your device's TPM for maximum security."
      icon={
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Fingerprint className="w-16 h-16 text-primary stroke-[1.5]" />
          </motion.div>
        </div>
      }
      features={[
        {
          text: 'Hardware-backed security using Windows TPM 2.0',
          icon: <Shield className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Seamless biometric authentication',
          icon: <Scan className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Secure key storage in Windows Credential Manager',
          icon: <Key className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Zero-knowledge encryption of master keys',
          icon: <Lock className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Automatic key unlocking with biometrics',
          icon: <Fingerprint className="w-5 h-5 inline-block mr-2 text-primary" />
        }
      ]}
    />
  );
}
