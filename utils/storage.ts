import { kv } from "@vercel/kv";
import { AuditLog, EncryptedPassword, APISettingsPayload } from "../types";

interface Storage {
  passwords: EncryptedPassword[];
  keys: EncryptedPassword[];
  auditLogs: AuditLog[];
  settings: APISettingsPayload;
}

const STORAGE_KEYS = {
  PASSWORDS: "passwords",
  KEYS: "keys",
  AUDIT_LOGS: "auditLogs",
  SETTINGS: "settings",
} as const;

async function ensureStorageExists() {
  try {
    // Check if storage is initialized
    const initialized = await kv.get("initialized");
    if (!initialized) {
      // Initialize storage with empty values
      await Promise.all([
        kv.set(STORAGE_KEYS.PASSWORDS, []),
        kv.set(STORAGE_KEYS.KEYS, []),
        kv.set(STORAGE_KEYS.AUDIT_LOGS, []),
        kv.set(STORAGE_KEYS.SETTINGS, null),
        kv.set("initialized", true),
      ]);
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw error;
  }
}

export async function readStorage(): Promise<Storage> {
  await ensureStorageExists();

  // Fetch all data in parallel
  const [passwords, keys, auditLogs, settings] = await Promise.all([
    kv.get<EncryptedPassword[]>(STORAGE_KEYS.PASSWORDS) || [],
    kv.get<EncryptedPassword[]>(STORAGE_KEYS.KEYS) || [],
    kv.get<AuditLog[]>(STORAGE_KEYS.AUDIT_LOGS) || [],
    kv.get<APISettingsPayload>(STORAGE_KEYS.SETTINGS),
  ]);

  return {
    passwords: passwords || [],
    keys: keys || [],
    auditLogs: auditLogs || [],
    settings: settings || ({} as APISettingsPayload),
  };
}

export async function writeStorage(data: Storage): Promise<void> {
  await ensureStorageExists();

  // Update all data in parallel
  await Promise.all([
    kv.set(STORAGE_KEYS.PASSWORDS, data.passwords),
    kv.set(STORAGE_KEYS.KEYS, data.keys),
    kv.set(STORAGE_KEYS.AUDIT_LOGS, data.auditLogs),
    kv.set(STORAGE_KEYS.SETTINGS, data.settings),
  ]);
}
