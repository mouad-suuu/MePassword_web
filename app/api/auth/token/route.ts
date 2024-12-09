import { NextRequest, NextResponse } from "next/server";
import { updateUserToken } from "../../../../utils/database";
import { validateSecurityHeaders } from "../../../middleware/security";

interface TokenUpdatePayload {
  userId: string;
  token: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validate security headers
    const securityResult = await validateSecurityHeaders(request);
    if ("error" in securityResult) {
      console.error("[POST] /api/auth/token - Security validation failed:", securityResult.error);
      return NextResponse.json(
        { error: securityResult.error },
        { status: securityResult.status }
      );
    }

    // Parse request body
    let body: TokenUpdatePayload;
    try {
      body = await request.json();
      console.log("[POST] /api/auth/token - Received request:", {
        hasUserId: !!body?.userId,
        hasToken: !!body?.token,
        hasEmail: !!body?.email,
        tokenLength: body?.token?.length
      });
    } catch (error) {
      console.error("[POST] /api/auth/token - Invalid JSON:", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.userId || !body.token || !body.email) {
      console.error("[POST] /api/auth/token - Missing required fields");
      return NextResponse.json(
        { error: "userId, token, and email are required" },
        { status: 400 }
      );
    }

    // Basic validation of token format
    if (!body.token.startsWith('Bearer ')) {
      console.error("[POST] /api/auth/token - Invalid token format");
      return NextResponse.json(
        { error: "Invalid token format" },
        { status: 400 }
      );
    }

    // Validate that the token in the body matches the Authorization header
    const authHeader = request.headers.get('Authorization');
    if (body.token !== authHeader) {
      console.error("[POST] /api/auth/token - Token mismatch:", {
        bodyToken: body.token,
        headerToken: authHeader
      });
      return NextResponse.json(
        { error: "Token in body does not match Authorization header" },
        { status: 400 }
      );
    }

    // Extract actual token
    const token = body.token.split(' ')[1];

    // Update token in database
    await updateUserToken(body.userId, token);
    console.log("[POST] /api/auth/token - Token updated successfully");

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST] /api/auth/token - Error:", error);
    return NextResponse.json(
      { error: "Failed to update token" },
      { status: 500 }
    );
  }
}
