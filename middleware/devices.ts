import { NextRequest } from "next/server";
import { UAParser } from "ua-parser-js";
import Database from "../services/database";

function determineSource(request: NextRequest): 'web' | 'extension' | 'unknown' {
  const userAgent = request.headers.get("user-agent") || "";
  const clientType = request.headers.get("x-client-type");
  const origin = request.headers.get("origin") || "";
  

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
    
    
    if (!userId) {
      console.warn("[checkAndUpdateDevice] No userId found in request");
      throw new Error("User ID is required");
    }

    const userAgent = request.headers.get("user-agent");

    if (!userAgent) {
      console.warn("[checkAndUpdateDevice] No user-agent found in request");
      throw new Error("User agent is required");
    }

    const parser = new UAParser(userAgent);
    const browser = parser.getBrowser().name || "Unknown";
    const os = parser.getOS().name || "Unknown";
    const source = determineSource(request);
    

    const device = await Database.deviceService.upsertDevice(userId, browser, os, undefined, source);
  } catch (error) {
    console.error("[checkAndUpdateDevice] Error:", error);
    throw error;
  }
}