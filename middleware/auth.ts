import { NextRequest } from "next/server";
import Database from "../services/database";
import { Devices } from "../utils/device";
import { useAuth } from '@clerk/nextjs';
import { getAuth, currentUser } from '@clerk/nextjs/server';

export async function validateAuthToken(request: NextRequest, providedUserId?: string): Promise<{ success: boolean, userId: string } | { error: string, status: number }> {
  try {
    
    // Get userId from various possible sources
    const userId = providedUserId || 
                  request.headers.get('x-user-id') || 
                  request.nextUrl.searchParams.get('userId');


    if (!userId) {
      console.warn("[validateAuthToken] No userId provided");
      return {
        error: "User ID is required",
        status: 401
      };
    }

    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : authHeader;


    if (!token) {
      return {
        error: "Missing or invalid authorization header",
        status: 401
      };
    }

    // For web requests (Clerk authentication)
    if (request.headers.get('x-request-source') === 'web') {
      try {
        // Use server-side auth check
        const user = await currentUser();
        const clerkUserId = user?.id;
        
        if (!clerkUserId || clerkUserId !== userId) {
          console.warn("[validateAuthToken] Invalid Clerk session");
          return {
            error: "Invalid authentication",
            status: 403
          };
        }
      } catch (error) {
        console.error("[validateAuthToken] Clerk auth error:", error);
        return {
          error: "Authentication failed",
          status: 401
        };
      }
    } else {
      // For extension requests (custom token validation)
      const storedToken = await Database.userService.getUserToken(userId);

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

      if (!isValid) {
        console.warn("[validateAuthToken] Token mismatch");
        return {
          error: "Invalid authentication token",
          status: 403
        };
      }
    }

    // Check and update device information
    try {
      const browser = request.headers.get('x-device-browser') || 'Unknown Browser';
      const os = request.headers.get('x-device-os') || 'Unknown OS';
      const source = (request.headers.get('x-request-source') || request.headers.get('x-client-type') || 'unknown') as 'web' | 'extension' | 'unknown';

      
      await Devices.handleDeviceCheck(userId, browser, os, source);
    } catch (error) {
      console.error("[validateAuthToken] Device check failed:", error);
      // Continue with authentication even if device check fails
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
