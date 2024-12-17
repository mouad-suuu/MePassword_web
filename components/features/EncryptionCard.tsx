'use client';

import FeatureCard from '../ui/FeatureCard';
import { Shield, KeyRound, RefreshCcw, Cpu, Lock, Layers } from 'lucide-react';
import { motion } from 'framer-motion';

export default function EncryptionCard() {
  return (
    <FeatureCard
      title="Military-Grade Encryption"
      description="Hybrid RSA-4096 and AES-256-GCM encryption ensuring your passwords remain secure with both asymmetric and symmetric encryption."
      icon={
        <div className="relative w-16 h-16 flex items-center justify-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.5,
              ease: "easeOut"
            }}
          >
            <Shield className="w-16 h-16 text-primary stroke-[1.5] fill-primary/10" />
          </motion.div>
          <motion.div
            className="absolute inset-0 flex items-center justify-center"
            initial={{ scale: 1.2, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ 
              duration: 0.5,
              delay: 0.2,
              ease: "easeOut"
            }}
          >
            <Layers className="w-8 h-8 text-primary stroke-[1.5]" />
          </motion.div>
        </div>
      }
      features={[
        {
          text: 'RSA-4096 asymmetric encryption for key exchange',
          icon: <KeyRound className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'AES-256-GCM authenticated encryption for data',
          icon: <Shield className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Secure key derivation with high entropy',
          icon: <Lock className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Perfect forward secrecy with unique IVs',
          icon: <RefreshCcw className="w-5 h-5 inline-block mr-2 text-primary" />
        },
        {
          text: 'Quantum-resistant key lengths',
          icon: <Cpu className="w-5 h-5 inline-block mr-2 text-primary" />
        }
      ]}
    />
  );
}
