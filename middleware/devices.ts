import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";
import { upsertDevice } from "../utils/database";

export async function checkAndUpdateDevice(request: NextRequest): Promise<void> {
  try {
    const userId = request.headers.get('x-user-id') || 
                  request.nextUrl.searchParams.get('userId');
    
    console.log("[checkAndUpdateDevice] Starting device check for userId:", userId);
    
    if (!userId) {
      console.warn("[checkAndUpdateDevice] No userId found in request");
      throw new Error("User ID is required");
    }

    const userAgent = request.headers.get("user-agent");
    console.log("[checkAndUpdateDevice] User agent:", userAgent);

    if (!userAgent) {
      console.warn("[checkAndUpdateDevice] No user-agent found in request");
      throw new Error("User agent is required");
    }

    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    
    console.log("[checkAndUpdateDevice] Parsed device info:", { browser, os });

    const device = await upsertDevice(userId, browser, os);
    console.log("[checkAndUpdateDevice] Device upserted successfully:", device);
  } catch (error) {
    console.error("[checkAndUpdateDevice] Error:", error);
    throw error;
  }
}