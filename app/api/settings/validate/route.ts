import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../../utils/database";
import { validateAuthToken } from "../../../../middleware/auth";

interface ValidatePasswordPayload {
  password: string;
}

export async function POST(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Parse and validate request body
    let body: ValidatePasswordPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate password field
    if (typeof body.password !== "string" || !body.password) {
      return NextResponse.json(
        { error: "password must be a non-empty string" },
        { status: 400 }
      );
    }

    // Read settings from database
    const settings = await Database.readSettings();

    if (!settings?.password) {
      return NextResponse.json(
        { error: "No password configured" },
        { status: 404 }
      );
    }

    const isValid = body.password === settings.password;

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error("Password validation error:", error);

    // Log the error in audit logs
    try {
      await Database.writeAuditLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        action: "login",
        userId: "unknown", // Or get from authResult if available
        resourceType: "password",
        resourceId: "master-password",
        metadata: {
          ip: request.headers.get("x-forwarded-for") || "unknown",
          userAgent: request.headers.get("user-agent") || "unknown",
          success: false,
          failureReason:
            error instanceof Error ? error.message : "Unknown error",
        },
      });
    } catch (logError) {
      console.error("Failed to log audit entry:", logError);
    }

    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
