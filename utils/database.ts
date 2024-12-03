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
        image_url TEXT
      );
    `;

    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        theme TEXT,
        auto_lock_time INTEGER,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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
        name TEXT,
        username TEXT,
        encrypted_password TEXT NOT NULL,
        website TEXT,
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
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

export async function createUser(
  userId: string, 
  email: string, 
  verification: boolean, 
  firstName: string, 
  lastName: string, 
  username: string, 
  imageUrl: string
): Promise<void> {
  await sql`
    INSERT INTO users (
      id, 
      email, 
      created_at, 
      last_login, 
      verification, 
      first_name, 
      last_name, 
      username, 
      image_url
    ) VALUES (
      ${userId}, 
      ${email}, 
      CURRENT_TIMESTAMP, 
      CURRENT_TIMESTAMP, 
      ${verification}, 
      ${firstName}, 
      ${lastName}, 
      ${username}, 
      ${imageUrl}
    )
    ON CONFLICT (id) DO UPDATE SET 
      email = EXCLUDED.email,
      last_login = CURRENT_TIMESTAMP,
      verification = EXCLUDED.verification,
      first_name = EXCLUDED.first_name,
      last_name = EXCLUDED.last_name,
      username = EXCLUDED.username,
      image_url = EXCLUDED.image_url
  `;
}

export async function writeSettings(
  userId: string,
  settings: APISettingsPayload
): Promise<void> {
  await sql`
    INSERT INTO settings (user_id, settings)
    VALUES (${userId}, ${JSON.stringify(settings)})
    ON CONFLICT (user_id) DO UPDATE
    SET settings = EXCLUDED.settings
  `;
}

export async function readSettings(
  userId: string
): Promise<APISettingsPayload | null> {
  const { rows } = await sql`
    SELECT settings
    FROM settings
    WHERE user_id = ${userId}
    LIMIT 1
  `;

  return rows.length > 0 ? (rows[0].settings as APISettingsPayload) : null;
}

export async function writeKeys(
  userId: string,
  password: EncryptedPassword
): Promise<void> {
  await sql`
    INSERT INTO keys (
      id, user_id, website, username, encrypted_password, 
      created_at, modified_at, last_accessed, 
      version, strength
    )
    VALUES (
      ${password.id},
      ${userId},
      ${password.website},
      ${password.user},
      ${password.password},
      ${password.createdAt},
      ${password.modifiedAt},
      ${password.lastAccessed},
      ${password.version},
      ${password.strength}
    )
    ON CONFLICT (id, user_id) DO UPDATE
    SET 
      website = EXCLUDED.website,
      username = EXCLUDED.username,
      encrypted_password = EXCLUDED.encrypted_password,
      modified_at = EXCLUDED.modified_at,
      last_accessed = EXCLUDED.last_accessed,
      version = EXCLUDED.version,
      strength = EXCLUDED.strength
  `;
}

export async function readKeys(userId: string): Promise<EncryptedPassword[]> {
  const { rows } = await sql`
    SELECT 
      id,
      website,
      username as user,
      encrypted_password as password,
      created_at as "createdAt",
      modified_at as "modifiedAt",
      last_accessed as "lastAccessed",
      version,
      strength
    FROM keys 
    WHERE user_id = ${userId}
    ORDER BY modified_at DESC
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
      created_at, modified_at, last_accessed, 
      version, strength
    )
    VALUES (
      ${password.id},
      ${userId},
      ${password.website},
      ${password.user},
      ${password.password},
      ${password.createdAt},
      ${password.modifiedAt},
      ${password.lastAccessed},
      ${password.version},
      ${password.strength}
    )
    ON CONFLICT (id, user_id) DO UPDATE
    SET 
      website = EXCLUDED.website,
      username = EXCLUDED.username,
      encrypted_password = EXCLUDED.encrypted_password,
      modified_at = EXCLUDED.modified_at,
      last_accessed = EXCLUDED.last_accessed,
      version = EXCLUDED.version,
      strength = EXCLUDED.strength
  `;
}

export async function readPasswords(userId: string): Promise<EncryptedPassword[]> {
  const { rows } = await sql`
    SELECT 
      id,
      website,
      username as user,
      encrypted_password as password,
      created_at as "createdAt",
      modified_at as "modifiedAt",
      last_accessed as "lastAccessed",
      version,
      strength
    FROM passwords
    WHERE user_id = ${userId}
    ORDER BY modified_at DESC
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
      created_at as "createdAt",
      modified_at as "modifiedAt",
      last_accessed as "lastAccessed",
      version,
      strength
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
      created_at as "createdAt",
      modified_at as "modifiedAt",
      last_accessed as "lastAccessed",
      version,
      strength
    FROM passwords
    WHERE user_id = ${userId}
    ORDER BY modified_at DESC
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