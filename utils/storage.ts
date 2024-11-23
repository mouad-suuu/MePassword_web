import { createClient } from "@vercel/edge-config";
import { AuditLog, EncryptedPassword, APISettingsPayload } from "../types";

interface Storage {
  passwords: EncryptedPassword[];
  keys: EncryptedPassword[];
  auditLogs: AuditLog[];
  settings: APISettingsPayload;
}

const defaultStorage: Storage = {
  passwords: [],
  keys: [],
  auditLogs: [],
  settings: {} as APISettingsPayload,
};

const client = createClient(process.env.EDGE_CONFIG);

export async function readStorage(): Promise<Storage> {
  try {
    const data = (await client.get("storage")) as Storage;
    return data || defaultStorage;
  } catch (error) {
    console.error("Failed to read from Edge Config:", error);
    return defaultStorage;
  }
}

export async function writeStorage(data: Storage): Promise<void> {
  try {
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_API_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [
            {
              operation: "upsert",
              key: "storage",
              value: data,
            },
          ],
        }),
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to write to Edge Config: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Failed to write to Edge Config:", error);
    throw error;
  }
}
