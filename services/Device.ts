import { sql } from "@vercel/postgres";
import { Device } from "../types";
import { v4 as uuidv4 } from 'uuid';

export class DeviceService {

public async  upsertDevice(
    userId: string,
    browser: string,
    os: string,
    deviceName?: string,
    source: 'web' | 'extension' = 'web'
  ): Promise<Device> {
    try {
  
      const result = await sql`
        INSERT INTO devices (
          id,
          user_id,
          browser,
          os,
          device_name,
          last_active,
          session_active,
          source
        )
        VALUES (
          ${uuidv4()},
          ${userId},
          ${browser},
          ${os},
          ${deviceName || null},
          CURRENT_TIMESTAMP,
          true,
          ${source}
        )
        ON CONFLICT (user_id, browser, os, source)
        DO UPDATE SET
          last_active = CURRENT_TIMESTAMP,
          session_active = true,
          device_name = COALESCE(${deviceName}, devices.device_name)
        RETURNING *;
      `;
      return result.rows[0] as Device;
    } catch (error) {
      console.error("[upsertDevice] Error:", error);
      throw error;
    }
  }
  
  public async  getUserDevices(userId: string): Promise<Device[]> {
    const { rows } = await sql`
      SELECT 
        id,
        user_id as "userId",
        browser,
        os,
        device_name as "deviceName",
        last_active as "lastActive",
        session_active as "sessionActive",
        source
      FROM devices
      WHERE user_id = ${userId}
      ORDER BY last_active DESC
    `;
  
    return rows as Device[];
  }
  
  public async  deactivateDevice(deviceId: string): Promise<void> {
    await sql`
      UPDATE devices
      SET session_active = FALSE
      WHERE id = ${deviceId}
    `;
  }
  
  public async  deactivateAllDevices(userId: string): Promise<void> {
    try {
      await sql`
        UPDATE devices 
        SET session_active = FALSE 
        WHERE user_id = ${userId}
      `;
    } catch (error) {
      console.error("[deactivateAllDevices] Error:", error);
      throw error;
    }
  }
  
  public async  cleanupInactiveDevices(daysInactive: number = 30): Promise<void> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysInactive);
  
      await sql`
        UPDATE devices 
        SET session_active = FALSE
        WHERE last_active < ${cutoffDate.toISOString()}
        AND session_active = TRUE;
      `;
  
    } catch (error) {
      console.error("Error cleaning up inactive devices:", error);
      throw error;
    }
  }
}