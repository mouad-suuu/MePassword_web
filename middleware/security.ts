import { NextRequest } from "next/server";
import { checkAndUpdateDevice } from "./devices";
import { validateAuthToken } from "./auth";

export async function validateSecurityHeaders(request: NextRequest) {
  try {
    console.log("[validateSecurityHeaders] Starting validation");
    
    const userId = request.headers.get('x-user-id') || 
                  request.nextUrl.searchParams.get('userId');

    console.log("[validateSecurityHeaders] Headers:", { 
      userId,
      headers: Object.fromEntries(request.headers)
    });

    if (!userId) {
      console.warn("[validateSecurityHeaders] Missing userId");
      return { error: "User ID is required", status: 401 };
    }

    // Validate auth token
    const authResult = await validateAuthToken(request, userId);
    console.log("[validateSecurityHeaders] Auth validation result:", authResult);

    if ("error" in authResult) {
      console.warn("[validateSecurityHeaders] Auth validation failed:", authResult.error);
      return authResult;
    }

    try {
      // Update device information
      await checkAndUpdateDevice(request);
      console.log("[validateSecurityHeaders] Device check completed");
    } catch (error) {
      console.error("[validateSecurityHeaders] Device check failed:", error);
      // Don't fail validation for device errors
    }

    return { valid: true };
  } catch (error) {
    console.error("[validateSecurityHeaders] Error:", error);
    return { error: "Security validation failed", status: 500 };
  }
}
