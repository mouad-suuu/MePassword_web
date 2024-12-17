import { sql } from "@vercel/postgres";
import { EncryptedPassword } from "../types";
import { v4 as uuidv4 } from 'uuid';

export class KeysService {
  public async writeKeys(
    userId: string,
    password: EncryptedPassword
  ): Promise<void> {
    await sql`
      INSERT INTO keys (
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
  
  public async readKeys(userId: string): Promise<EncryptedPassword[]> {
    const { rows } = await sql`
      SELECT 
        id,
        website,
        username as user,
        encrypted_password as password,
        owner_email,
        owner_id,
        EXTRACT(EPOCH FROM created_at) * 1000 as "createdAt"
      FROM keys
      WHERE user_id = ${userId}
    `;
    return rows as EncryptedPassword[];
  }

  public async deleteKey(userId: string, passwordId: string): Promise<void> {
    await sql`
      DELETE FROM keys 
      WHERE user_id = ${userId} 
      AND id = ${passwordId}
    `;
  }

  public async getKeysById(
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
        EXTRACT(EPOCH FROM created_at) * 1000 as "createdAt"
      FROM keys
      WHERE id = ${id} AND user_id = ${userId}
    `;
  
    return rows.length > 0 ? (rows[0] as EncryptedPassword) : null;
  }

  public async getKeysWithPagination(
    userId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    keys: EncryptedPassword[];
    total: number;
  }> {
    const offset = (page - 1) * limit;
  
    const { rows: keys } = await sql`
      SELECT 
        id,
        website,
        username as user,
        encrypted_password as password,
        owner_email,
        owner_id,
        EXTRACT(EPOCH FROM created_at) * 1000 as "createdAt"
      FROM keys
      WHERE user_id = ${userId}
      LIMIT ${limit}
      OFFSET ${offset}
    `;
  
    const { rows: totalCount } = await sql`
      SELECT COUNT(*) as total 
      FROM keys
      WHERE user_id = ${userId}
    `;
  
    return {
      keys: keys as EncryptedPassword[],
      total: parseInt(totalCount[0].total),
    };
  }

  /**
   * Share keys with another user
   */
  public async shareKeys(
    recipientId: string,
    keys: EncryptedPassword[],
    originalOwnerId: string
  ): Promise<void> {
    try {
      for (const key of keys) {
        const encryptedPassword = key.encrypted_password ?? key.password;
        
        if (!encryptedPassword) {
          throw new Error('Password is required for sharing');
        }

        // Check if key is already shared with same details
        const { rows } = await sql<{ id: string }>`
          SELECT id FROM keys 
          WHERE user_id = ${recipientId}
          AND website = ${key.website}
          AND username = ${key.user}
          AND owner_id = ${originalOwnerId}
          LIMIT 1
        `;

        const existingKey = rows[0];

        if (existingKey) {
          // Update existing key
          await sql`
            UPDATE keys 
            SET encrypted_password = ${encryptedPassword}
            WHERE id = ${existingKey.id}
          `;
        } else {
          // Insert new key
          await sql`
            INSERT INTO keys (
              id,
              user_id,
              website,
              username,
              owner_email,
              encrypted_password,
              owner_id,
              created_at
            ) VALUES (
              ${uuidv4()},
              ${recipientId},
              ${key.website},
              ${key.user},
              ${key.owner_email},
              ${encryptedPassword},
              ${originalOwnerId},
              CURRENT_TIMESTAMP
            )
          `;
        }
      }
    } catch (error) {
      console.error('[shareKeys] Error:', error);
      throw error;
    }
  }
}