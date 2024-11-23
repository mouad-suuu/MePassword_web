import { APISettingsPayload, AuditLog, EncryptedPassword } from "@/types";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

interface Storage {
  passwords: EncryptedPassword[];
  keys: EncryptedPassword[];
  auditLogs: AuditLog[];
  settings: APISettingsPayload;
}

export async function readStorage(): Promise<Storage> {
  try {
    const [passwords, keys, auditLogs, settings] = await Promise.all([
      prisma.password.findMany(),
      prisma.key.findMany(),
      prisma.auditLog.findMany(),
      prisma.settings.findFirst(),
    ]);

    return {
      passwords,
      keys,
      auditLogs,
      settings: settings || null,
    };
  } catch (error) {
    console.error("Database read error:", error);
    throw error;
  }
}

export async function writeStorage(data: Storage): Promise<void> {
  try {
    await prisma.$transaction(
      [
        prisma.password.deleteMany(),
        prisma.key.deleteMany(),
        prisma.auditLog.deleteMany(),
        prisma.settings.deleteMany(),
        prisma.password.createMany({ data: data.passwords }),
        prisma.key.createMany({ data: data.keys }),
        prisma.auditLog.createMany({ data: data.auditLogs }),
        data.settings ? prisma.settings.create({ data: data.settings }) : null,
      ].filter(Boolean)
    );
  } catch (error) {
    console.error("Database write error:", error);
    throw error;
  }
}
