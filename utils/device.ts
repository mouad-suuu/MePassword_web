import { sql } from "@vercel/postgres";
import { Device } from "../types";

export async function upsertDevice(
  userId: string,
  browser: string,
  os: string
): Promise<Device> {
  const result = await sql`
    INSERT INTO devices (
      id,
      user_id,
      browser,
      os,
      last_active,
      session_active
    )
    VALUES (
      gen_random_uuid(),
      ${userId},
      ${browser},
      ${os},
      CURRENT_TIMESTAMP,
      TRUE
    )
    ON CONFLICT (user_id, browser, os)
    DO UPDATE SET
      last_active = CURRENT_TIMESTAMP,
      session_active = TRUE
    RETURNING *;
  `;

  return result.rows[0] as Device;
}

export async function getUserDevices(userId: string): Promise<Device[]> {
  const result = await sql`
    SELECT *
    FROM devices
    WHERE user_id = ${userId}
    ORDER BY last_active DESC;
  `;

  return result.rows as Device[];
}

export async function deactivateDevice(deviceId: string): Promise<void> {
  await sql`
    UPDATE devices
    SET session_active = FALSE
    WHERE id = ${deviceId};
  `;
}

export async function cleanupInactiveDevices(daysInactive: number = 30): Promise<void> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

  await sql`
    DELETE FROM devices
    WHERE last_active < ${cutoffDate.toISOString()}
    AND session_active = FALSE;
  `;
}

export async function initDeviceTable(): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      browser TEXT NOT NULL,
      os TEXT NOT NULL,
      last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
      session_active BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (user_id) REFERENCES users(id),
      UNIQUE(user_id, browser, os)
    );
  `;
}
