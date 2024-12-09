import { NextRequest } from "next/server";
import { validateEnv } from "../utils/env";
import { getUserToken } from "../utils/database";

export async function validateAuthToken(request: NextRequest) {
  console.log("[validateAuthToken] Starting token validation");
  validateEnv();
  
  const authHeader = request.headers.get("Authorization");
  const userId = request.nextUrl.searchParams.get("userId");

  console.log("[validateAuthToken] Request details:", {
    hasAuthHeader: !!authHeader,
    authHeaderPreview: authHeader?.substring(0, 50),
    userId,
    method: request.method,
    url: request.url
  });

  if (!userId) {
    console.log("[validateAuthToken] Missing userId parameter");
    return {
      error: "Missing userId parameter",
      status: 400,
    };
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    console.log("[validateAuthToken] Invalid auth header:", {
      hasHeader: !!authHeader,
      startsWithBearer: authHeader?.startsWith("Bearer "),
    });
    return {
      error: "Missing or invalid authorization header",
      status: 401,
    };
  }

  try {
    const token = authHeader.split(" ")[1];
    console.log("[validateAuthToken] Extracted token:", {
      tokenLength: token?.length,
      tokenPreview: token?.substring(0, 50)
    });
    
    // Get the stored token from the database
    const storedToken = await getUserToken(userId);
    console.log("[validateAuthToken] Retrieved stored token:", {
      hasStoredToken: !!storedToken?.token,
      storedTokenLength: storedToken?.token?.length,
      storedTokenPreview: storedToken?.token?.substring(0, 50),
      isExpired: storedToken?.expired
    });

    if (!storedToken.token) {
      console.log("[validateAuthToken] No token found for user");
      return {
        error: "No token found for user",
        status: 401,
      };
    }

    if (storedToken.expired) {
      console.log("[validateAuthToken] Token has expired");
      return {
        error: "Token has expired",
        status: 401,
      };
    }

    // Compare with stored token
    const tokensMatch = token === storedToken.token;
    console.log("[validateAuthToken] Token comparison:", {
      tokensMatch,
      incomingTokenLength: token?.length,
      storedTokenLength: storedToken?.token?.length
    });

    if (!tokensMatch) {
      console.log("[validateAuthToken] Token mismatch");
      return {
        error: "Invalid authentication token",
        status: 403,
      };
    }

    console.log("[validateAuthToken] Token validation successful");
    return { 
      success: true,
      userId: userId
    };
  } catch (error) {
    console.error("[validateAuthToken] Error during validation:", {
      error,
      errorMessage: error?.message,
      stack: error?.stack
    });
    return {
      error: "Token validation failed",
      status: 401,
    };
  }
}
