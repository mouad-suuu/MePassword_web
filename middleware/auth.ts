import { NextRequest } from "next/server";
import { getUserToken } from "../utils/database";
import { validateEnv } from "../utils/env";

export async function validateAuthToken(request: NextRequest, providedUserId?: string): Promise<{ success: boolean, userId: string } | { error: string, status: number }> {
  try {
    console.log("[validateAuthToken] Starting validation");
    validateEnv();
    
    const userId = providedUserId || request.nextUrl.searchParams.get("userId");

    console.log("[validateAuthToken] Request details:", {
      userId,
      method: request.method,
      url: request.url
    });

    if (!userId) {
      console.warn("[validateAuthToken] No userId provided");
      return {
        error: "User ID is required",
        status: 401
      };
    }

    // Get token from Authorization header or x-auth-token
    const authHeader = request.headers.get('authorization');
    const token = authHeader ? 
      authHeader.startsWith('Bearer ') ? authHeader.substring(7) : authHeader
      : request.headers.get('x-auth-token');

    console.log("[validateAuthToken] Token extraction:", { 
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      isBearerToken: authHeader?.startsWith('Bearer ') ?? false
    });

    if (!token) {
      console.warn("[validateAuthToken] No token found in request");
      return {
        error: "Missing or invalid authorization header",
        status: 401
      };
    }

    // Get stored token
    const storedToken = await getUserToken(userId);
    console.log("[validateAuthToken] Retrieved stored token:", {
      hasStoredToken: !!storedToken?.token,
      isExpired: storedToken?.expired
    });

    if (!storedToken?.token) {
      console.warn("[validateAuthToken] No stored token found for user");
      return {
        error: "No token found for user",
        status: 401
      };
    }

    if (storedToken.expired) {
      console.warn("[validateAuthToken] Token has expired");
      return {
        error: "Token has expired",
        status: 401
      };
    }

    // Compare with stored token
    const isValid = token === storedToken.token;
    console.log("[validateAuthToken] Token validation result:", { isValid });

    if (!isValid) {
      console.warn("[validateAuthToken] Token mismatch");
      return {
        error: "Invalid authentication token",
        status: 403
      };
    }

    return { success: true, userId };
  } catch (error) {
    console.error("[validateAuthToken] Error:", error);
    return {
      error: "Authentication failed",
      status: 500
    };
  }
}
