import { NextResponse } from "next/server";
import { sql } from "@vercel/postgres";

async function initializeTables() {
  try {
    // Create users table
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

    // Create settings table
    await sql`
      CREATE TABLE IF NOT EXISTS settings (
        id TEXT PRIMARY KEY,
        user_id TEXT UNIQUE NOT NULL,
        public_key TEXT,
        password TEXT,
        device_id TEXT,
        timestamp BIGINT,
        session_settings JSONB,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Create keys table
    await sql`
      CREATE TABLE IF NOT EXISTS keys (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        website TEXT,
        username TEXT,
        encrypted_password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Create passwords table
    await sql`
      CREATE TABLE IF NOT EXISTS passwords (
        id TEXT PRIMARY KEY,
        user_id TEXT,
        website TEXT,
        username TEXT,
        encrypted_password TEXT NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Create devices table
    await sql`
      CREATE TABLE IF NOT EXISTS devices (
        id TEXT PRIMARY KEY,
        user_id TEXT NOT NULL,
        browser TEXT NOT NULL,
        os TEXT NOT NULL,
        last_active TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        session_active BOOLEAN DEFAULT TRUE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;

    // Create necessary indexes
    await sql`CREATE INDEX IF NOT EXISTS idx_devices_user_id ON devices(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_keys_user_id ON keys(user_id);`;
    await sql`CREATE INDEX IF NOT EXISTS idx_passwords_user_id ON passwords(user_id);`;

    return true;
  } catch (error) {
    console.error("Error initializing tables:", error);
    throw error;
  }
}

export async function POST() {
  try {
    await initializeTables();
    
    return NextResponse.json({ 
      success: true, 
      message: "Database initialized successfully" 
    });
  } catch (error) {
    console.error("Database initialization failed:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    );
  }
}