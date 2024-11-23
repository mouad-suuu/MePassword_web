import { NextRequest } from "next/server";

export async function validateAuthToken(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: "Missing or invalid authorization header",
      status: 401,
    };
  }

  const token = authHeader.split(" ")[1];
  const authToken = process.env.AUTH_KEY_HASH;
  // Compare with stored hash
  if (token !== authToken) {
    return {
      error: "Invalid authentication token",
      status: 403,
    };
  }

  return { success: true };
}
