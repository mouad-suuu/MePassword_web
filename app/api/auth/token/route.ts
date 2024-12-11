import { NextRequest, NextResponse } from "next/server";
import { updateUserToken } from "../../../../utils/database";

interface TokenUpdatePayload {
  userId: string;
  token: string;
  email: string;
}

export async function POST(request: NextRequest) {
  try {
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

    // Clean up token (remove Bearer prefix and trim)
    const token = body.token.replace(/^Bearer\s+/i, '').trim();

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
