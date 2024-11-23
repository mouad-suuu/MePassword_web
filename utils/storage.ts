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

export async function readStorage(): Promise<Storage> {
  try {
    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?key=storage`,
      {
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to read from Edge Config");
    }

    const { value } = await response.json();
    return value || defaultStorage;
  } catch (error) {
    console.error("Failed to read from Edge Config:", error);
    return defaultStorage;
  }
}

export async function writeStorage(data: Storage): Promise<void> {
  try {
    if (!process.env.EDGE_CONFIG_ID || !process.env.VERCEL_TOKEN) {
      throw new Error("Missing required environment variables");
    }

    console.log("Writing to Edge Config:", {
      url: `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      token: process.env.VERCEL_TOKEN?.slice(0, 5) + "...",
      data: data,
    });

    const response = await fetch(
      `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
      {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          items: [{ key: "storage", value: data }],
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to write to Edge Config: ${response.status} ${errorText}`
      );
    }
  } catch (error) {
    console.error("Failed to write to Edge Config:", error);
    throw error;
  }
}
