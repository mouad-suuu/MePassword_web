import { sql } from "@vercel/postgres";

export class  UserService {

public async  initDatabase() {
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
          owner_email TEXT DEFAULT 'USER',
          encrypted_password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          owner_id TEXT REFERENCES users(id),
          FOREIGN KEY (user_id) REFERENCES users(id)
        );
      `;

      await sql`
        DROP TABLE IF EXISTS passwords CASCADE;
      `;

      await sql`
        CREATE TABLE IF NOT EXISTS passwords (
          id TEXT,
          user_id TEXT,
          website TEXT,
          username TEXT,
          owner_email TEXT DEFAULT 'USER',
          encrypted_password TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          owner_id TEXT REFERENCES users(id),
          PRIMARY KEY (id, user_id),
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );
      `;

      await sql`
        CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);
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
          source TEXT,
          FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
          UNIQUE(user_id, browser, os, source)
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

    } catch (error) {
      console.error('Failed to initialize database:', error);
      throw error;
    }
  }

public async  ensureDatabaseInitialized() {
  try {
    // Check if tables exist by querying the information schema
    const tablesExist = await sql`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      );
    `;

    // If tables don't exist, initialize the database
    if (!tablesExist.rows[0].exists) {
      await this.initDatabase();
    } else {
    }
  } catch (error) {
    console.error("❌ Error checking/initializing database:", error);
    throw error;
  }
}

public async  createUser(
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

public async  updateUserToken(
  userId: string, 
  encryptedToken: string,
  expiresInDays: number = 30
): Promise<void> {

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
  } catch (error) {
    console.error("[updateUserToken] Error updating token:", error);
    throw error;
  }
}

public async  getUserToken(userId: string): Promise<{ token: string | null, expired: boolean }> {

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
public async  deleteUser(userId: string): Promise<void> {
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
  
    } catch (error) {
      // Rollback the transaction in case of any error
      await sql`ROLLBACK;`;
      
      console.error(`Failed to delete user ${userId}:`, error);
      throw error;
    }
  }
  
/**
 * Search for users by email pattern
 */
public async  searchUsersByEmail(
    email: string,
    limit: number = 5
  ): Promise<{ id: string; email: string; username: string }[]> {
    try {
      const result = await sql`
        SELECT id, email, username
        FROM users
        WHERE email ILIKE ${`%${email}%`}
        LIMIT ${limit}
      `;
      return result.rows as { id: string; email: string; username: string }[];
    } catch (error) {
      console.error('[searchUsersByEmail] Error:', error);
      throw error;
    }
  }

}