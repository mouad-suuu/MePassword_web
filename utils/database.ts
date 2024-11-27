// utils/database.ts
import { sql } from "@vercel/postgres";
import { APISettingsPayload, EncryptedPassword, AuditLog } from "../types";

export class Database {
  // Initialize database schema
  static async initDatabase() {
    try {
      await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id SERIAL PRIMARY KEY,
        settings JSONB NOT NULL
      );
    `;

      await sql`
     
        CREATE TABLE IF NOT EXISTS keys (
          id TEXT PRIMARY KEY,
          website TEXT NOT NULL,
          username TEXT NOT NULL,
          encrypted_password TEXT NOT NULL,
          created_at BIGINT ,
          modified_at BIGINT NOT NULL,
          last_accessed BIGINT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          strength TEXT CHECK (strength IN ('weak', 'medium', 'strong'))
        );
      `;

      await sql`

        CREATE TABLE IF NOT EXISTS passwords (
          id TEXT PRIMARY KEY,
          website TEXT NOT NULL,
          username TEXT NOT NULL,
          encrypted_password TEXT NOT NULL,
          created_at BIGINT NOT NULL,
          modified_at BIGINT NOT NULL,
          last_accessed BIGINT NOT NULL,
          version INTEGER NOT NULL DEFAULT 1,
          strength TEXT CHECK (strength IN ('weak', 'medium', 'strong'))
        );
      `;

      await sql`
     
        CREATE TABLE IF NOT EXISTS audit_logs (
          id TEXT PRIMARY KEY,
          timestamp BIGINT NOT NULL,
          action TEXT CHECK (action IN ('create', 'read', 'update', 'delete', 'share', 'login', 'logout')),
          user_id TEXT NOT NULL,
          resource_type TEXT CHECK (resource_type IN ('password', 'team', 'vault', 'key')),
          resource_id TEXT NOT NULL,
          metadata JSONB NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        );
      `;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error; // Rethrow the error after logging
    }
  }
  // Settings operations
  static async writeSettings(settings: APISettingsPayload): Promise<void> {
    await sql`
      INSERT INTO settings (id, settings)
      VALUES (1, ${JSON.stringify(settings)})
      ON CONFLICT (id) DO UPDATE
      SET settings = EXCLUDED.settings
    `;
  }

  static async readSettings(): Promise<APISettingsPayload | null> {
    const { rows } = await sql`
      SELECT settings
      FROM settings
      LIMIT 1
    `;

    if (rows.length === 0) return null;

    return rows[0].settings as APISettingsPayload;
  }

  // Symmetric keys operations
  static async writekeys(password: EncryptedPassword): Promise<void> {
    await sql`
      INSERT INTO keys (
        id, website, username, encrypted_password, 
        created_at, modified_at, last_accessed, 
        version, strength
      )
      VALUES (
        ${password.id},
        ${password.website},
        ${password.user},
        ${password.password},
        ${password.createdAt},
        ${password.modifiedAt},
        ${password.lastAccessed},
        ${password.version},
        ${password.strength}
      )
      ON CONFLICT (id) DO UPDATE
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

  static async readKeys(): Promise<EncryptedPassword[]> {
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
      ORDER BY modified_at DESC
    `;
    return rows as EncryptedPassword[];
  }

  // Password operations
  static async writePassword(password: EncryptedPassword): Promise<void> {
    await sql`
      INSERT INTO passwords (
        id, website, username, encrypted_password, 
        created_at, modified_at, last_accessed, 
        version, strength
      )
      VALUES (
        ${password.id},
        ${password.website},
        ${password.user},
        ${password.password},
        ${password.createdAt},
        ${password.modifiedAt},
        ${password.lastAccessed},
        ${password.version},
        ${password.strength}
      )
      ON CONFLICT (id) DO UPDATE
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

  static async readPasswords(): Promise<EncryptedPassword[]> {
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
      ORDER BY modified_at DESC
    `;
    return rows as EncryptedPassword[];
  }

  // Audit log operations
  static async writeAuditLog(log: AuditLog): Promise<void> {
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

  static async readAuditLogs(): Promise<AuditLog[]> {
    const { rows } = await sql`
      SELECT 
        id,
        timestamp,
        action,
        user_id as "userId",
        resource_type as "resourceType",
        resource_id as "resourceId",
        metadata
      FROM audit_logs
      ORDER BY timestamp DESC
      LIMIT 1000
    `;
    return rows as AuditLog[];
  }
  static async deletePassword(id: string): Promise<void> {
    await sql`
    DELETE FROM passwords 
    WHERE id = ${id}
  `;
  }

  static async getPasswordById(id: string): Promise<EncryptedPassword | null> {
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
    WHERE id = ${id}
  `;

    return rows.length > 0 ? (rows[0] as EncryptedPassword) : null;
  }

  static async updatePasswordAccess(id: string): Promise<void> {
    await sql`
    UPDATE passwords
    SET last_accessed = ${Date.now()}
    WHERE id = ${id}
  `;
  }
  static async updatekeyAccess(id: string): Promise<void> {
    await sql`
    UPDATE keys
    SET last_accessed = ${Date.now()}
    WHERE id = ${id}
  `;
  }
  // Optional: Method to get keys with pagination
  static async getPasswordsWithPagination(
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
    ORDER BY modified_at DESC
    LIMIT ${limit}
    OFFSET ${offset}
  `;

    const { rows: totalCount } = await sql`
    SELECT COUNT(*) as total FROM passwords
  `;

    return {
      passwords: passwords as EncryptedPassword[],
      total: parseInt(totalCount[0].total),
    };
  }
  static async deleteKey(id: string): Promise<void> {
    await sql`
      DELETE FROM keys 
      WHERE id = ${id}
    `;
  }

  // Delete a password by ID

  // Optional method to get a key by ID (similar to getPasswordById)
  static async getKeyById(id: string): Promise<EncryptedPassword | null> {
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
      WHERE id = ${id}
    `;

    return rows.length > 0 ? (rows[0] as EncryptedPassword) : null;
  }
}
