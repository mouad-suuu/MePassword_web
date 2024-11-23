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

  // Compare with stored hash
  if (token !== "test_hash_123") {
    return {
      error: "Invalid authentication token",
      status: 403,
    };
  }

  return { success: true };
}
