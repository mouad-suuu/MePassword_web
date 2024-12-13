'use client';

import FeatureCard from '../ui/FeatureCard';

export default function WindowsHelloCard() {
  return (
    <FeatureCard
      title="Windows Hello Integration"
      description="Secure your encryption keys with Windows Hello's advanced biometric authentication, leveraging your device's TPM for maximum security."
      icon={<span className="text-5xl">🔐</span>}
      features={[
        'Hardware-backed security using Windows TPM 2.0',
        'Seamless biometric authentication (fingerprint/facial recognition)',
        'Secure key storage in Windows Credential Manager',
        'Zero-knowledge encryption of master keys',
        'Automatic key unlocking with biometrics'
      ]}
    />
  );
}
