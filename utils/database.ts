"use server"

import { sql } from "@vercel/postgres";
import { APISettingsPayload, EncryptedPassword, AuditLog } from "../types";

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
        encrypted_key TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
    // Check if users table exists
    const { rows } = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_name = 'users'
      );
    `;

    if (!rows[0].exists) {
      console.log('Initializing database tables...');
      await initDatabase();
    }
  } catch (error) {
    console.error('Error checking/initializing database:', error);
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
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + expiresInDays);

  await sql`
    UPDATE users 
    SET 
      encrypted_token = ${encryptedToken},
      token_expires_at = ${expiresAt.toISOString()},
      last_login = CURRENT_TIMESTAMP
    WHERE id = ${userId};
  `;
}

export async function getUserToken(userId: string): Promise<{ token: string | null, expired: boolean }> {
  const result = await sql`
    SELECT encrypted_token, token_expires_at
    FROM users
    WHERE id = ${userId};
  `;

  if (result.rows.length === 0 || !result.rows[0].encrypted_token) {
    return { token: null, expired: true };
  }

  const expired = result.rows[0].token_expires_at 
    ? new Date(result.rows[0].token_expires_at) < new Date() 
    : false;

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
      id, user_id, website, username, encrypted_password, 
    )
    VALUES (
      ${password.id},
      ${userId},
      ${password.website},
      ${password.user},
      ${password.password},
      ${password.createdAt},
    )
    ON CONFLICT (id, user_id) DO UPDATE
    SET 
      website = EXCLUDED.website,
      username = EXCLUDED.username,
      encrypted_password = EXCLUDED.encrypted_password,
  `;
}

export async function readKeys(userId: string): Promise<EncryptedPassword[]> {
  const { rows } = await sql`
    SELECT 
      id,
      website,
      username as user,
      encrypted_password as password,
      created_at as "createdAt"
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
      id, user_id, website, username, encrypted_password, 
    )
    VALUES (
      ${password.id},
      ${userId},
      ${password.website},
      ${password.user},
      ${password.password},
      ${password.createdAt},
    )
    ON CONFLICT (id, user_id) DO UPDATE
    SET 
      website = EXCLUDED.website,
      username = EXCLUDED.username,
      encrypted_password = EXCLUDED.encrypted_password,
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

export async function writeAuditLog(log: AuditLog): Promise<void> {
  await sql`
    INSERT INTO audit_logs (
      id, timestamp, action, user_id, 
      resource_type, resource_id, metadata
    )
    VALUES (
      ${log.id},
      ${log.timestamp},
      ${log.action},
      ${log.userId},
      ${log.resourceType},
      ${log.resourceId},
      ${JSON.stringify(log.metadata)}
    )
  `;
}

export async function deletePassword(userId: string, id: string): Promise<void> {
  await sql`
    DELETE FROM passwords 
    WHERE id = ${id} AND user_id = ${userId}
  `;
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