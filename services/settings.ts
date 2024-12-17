
import { sql } from "@vercel/postgres";
import { APISettingsPayload } from "../types";

export class SettingsService {

public async  writeSettings(
    settings: APISettingsPayload
  ): Promise<void> {
    await sql`
      INSERT INTO settings (
        id,
        user_id,
        public_key,
        password,
        device_id,
        timestamp,
        session_settings
      )
      VALUES (
        ${crypto.randomUUID()},
        ${settings.userId},
        ${settings.publicKey},
        ${settings.password},
        ${settings.deviceId},
        ${settings.timestamp},
        ${JSON.stringify(settings.sessionSettings)}
      )
      ON CONFLICT (user_id) 
      DO UPDATE SET
        public_key = EXCLUDED.public_key,
        password = EXCLUDED.password,
        device_id = EXCLUDED.device_id,
        timestamp = EXCLUDED.timestamp,
        session_settings = EXCLUDED.session_settings
    `;
  }
  
  public async  readSettings(
    userId: string
  ): Promise<APISettingsPayload | null> {
    const { rows } = await sql`
      SELECT 
        user_id as "userId",
        public_key as "publicKey",
        password,
        device_id as "deviceId",
        timestamp,
        session_settings as "sessionSettings"
      FROM settings
      WHERE user_id = ${userId}
      LIMIT 1
    `;
  
    return rows.length > 0 ? rows[0] as APISettingsPayload : null;
  }
  /**
 * Get user's public key by email
 */
public async  getUserPublicKeyByEmail(
    email: string
  ): Promise<{ userId: string; publicKey: string | null }> {
    try {
      const result = await sql`
        SELECT u.id as user_id, s.public_key
        FROM users u
        LEFT JOIN settings s ON u.id = s.user_id
        WHERE u.email = ${email}
        LIMIT 1
      `;
  
      if (result.rows.length === 0) {
        throw new Error('User not found');
      }
  
      return {
        userId: result.rows[0].user_id,
        publicKey: result.rows[0].public_key
      };
    } catch (error) {
      console.error('[getUserPublicKeyByEmail] Error:', error);
      throw error;
    }
  }
  }