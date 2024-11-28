// app/api/settings/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../utils/database";
import { validateAuthToken } from "../../../middleware/auth";

let isInitialized = false;

async function initializeDatabaseIfNeeded() {
  if (!isInitialized) {
    try {
      await Database.initDatabase();
      isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize database:", error);
      throw error;
    }
  }
}
interface APISettingsPayload {
  publicKey: string;
  password: string;
  deviceId: string;
  timestamp: number;
}

export async function POST(request: NextRequest) {
  try {
    await initializeDatabaseIfNeeded();
    // Validate authentication
    const authResult = await validateAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Parse and validate request body
    let body: APISettingsPayload;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate required fields and types
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Request body must be an object" },
        { status: 400 }
      );
    }

    const validationErrors = [];
    if (typeof body.publicKey !== "string" || !body.publicKey) {
      validationErrors.push("publicKey must be a non-empty string");
    }
    if (typeof body.password !== "string" || !body.password) {
      validationErrors.push("password must be a non-empty string");
    }
    if (typeof body.deviceId !== "string" || !body.deviceId) {
      validationErrors.push("deviceId must be a non-empty string");
    }
    if (typeof body.timestamp !== "number" || isNaN(body.timestamp)) {
      validationErrors.push("timestamp must be a valid number");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // Write new settings
    await Database.writeSettings({
      publicKey: body.publicKey,
      password: body.password,
      deviceId: body.deviceId,
      timestamp: body.timestamp,
    });

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    await initializeDatabaseIfNeeded();
    // Validate authentication
    const authResult = await validateAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Read settings
    const settings = await Database.readSettings();

    if (!settings || Object.keys(settings).length === 0) {
      return NextResponse.json(
        { error: "Settings not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ settings });
  } catch (error) {
    console.error("Settings retrieval error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    await initializeDatabaseIfNeeded();
    // Validate authentication
    const authResult = await validateAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Read current settings
    const currentSettings = await Database.readSettings();

    // Check if settings exist
    if (!currentSettings || Object.keys(currentSettings).length === 0) {
      return NextResponse.json(
        { error: "Settings not found - use POST to create new settings" },
        { status: 404 }
      );
    }

    // Parse and validate request body
    let body: Partial<APISettingsPayload>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate body structure
    if (typeof body !== "object" || body === null) {
      return NextResponse.json(
        { error: "Request body must be an object" },
        { status: 400 }
      );
    }

    // Validate provided fields
    const validationErrors = [];
    if (
      "publicKey" in body &&
      (typeof body.publicKey !== "string" || !body.publicKey)
    ) {
      validationErrors.push("publicKey must be a non-empty string");
    }
    if (
      "password" in body &&
      (typeof body.password !== "string" || !body.password)
    ) {
      validationErrors.push("password must be a non-empty string");
    }
    if (
      "deviceId" in body &&
      (typeof body.deviceId !== "string" || !body.deviceId)
    ) {
      validationErrors.push("deviceId must be a non-empty string");
    }
    if (
      "timestamp" in body &&
      (typeof body.timestamp !== "number" || isNaN(body.timestamp))
    ) {
      validationErrors.push("timestamp must be a valid number");
    }

    if (validationErrors.length > 0) {
      return NextResponse.json(
        { error: "Validation failed", details: validationErrors },
        { status: 400 }
      );
    }

    // Update settings with new values
    const updatedSettings = {
      ...currentSettings,
      ...body,
    };

    // Write updated settings
    await Database.writeSettings(updatedSettings);

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully",
      settings: updatedSettings,
    });
  } catch (error) {
    console.error("Settings update error:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
