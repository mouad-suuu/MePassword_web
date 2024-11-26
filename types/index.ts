export interface APISettingsPayload {
  publicKey: string;
  password: string;
  deviceId: string;
  timestamp: number;
}

export interface SymmetricKeys {
  key: string;
  algorithm: "AES-GCM";
  length: 256;
  iv: string;
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

export interface AuditLog {
  id: string;
  timestamp: number;
  action:
    | "create"
    | "read"
    | "update"
    | "delete"
    | "share"
    | "login"
    | "logout";
  userId: string;
  resourceType: "password" | "team" | "vault" | "key";
  resourceId: string;
  metadata: {
    ip: string;
    userAgent: string;
    location?: string;
    success: boolean;
    failureReason?: string;
  };
}
