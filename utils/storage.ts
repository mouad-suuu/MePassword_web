// // utils/storage.ts

// import { AuditLog, EncryptedPassword, APISettingsPayload } from "../types";

// // Separate functions for each type of data
// export async function readPasswords(): Promise<EncryptedPassword[]> {
//   try {
//     const response = await fetch(
//       `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?key=passwords`,
//       createFetchOptions()
//     );

//     if (!response.ok) {
//       throw new Error("Failed to read passwords from Edge Config");
//     }

//     const items = await response.json();
//     const passwordsItem = items.find(
//       (item: { key: string; value: unknown }) => item.key === "passwords"
//     );

//     return passwordsItem?.value ?? [];
//   } catch (error) {
//     console.error("Failed to read passwords:", error);
//     return [];
//   }
// }

// export async function writePasswords(
//   passwords: EncryptedPassword[]
// ): Promise<void> {
//   try {
//     if (!process.env.EDGE_CONFIG_ID || !process.env.VERCEL_TOKEN) {
//       throw new Error("Missing required environment variables");
//     }

//     const response = await fetch(
//       `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
//       createFetchOptions("PATCH", {
//         items: [
//           {
//             operation: "upsert",
//             key: "passwords",
//             value: passwords,
//           },
//         ],
//       })
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(
//         `Failed to write passwords: ${response.status} ${errorText}`
//       );
//     }
//   } catch (error) {
//     console.error("Failed to write passwords:", error);
//     throw error;
//   }
// }

// export async function readKeys(): Promise<EncryptedPassword[]> {
//   try {
//     const response = await fetch(
//       `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?key=keys`,
//       createFetchOptions()
//     );

//     if (!response.ok) {
//       throw new Error("Failed to read keys from Edge Config");
//     }

//     const items = await response.json();
//     const keysItem = items.find(
//       (item: { key: string; value: unknown }) => item.key === "keys"
//     );

//     return keysItem?.value ?? [];
//   } catch (error) {
//     console.error("Failed to read keys:", error);
//     return [];
//   }
// }

// export async function writeKeys(keys: EncryptedPassword[]): Promise<void> {
//   try {
//     if (!process.env.EDGE_CONFIG_ID || !process.env.VERCEL_TOKEN) {
//       throw new Error("Missing required environment variables");
//     }

//     const response = await fetch(
//       `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
//       createFetchOptions("PATCH", {
//         items: [
//           {
//             operation: "upsert",
//             key: "keys",
//             value: keys,
//           },
//         ],
//       })
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(`Failed to write keys: ${response.status} ${errorText}`);
//     }
//   } catch (error) {
//     console.error("Failed to write keys:", error);
//     throw error;
//   }
// }

// export async function readAuditLogs(): Promise<AuditLog[]> {
//   try {
//     const response = await fetch(
//       `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?key=auditLogs`,
//       createFetchOptions()
//     );

//     if (!response.ok) {
//       throw new Error("Failed to read audit logs from Edge Config");
//     }

//     const items = await response.json();
//     const logsItem = items.find(
//       (item: { key: string; value: unknown }) => item.key === "auditLogs"
//     );

//     return logsItem?.value ?? [];
//   } catch (error) {
//     console.error("Failed to read audit logs:", error);
//     return [];
//   }
// }

// export async function writeAuditLogs(logs: AuditLog[]): Promise<void> {
//   try {
//     if (!process.env.EDGE_CONFIG_ID || !process.env.VERCEL_TOKEN) {
//       throw new Error("Missing required environment variables");
//     }

//     const response = await fetch(
//       `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
//       createFetchOptions("PATCH", {
//         items: [
//           {
//             operation: "upsert",
//             key: "auditLogs",
//             value: logs,
//           },
//         ],
//       })
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(
//         `Failed to write audit logs: ${response.status} ${errorText}`
//       );
//     }
//   } catch (error) {
//     console.error("Failed to write audit logs:", error);
//     throw error;
//   }
// }

// export async function readSettings(): Promise<APISettingsPayload> {
//   try {
//     const response = await fetch(
//       `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items?key=settings`,
//       createFetchOptions()
//     );

//     if (!response.ok) {
//       throw new Error("Failed to read settings from Edge Config");
//     }

//     const items = await response.json();
//     const settingsItem = items.find(
//       (item: { key: string; value: unknown }) => item.key === "settings"
//     );

//     return settingsItem?.value ?? {};
//   } catch (error) {
//     console.error("Failed to read settings:", error);
//     return {} as APISettingsPayload;
//   }
// }

// export async function writeSettings(
//   settings: APISettingsPayload
// ): Promise<void> {
//   try {
//     if (!process.env.EDGE_CONFIG_ID || !process.env.VERCEL_TOKEN) {
//       throw new Error("Missing required environment variables");
//     }

//     const response = await fetch(
//       `https://api.vercel.com/v1/edge-config/${process.env.EDGE_CONFIG_ID}/items`,
//       createFetchOptions("PATCH", {
//         items: [
//           {
//             operation: "upsert",
//             key: "settings",
//             value: settings,
//           },
//         ],
//       })
//     );

//     if (!response.ok) {
//       const errorText = await response.text();
//       throw new Error(
//         `Failed to write settings: ${response.status} ${errorText}`
//       );
//     }
//   } catch (error) {
//     console.error("Failed to write settings:", error);
//     throw error;
//   }
// }

// // Helper to create base fetch options
// function createFetchOptions(
//   method: string = "GET",
//   body?: Record<string, unknown>
// ) {
//   const options: RequestInit = {
//     method,
//     headers: {
//       Authorization: `Bearer ${process.env.VERCEL_TOKEN}`,
//       "Content-Type": "application/json",
//     },
//   };

//   if (body) {
//     options.body = JSON.stringify(body);
//   }

//   return options;
// }
