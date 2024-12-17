import { NextRequest, NextResponse } from "next/server";
import { checkAndUpdateDevice } from "../../../../middleware/devices";
import  Database  from "../../../../services/database";

interface TokenUpdatePayload {
  userId: string;
  token: string;
  email: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  imageUrl?: string;
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    let body: TokenUpdatePayload;
    try {
      body = await request.json();
      console.log("[POST] /api/auth/token - Request received:", {
        userId: body.userId,
        headers: Object.fromEntries(request.headers)
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
      console.warn("[POST] /api/auth/token - Missing required fields");
      return NextResponse.json(
        { error: "userId, token, and email are required" },
        { status: 400 }
      );
    }

    // Clean up token (remove Bearer prefix and trim)
    const token = body.token.replace(/^Bearer\s+/i, '').trim();

    // First create/update the user
    await Database.userService.createUser(
      body.userId,
      body.email,
      true, // verification
      body.firstName || '',
      body.lastName || '',
      body.username || '',
      body.imageUrl || '',
      token // Pass the token here
    );

    // Then update the token (this ensures token fields are set correctly)
    await Database.userService.updateUserToken(body.userId, token);
    console.log("[POST] /api/auth/token - Token updated successfully");

    try {
      // Track device information
      await checkAndUpdateDevice(request);
      console.log("[POST] /api/auth/token - Device tracking completed");
    } catch (deviceError) {
      // Log device tracking error but don't fail the request
      console.error("[POST] /api/auth/token - Device tracking failed:", deviceError);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[POST] /api/auth/token - Error:", error);
    return NextResponse.json(
      { error: "Failed to update token" },
      { status: 500 }
    );
  }
}
