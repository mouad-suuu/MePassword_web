import { NextRequest } from "next/server";
import Database from "../../services/database";

export async function validateAuthToken(request: NextRequest) {
  try {

    // Get user ID and auth header
    const userId = request.headers.get('X-User-ID');
    const authHeader = request.headers.get('Authorization');

    // Basic validation
    if (!userId || !authHeader) {
      return {
        error: "Missing user ID or authorization header",
        status: 401
      };
    }

    // Extract token from header
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();

    // Get stored token from database
    const { token: storedToken, expired } = await Database.userService.getUserToken(userId);

    // Validate token
    if (!storedToken) {
      return {
        error: "No token found for user",
        status: 401
      };
    }

    if (expired) {
      return {
        error: "Token has expired",
        status: 401
      };
    }

    if (token !== storedToken) {
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
