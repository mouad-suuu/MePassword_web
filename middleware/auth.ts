import { NextRequest } from "next/server";
import { validateEnv } from "../utils/env";
export async function validateAuthToken(request: NextRequest) {
  validateEnv();
  const authHeader = request.headers.get("Authorization");
  const authToken = process.env.AUTH_KEY_HASH;

  if (!authToken) {
    console.error("AUTH_KEY_HASH environment variable is not set");
    return {
      error: "Server authentication configuration error",
      status: 500,
    };
  }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return {
      error: "Missing or invalid authorization header",
      status: 401,
    };
  }

  const token = authHeader.split(" ")[1];

  // Compare with stored hash
  if (token !== authToken) {
    return {
      error: "Invalid authentication token",
      status: 403,
    };
  }

  return { success: true };
}
