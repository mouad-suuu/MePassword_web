'use client';

import FeatureCard from '../ui/FeatureCard';
import { Lock, Server, Key, ShieldAlert, UserX } from 'lucide-react';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function ZeroKnowledgeCard() {
  return (
    <FeatureCard
      title="Zero-Knowledge Architecture"
      description="True zero-knowledge security where even we can't access your passwords. Your data remains encrypted with keys that only you control through Clerk authentication and local device security."
      icon={
        <motion.div
          className="flex items-start justify-left"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <div className="relative w-16 h-16">
            <Image
              src="/icons/data-encryption.svg"
              alt="Data Encryption"
              fill
              className="text-primary"
            />
          </div>
        </motion.div>
      }
      features={[
        {
          text: 'Multi-layer encryption with Clerk authentication',
          icon: <Lock className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Encrypted keys stored only on your device',
          icon: <Key className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Servers store only encrypted data',
          icon: <Server className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Protected against server breaches',
          icon: <ShieldAlert className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'No backdoors or password recovery',
          icon: <UserX className="w-5 h-5 inline-block mr-2 text-primary" />
        }
      ]}
    />
  );
}
