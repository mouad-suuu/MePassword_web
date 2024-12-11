"use server"

import { sql } from "@vercel/postgres";
import { APISettingsPayload, EncryptedPassword, Device } from "../types";

export async function initDatabase() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT NOT NULL UNIQUE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP WITH TIME ZONE,
        verification BOOLEAN DEFAULT FALSE,
        first_name TEXT,
        last_name TEXT,
        username TEXT,
        image_url TEXT,
        encrypted_token TEXT,
        token_expires_at TIMESTAMP WITH TIME ZONE
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        public_key TEXT,
        password TEXT,
        device_id TEXT,
        timestamp BIGINT,
        session_settings JSONB,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS keys (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        website TEXT,
        username TEXT,
        encrypted_password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS passwords (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        website TEXT,
        username TEXT,
        encrypted_password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id)
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id TEXT NOT NULL,
        browser TEXT NOT NULL,
        os TEXT NOT NULL,
        device_name TEXT,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        session_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE(user_id, browser, os)
      );
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);
    `;

    await sql`
      CREATE INDEX IF NOT EXISTS idx_devices_last_active ON devices(last_active);
    `;

    await sql`
      ALTER TABLE settings 
      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE keys 
      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE passwords 
      ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES users(id) ON DELETE CASCADE;
    `;

    await sql`
      ALTER TABLE settings 
      DROP CONSTRAINT IF EXISTS settings_pkey;
    `;

    await sql`
      ALTER TABLE settings 
      ADD PRIMARY KEY (id, user_id);
    `;

    await sql`
      ALTER TABLE keys 
      DROP CONSTRAINT IF EXISTS keys_pkey;
    `;

    await sql`
      ALTER TABLE keys 
      ADD PRIMARY KEY (id, user_id);
    `;

    await sql`
      ALTER TABLE passwords 
      DROP CONSTRAINT IF EXISTS passwords_pkey;
    `;

    await sql`
      ALTER TABLE passwords 
      ADD PRIMARY KEY (id, user_id);
    `;

    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Failed to initialize database:', error);
    throw error;
  }
}

export async function ensureDatabaseInitialized() {
  try {
    await sql`DROP TABLE IF EXISTS devices CASCADE;`;
    await sql`DROP TABLE IF EXISTS settings CASCADE;`;
    await sql`DROP TABLE IF EXISTS keys CASCADE;`;
    await sql`DROP TABLE IF EXISTS passwords CASCADE;`;
    await sql`DROP TABLE IF EXISTS users CASCADE;`;
    
    await initDatabase();
    console.log("✅ Database recreated successfully");
  } catch (error) {
    console.error("❌ Error recreating database:", error);
    throw error;
  }
}

export async function createUser(
  userId: string, 
  email: string, 
  verification: boolean, 
  firstName: string, 
  lastName: string, 
  username: string, 
  imageUrl: string,
  encryptedToken?: string
): Promise<void> {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + 30); // Default 30 days expiration

  await sql`
    INSERT INTO users (
      id,
      email,
      verification,
      first_name,
      last_name,
      username,
      image_url,
      encrypted_token,
      token_expires_at,
      last_login
    ) VALUES (
      ${userId},
      ${email},
      ${verification},
      ${firstName},
      ${lastName},
      ${username},
      ${imageUrl},
      ${encryptedToken || null},
      ${encryptedToken ? expiresAt.toISOString() : null},
      CURRENT_TIMESTAMP
    )
    ON CONFLICT (id) DO UPDATE SET
      email = ${email},
      verification = ${verification},
      first_name = ${firstName},
      last_name = ${lastName},
      username = ${username},
      image_url = ${imageUrl},
      last_login = CURRENT_TIMESTAMP;
  `;
}

export async function updateUserToken(
  userId: string, 
  encryptedToken: string,
  expiresInDays: number = 30
): Promise<void> {
  console.log("[updateUserToken] Starting token update:", {
    userId,
    tokenLength: encryptedToken?.length,
    tokenPreview: encryptedToken?.substring(0, 50),
    expiresInDays
  });

  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  try {
    await sql`
      UPDATE users 
      SET 
        encrypted_token = ${encryptedToken},
        token_expires_at = ${expiresAt.toISOString()},
        last_login = CURRENT_TIMESTAMP
      WHERE id = ${userId};
    `;
    console.log("[updateUserToken] Token updated successfully");
  } catch (error) {
    console.error("[updateUserToken] Error updating token:", error);
    throw error;
  }
}

export async function getUserToken(userId: string): Promise<{ token: string | null, expired: boolean }> {
  console.log("[getUserToken] Fetching token for user:", userId);

  const result = await sql`
    SELECT encrypted_token, token_expires_at
    FROM users
    WHERE id = ${userId};
  `;

  console.log("[getUserToken] Database result:", {
    hasRows: result.rows.length > 0,
    hasToken: !!result.rows[0]?.encrypted_token,
    expiresAt: result.rows[0]?.token_expires_at
  });

  if (result.rows.length === 0 || !result.rows[0].encrypted_token) {
    console.log("[getUserToken] No token found for user");
    return { token: null, expired: true };
  }

  const expired = result.rows[0].token_expires_at 
    ? new Date(result.rows[0].token_expires_at) < new Date() 
    : false;

  console.log("[getUserToken] Returning token:", {
    tokenLength: result.rows[0].encrypted_token?.length,
    tokenPreview: result.rows[0].encrypted_token?.substring(0, 50),
    expired
  });

  return {
    token: result.rows[0].encrypted_token,
    expired
  };
}

export async function writeSettings(
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

export async function readSettings(
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

export async function writeKeys(
  userId: string,
  password: EncryptedPassword
): Promise<void> {
  await sql`
    INSERT INTO keys (
      id,
      user_id,
      website,
      username,
      encrypted_password
    )
    VALUES (
      ${password.id},
      ${userId},
      ${password.website},
      ${password.user},
      ${password.password}
    )
    ON CONFLICT (id, user_id) DO UPDATE
    SET
      website = EXCLUDED.website,
      username = EXCLUDED.username,
      encrypted_password = EXCLUDED.encrypted_password
  `;
}

export async function readKeys(userId: string): Promise<EncryptedPassword[]> {
  const { rows } = await sql`
    SELECT 
      id,
      website,
      username as user,
      encrypted_password as password,
      EXTRACT(EPOCH FROM created_at) * 1000 as "createdAt"
    FROM keys
    WHERE user_id = ${userId}
  `;
  return rows as EncryptedPassword[];
}

export async function writePassword(
  userId: string,
  password: EncryptedPassword
): Promise<void> {
  await sql`
    INSERT INTO passwords (
      id,
      user_id,
      website,
      username,
      encrypted_password
    )
    VALUES (
      ${password.id},
      ${userId},
      ${password.website},
      ${password.user},
      ${password.password}
    )
    ON CONFLICT (id, user_id) DO UPDATE
    SET
      website = EXCLUDED.website,
      username = EXCLUDED.username,
      encrypted_password = EXCLUDED.encrypted_password
  `;
}

export async function readPasswords(userId: string): Promise<EncryptedPassword[]> {
  const { rows } = await sql`
    SELECT 
      id,
      website,
      username as user,
      encrypted_password as password,
      EXTRACT(EPOCH FROM created_at) * 1000 as "createdAt"
    FROM passwords
    WHERE user_id = ${userId}
  `;
  return rows as EncryptedPassword[];
}


export async function deletePassword(userId: string, passwordId: string): Promise<void> {
  await sql`
    DELETE FROM passwords 
    WHERE user_id = ${userId} 
    AND id = ${passwordId}
  `;
}
export async function deleteKey(userId: string, passwordId: string): Promise<void> {
  await sql`
    DELETE FROM keys 
    WHERE user_id = ${userId} 
    AND id = ${passwordId}
  `;
}

export async function getKeysById(
  userId: string,
  id: string
): Promise<EncryptedPassword | null> {
  const { rows } = await sql`
    SELECT 
      id,
      website,
      username as user,
      encrypted_password as password,
      created_at as "createdAt"
    FROM keys
    WHERE id = ${id} AND user_id = ${userId}
  `;

  return rows.length > 0 ? (rows[0] as EncryptedPassword) : null;
}

export async function getPasswordById(
  userId: string,
  id: string
): Promise<EncryptedPassword | null> {
  const { rows } = await sql`
    SELECT 
      id,
      website,
      username as user,
      encrypted_password as password,
      created_at as "createdAt"
    FROM passwords
    WHERE id = ${id} AND user_id = ${userId}
  `;

  return rows.length > 0 ? (rows[0] as EncryptedPassword) : null;
}

export async function getPasswordsWithPagination(
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  passwords: EncryptedPassword[];
  total: number;
}> {
  const offset = (page - 1) * limit;

  const { rows: passwords } = await sql`
    SELECT 
      id,
      website,
      username as user,
      encrypted_password as password,
      created_at as "createdAt"
    FROM passwords
    WHERE user_id = ${userId}
    LIMIT ${limit}
    OFFSET ${offset}
  `;

  const { rows: totalCount } = await sql`
    SELECT COUNT(*) as total 
    FROM passwords
    WHERE user_id = ${userId}
  `;

  return {
    passwords: passwords as EncryptedPassword[],
    total: parseInt(totalCount[0].total),
  };
}
export async function deleteUser(userId: string): Promise<void> {
  try {
    // Begin a transaction to ensure all related data is deleted
    await sql`BEGIN;`;

    // Delete related records in other tables first to respect foreign key constraints
    await sql`
      DELETE FROM passwords WHERE user_id = ${userId};
    `;

    await sql`
      DELETE FROM keys WHERE user_id = ${userId};
    `;

    await sql`
      DELETE FROM settings WHERE user_id = ${userId};
    `;

 

    // Finally, delete the user from the users table
    await sql`
      DELETE FROM users WHERE id = ${userId};
    `;

    // Commit the transaction
    await sql`COMMIT;`;

    console.log(`User ${userId} and all associated data deleted successfully`);
  } catch (error) {
    // Rollback the transaction in case of any error
    await sql`ROLLBACK;`;
    
    console.error(`Failed to delete user ${userId}:`, error);
    throw error;
  }
}


export async function upsertDevice(
  userId: string,
  browser: string,
  os: string,
  deviceName?: string
): Promise<Device> {
  try {
    console.log("[upsertDevice] Starting device upsert:", { userId, browser, os, deviceName });

    // First try to update existing device
    const { rows: existingRows } = await sql`
      UPDATE devices 
      SET 
        last_active = CURRENT_TIMESTAMP,
        session_active = TRUE,
        device_name = COALESCE(${deviceName}, device_name)
      WHERE 
        user_id = ${userId} 
        AND browser = ${browser} 
        AND os = ${os}
      RETURNING 
        id,
        user_id as "userId",
        browser,
        os,
        device_name as "deviceName",
        last_active as "lastActive",
        session_active as "sessionActive"
    `;

    if (existingRows.length > 0) {
      console.log("[upsertDevice] Updated existing device:", existingRows[0]);
      return existingRows[0] as Device;
    }

    // If no existing device, insert new one
    const { rows: newRows } = await sql`
      INSERT INTO devices (
        id,
        user_id,
        browser,
        os,
        device_name,
        last_active,
        session_active
      ) VALUES (
        gen_random_uuid(),
        ${userId},
        ${browser},
        ${os},
        ${deviceName},
        CURRENT_TIMESTAMP,
        TRUE
      )
      RETURNING 
        id,
        user_id as "userId",
        browser,
        os,
        device_name as "deviceName",
        last_active as "lastActive",
        session_active as "sessionActive"
    `;

    console.log("[upsertDevice] Created new device:", newRows[0]);
    return newRows[0] as Device;
  } catch (error) {
    console.error("[upsertDevice] Error:", error);
    throw error;
  }
}

export async function getUserDevices(userId: string): Promise<Device[]> {
  const { rows } = await sql`
    SELECT 
      id,
      user_id as "userId",
      browser,
      os,
      device_name as "deviceName",
      last_active as "lastActive",
      session_active as "sessionActive"
    FROM devices
    WHERE user_id = ${userId}
    ORDER BY last_active DESC
  `;

  return rows as Device[];
}

export async function deactivateDevice(deviceId: string): Promise<void> {
  await sql`
    UPDATE devices
    SET session_active = FALSE
    WHERE id = ${deviceId}
  `;
}

export async function deactivateAllDevices(userId: string): Promise<void> {
  try {
    console.log("[deactivateAllDevices] Starting for userId:", userId);
    await sql`
      UPDATE devices 
      SET session_active = FALSE 
      WHERE user_id = ${userId}
    `;
    console.log("[deactivateAllDevices] Successfully deactivated all devices");
  } catch (error) {
    console.error("[deactivateAllDevices] Error:", error);
    throw error;
  }
}

export async function cleanupInactiveDevices(daysInactive: number = 30): Promise<void> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysInactive);

    await sql`
      UPDATE devices 
      SET session_active = FALSE
      WHERE last_active < ${cutoffDate.toISOString()}
      AND session_active = TRUE;
    `;

    console.log(`Deactivated devices inactive for more than ${daysInactive} days`);
  } catch (error) {
    console.error("Error cleaning up inactive devices:", error);
    throw error;
  }
}

export async function recreateDatabase() {
  try {
    // Drop existing tables in reverse order of creation (to handle foreign key constraints)
    await sql`DROP TABLE IF EXISTS devices CASCADE;`;
    await sql`DROP TABLE IF EXISTS passwords CASCADE;`;
    await sql`DROP TABLE IF EXISTS keys CASCADE;`;
    await sql`DROP TABLE IF EXISTS settings CASCADE;`;
    await sql`DROP TABLE IF EXISTS users CASCADE;`;

    // Recreate all tables
    await initDatabase();
    
    console.log("✅ Database recreated successfully");
  } catch (error) {
    console.error("❌ Error recreating database:", error);
    throw error;
  }
}