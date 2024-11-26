import { NextRequest, NextResponse } from "next/server";
import { Database } from "../../../utils/database";
import { EncryptedPassword } from "../../../types";
import { validateAuthToken } from "../../../middleware/auth";

export async function GET(request: NextRequest) {
  try {
    // Validate authentication
    const authResult = await validateAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Fetch keys from database
    const keys = await Database.readKeys();

    // Log the read access

    return NextResponse.json({ keys });
  } catch (error) {
    console.error("Failed to fetch keys:", error);

    // Log the error
    try {
      await Database.writeAuditLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        action: "read",
        userId: "unknown",
        resourceType: "key",
        resourceId: "all",
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
      { error: "Failed to fetch keys" },
      { status: 500 }
    );
  }
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
    let body: Partial<EncryptedPassword>;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    // Validate required fields
    if (!body.id || !body.website || !body.user || !body.password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Create the key entry with metadata
    const keyEntry: EncryptedPassword = {
      ...(body as EncryptedPassword),
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: 1,
      strength: body.strength || "medium", // Default strength
      MetaData: {
        id: body.id,
        createdAt: Date.now(),
        modifiedAt: Date.now(),
        lastAccessed: Date.now(),
        version: 1,
        strength: body.strength || "medium",
      },
    };

    // Save to database
    await Database.writekeys(keyEntry);

    return NextResponse.json({
      success: true,
      key: keyEntry,
    });
  } catch (error) {
    console.error("Failed to save key:", error);

    // Log the error
    try {
      await Database.writeAuditLog({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        action: "create",
        userId: "unknown",
        resourceType: "key",
        resourceId: "unknown",
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
        error: "Failed to save key",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authResult = await validateAuthToken(request);
    if ("error" in authResult) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body: EncryptedPassword = await request.json();

    if (!body.id) {
      return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
    }

    const updatedKey: EncryptedPassword = {
      ...body,
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: (body.version || 1) + 1,
    };

    await Database.writekeys(updatedKey);

    return NextResponse.json({
      success: true,
      key: updatedKey,
    });
  } catch (error) {
    console.error("Failed to update key:", error);
    return NextResponse.json(
      { error: "Failed to update key" },
      { status: 500 }
    );
  }
}
