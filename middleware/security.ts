import { NextRequest } from "next/server";
import { validateAuthToken } from "./auth";
import { checkAndUpdateDevice } from "./devices";

export async function validateSecurityHeaders(request: NextRequest) {
  try {
    // Get userId from headers or query params
    const userId = request.headers.get('x-user-id') || 
                  request.nextUrl.searchParams.get('userId');

    if (!userId) {
      return {
        error: "User ID is required",
        status: 400
      };
    }

    // Validate auth token
    const authResult = await validateAuthToken(request, userId);
    if ("error" in authResult) {
      return authResult;
    }

    // Check and update device info
    const deviceResult = await checkAndUpdateDevice(request, userId);
    if ("error" in deviceResult) {
      return deviceResult;
    }

    return { success: true, userId };
  } catch (error) {
    console.error("Security validation error:", error);
    return {
      error: "Security validation failed",
      status: 500
    };
  }
}
