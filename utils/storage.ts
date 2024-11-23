import { promises as fs } from "fs";
import path from "path";
import { AuditLog, EncryptedPassword, APISettingsPayload } from "../types";

interface Storage {
  passwords: EncryptedPassword[];
  keys: EncryptedPassword[];
  auditLogs: AuditLog[];
  settings: APISettingsPayload;
}

const STORAGE_PATH = path.join(process.cwd(), "data", "storage.json");

async function ensureStorageExists() {
  try {
    await fs.mkdir(path.join(process.cwd(), "data"), { recursive: true });
    try {
      await fs.access(STORAGE_PATH);
    } catch {
      await fs.writeFile(
        STORAGE_PATH,
        JSON.stringify({
          passwords: [],
          keys: [],
          auditLogs: [],
          settings: null,
        })
      );
    }
  } catch (error) {
    console.error("Failed to initialize storage:", error);
    throw error;
  }
}

export async function readStorage(): Promise<Storage> {
  await ensureStorageExists();
  const data = await fs.readFile(STORAGE_PATH, "utf-8");
  return JSON.parse(data);
}

export async function writeStorage(data: Storage): Promise<void> {
  await ensureStorageExists();
  await fs.writeFile(STORAGE_PATH, JSON.stringify(data, null, 2));
}
