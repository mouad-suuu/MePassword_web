import { NextRequest, NextResponse } from "next/server";
import  Database  from "../../../../services/database";
import { validateAuthToken } from "../../../../middleware/auth";
import { validateSecurityHeaders } from "../../../middleware/security";

interface ValidatePasswordPayload {
  NewEncryptedPassword: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validate security headers
    const securityResult = await validateSecurityHeaders(request);
    if ("error" in securityResult) {
      return NextResponse.json(
        { error: securityResult.error },
        { status: securityResult.status }
      );
    }

    // Get userId from headers
    const headers = request.headers;
    const userId = headers.get('X-User-ID');
    
    console.log("Received validation request for user:", userId);

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required in headers" },
        { status: 400 }
      );
    }

    // Parse and validate request body
    let body: ValidatePasswordPayload;
    try {
      body = await request.json();
      console.log("Received password payload:", body);
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!body.NewEncryptedPassword) {
      return NextResponse.json(
        { error: "NewEncryptedPassword is required" },
        { status: 400 }
      );
    }

    const settings = await Database.settingsService.readSettings(userId);
    // Direct comparison of encrypted passwords
    const isValid = settings?.password === body.NewEncryptedPassword;

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error("Password validation error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}