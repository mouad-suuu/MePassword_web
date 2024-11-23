import { NextRequest, NextResponse } from "next/server";
import { readStorage } from "../../../../utils/storage";
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

    // Read storage and compare passwords
    const storage = await readStorage();

    if (!storage.settings?.password) {
      return NextResponse.json(
        { error: "No password configured" },
        { status: 404 }
      );
    }

    const isValid = body.password === storage.settings.password;

    return NextResponse.json({ isValid });
  } catch (error) {
    console.error("Password validation error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
