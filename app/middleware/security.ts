import { NextRequest } from "next/server";
import { validateAuthToken } from "./validateAuthToken";

export async function validateSecurityHeaders(request: NextRequest) {
  const requiredHeaders = [
    'Authorization',
    'X-Timestamp',
    'X-Nonce',
    'X-Signature',
    'X-User-ID',
  ];

  // Check required headers
  for (const header of requiredHeaders) {
    if (!request.headers.get(header)) {
      return {
        error: `Missing required header: ${header}`,
        status: 401
      };
    }
  }

  // Validate timestamp (prevent replay attacks)
  const timestamp = request.headers.get('X-Timestamp');
  const requestTime = new Date(timestamp!).getTime();
  const currentTime = Date.now();
  if (Math.abs(currentTime - requestTime) > 300000) { // 5 minutes
    return {
      error: 'Request timestamp too old',
      status: 401
    };
  }

  // Validate auth token
  const tokenValidation = await validateAuthToken(request);
  if ("error" in tokenValidation) {
    return tokenValidation;
  }

  // Validate signature
  const signature = request.headers.get('X-Signature');
  // TODO: Add signature validation logic here

  return { valid: true };
}