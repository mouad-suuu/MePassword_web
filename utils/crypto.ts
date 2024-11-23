import { createHash } from "crypto";

export async function verifyToken(token: string): Promise<boolean> {
  const storedHash = process.env.AUTH_KEY_HASH;
  if (!storedHash) throw new Error("Auth key not configured");

  const hash = createHash("sha256").update(token).digest("hex");
  return hash === storedHash;
}
