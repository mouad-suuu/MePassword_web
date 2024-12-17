import { NextRequest } from "next/server";
import Database from "../../services/database";

export async function validateAuthToken(request: NextRequest) {
  try {
    console.log("[validateAuthToken] Starting token validation");

    // Get user ID and auth header
    const userId = request.headers.get('X-User-ID');
    const authHeader = request.headers.get('Authorization');

    // Log request details for debugging
    console.log("[validateAuthToken] Request details:", {
      hasAuthHeader: !!authHeader,
      authHeaderPreview: authHeader?.substring(0, 50),
      userId,
      method: request.method,
      url: request.url
    });

    // Basic validation
    if (!userId || !authHeader) {
      return {
        error: "Missing user ID or authorization header",
        status: 401
      };
    }

    // Extract token from header
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    console.log("[validateAuthToken] Extracted token:", {
      tokenLength: token.length,
      tokenPreview: token.substring(0, 50)
    });

    // Get stored token from database
    const { token: storedToken, expired } = await Database.userService.getUserToken(userId);
    console.log("[validateAuthToken] Retrieved stored token:", {
      hasStoredToken: !!storedToken,
      storedTokenLength: storedToken?.length,
      storedTokenPreview: storedToken?.substring(0, 50),
      isExpired: expired
    });

    // Validate token
    if (!storedToken) {
      console.log("[validateAuthToken] No token found for user");
      return {
        error: "No token found for user",
        status: 401
      };
    }

    if (expired) {
      console.log("[validateAuthToken] Token has expired");
      return {
        error: "Token has expired",
        status: 401
      };
    }

    if (token !== storedToken) {
      console.log("[validateAuthToken] Token mismatch");
      return {
        error: "Invalid token",
        status: 401
      };
    }

    return { valid: true };
  } catch (error) {
    console.error("[validateAuthToken] Error:", error);
    return {
      error: "Token validation failed",
      status: 401
    };
  }
}
