import { sql } from "@vercel/postgres";
import { EncryptedPassword } from "../types";
import { v4 as uuidv4 } from 'uuid';

export  class PasswordsService {

public async writePassword(
    userId: string,
    password: EncryptedPassword
  ): Promise<void> {
    await sql`
      INSERT INTO passwords (
        id,
        user_id,
        website,
        username,
        encrypted_password,
        owner_id,
        owner_email,
        created_at
      )
      VALUES (
        ${password.id},
        ${userId},
        ${password.website},
        ${password.user},
        ${password.password},
        ${userId},
        ${password.owner_email},
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (id, user_id) DO UPDATE
      SET encrypted_password = ${password.password}
    `;
  }
  
  public async readPasswords(userId: string): Promise<EncryptedPassword[]> {
    const { rows } = await sql`
      SELECT 
        id,
        website,
        username as user,
        encrypted_password as password,
        owner_email,
        owner_id,
        EXTRACT(EPOCH FROM created_at) * 1000 as "createdAt",
        EXTRACT(EPOCH FROM updated_at) * 1000 as "updatedAt"
      FROM passwords
      WHERE user_id = ${userId}
    `;
    return rows as EncryptedPassword[];
  }
  public async deletePassword(userId: string, passwordId: string): Promise<void> {
    await sql`
      DELETE FROM passwords 
      WHERE user_id = ${userId} 
      AND id = ${passwordId}
    `;
  }
  public async getPasswordById(
    userId: string,
    id: string
  ): Promise<EncryptedPassword | null> {
    const { rows } = await sql`
      SELECT 
        id,
        website,
        username as user,
        encrypted_password as password,
        owner_email,
        owner_id,
        EXTRACT(EPOCH FROM created_at) * 1000 as "createdAt",
        EXTRACT(EPOCH FROM updated_at) * 1000 as "updatedAt"
      FROM passwords
      WHERE id = ${id} AND user_id = ${userId}
    `;

    return rows.length > 0 ? (rows[0] as EncryptedPassword) : null;
  }
  public async getPasswordsWithPagination(
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
        owner_email,
        owner_id,
        EXTRACT(EPOCH FROM created_at) * 1000 as "createdAt",
        EXTRACT(EPOCH FROM updated_at) * 1000 as "updatedAt"
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
  

/**
 * Share passwords with another user
 */
public async sharePasswords(
    recipientId: string,
    passwords: EncryptedPassword[],
    originalOwnerId: string
  ): Promise<void> {
    try {
      for (const password of passwords) {
        console.log('Sharing password:', { ...password, password: '[REDACTED]' });
        const encryptedPassword = password.encrypted_password ?? password.password;
        
        if (!encryptedPassword) {
          throw new Error('Password is required for sharing');
        }

        // Check if password is already shared with same details
        const { rows } = await sql<{ id: string }>`
          SELECT id FROM passwords 
          WHERE user_id = ${recipientId}
          AND website = ${password.website}
          AND username = ${password.user}
          AND owner_id = ${originalOwnerId}
          LIMIT 1
        `;

        const existingPassword = rows[0];

        if (existingPassword) {
          // Update existing password
          await sql`
            UPDATE passwords 
            SET encrypted_password = ${encryptedPassword},
                updated_at = CURRENT_TIMESTAMP
            WHERE id = ${existingPassword.id}
          `;
        } else {
          // Insert new password
          await sql`
            INSERT INTO passwords (
              id,
              user_id,
              website,
              username,
              owner_email,
              encrypted_password,
              owner_id,
              created_at,
              updated_at
            ) VALUES (
              ${uuidv4()},
              ${recipientId},
              ${password.website},
              ${password.user},
              ${password.owner_email},
              ${encryptedPassword},
              ${originalOwnerId},
              CURRENT_TIMESTAMP,
              CURRENT_TIMESTAMP
            )
          `;
        }
      }
    } catch (error) {
      console.error('[sharePasswords] Error:', error);
      throw error;
    }
  }
}