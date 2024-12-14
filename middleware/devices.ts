import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";
import { upsertDevice } from "../utils/database";

function determineSource(request: NextRequest): 'web' | 'extension' | 'unknown' {
  const userAgent = request.headers.get("user-agent") || "";
  const clientType = request.headers.get("x-client-type");
  const origin = request.headers.get("origin") || "";
  
  console.log("[determineSource] Headers:", {
    userAgent,
    clientType,
    origin
  });

  if (clientType === 'extension') {
    return 'extension';
  } else if (clientType === 'web') {
    return 'web';
  }
  return 'unknown';
}

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
    const source = determineSource(request);
    
    console.log("[checkAndUpdateDevice] Parsed device info:", { browser, os, source });

    const device = await upsertDevice(userId, browser, os, undefined, source);
    console.log("[checkAndUpdateDevice] Device upserted successfully:", device);
  } catch (error) {
    console.error("[checkAndUpdateDevice] Error:", error);
    throw error;
  }
}