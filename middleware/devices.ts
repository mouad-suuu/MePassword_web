import { NextRequest } from "next/server";
import { upsertDevice } from "../utils/database";
import UAParser from "ua-parser-js";

export async function checkAndUpdateDevice(request: NextRequest, userId: string) {
  try {
    const userAgent = request.headers.get("user-agent");
    if (!userAgent) {
      return {
        error: "No user agent found",
        status: 400
      };
    }

    // Parse user agent
    const parser = new UAParser.UAParser(userAgent);
    const browser = parser.getBrowser();
    const os = parser.getOS();

    // Update device info
    await upsertDevice(
      userId,
      `${browser.name || "Unknown"} ${browser.version || ""}`.trim(),
      `${os.name || "Unknown"} ${os.version || ""}`.trim()
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating device info:", error);
    return {
      error: "Failed to update device info",
      status: 500
    };
  }
}