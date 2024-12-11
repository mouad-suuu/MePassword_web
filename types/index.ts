export interface APISettingsPayload {
  userId: string;
  publicKey: string;
  password: string;
  deviceId: string;
  timestamp: number;
  sessionSettings?: {
    pushNotifications: boolean;
    autoLockTime: number;
    sessionTime: number;
    lastAccessTime?: number;
    biometricVerification: boolean;
    biometricType: BiometricType;
  };
}

export interface SymmetricKeys {
  key: string;
  algorithm: "AES-GCM";
  length: 256;
  iv: string;
}
export interface Device {
  id: string;
  userId: string;
  browser: string;
  os: string;
  lastActive: Date;
  sessionActive: boolean;
}



export interface PasswordMetadata {
  id: string;
  createdAt: number;
  modifiedAt: number;
  lastAccessed: number;
  version: number;
  strength: "weak" | "medium" | "strong";
}

export interface EncryptedPassword extends PasswordMetadata {
  id: string;
  website: string;
  user: string;
  password: string;
  MetaData?: PasswordMetadata;
}

export interface Device {
  id: string;
  userId: string;
  browser: string;
  os: string;
  lastActive: Date;
  sessionActive: boolean;
}

export type BiometricType = "face" | "fingerprint" | "none";

