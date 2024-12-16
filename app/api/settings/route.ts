import { NextRequest, NextResponse } from "next/server";
import { readSettings, writeSettings, createUser } from "../../../utils/database";
import { APISettingsPayload } from "../../../types";
import { validateSecurityHeaders } from "../../middleware/security";

export async function GET(request: NextRequest) {
  try {
    // Validate security headers first
    const securityResult = await validateSecurityHeaders(request);
    if ("error" in securityResult) {
      console.error("[GET] /api/settings - Security validation failed:", securityResult.error);
      return NextResponse.json(
        { error: securityResult.error },
        { status: securityResult.status }
      );
    }

    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Read settings
    let settings = await readSettings(userId);

    // If no settings exist, create default settings
    if (!settings || Object.keys(settings).length === 0) {
      const defaultSettings: APISettingsPayload = {
        userId,
        publicKey: '',  // Will be set later
        password: '',   // Will be set later
        deviceId: '',   // Will be set later
        timestamp: Date.now(),
        sessionSettings: {
          autoLockTime: 5,
          biometricVerification: false,
          sessionTime: 5,
          pushNotifications: true,
          biometricType: "fingerprint"
        }
      };

      await writeSettings(defaultSettings);
      settings = defaultSettings;
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

export async function HEAD(request: NextRequest) {
  try {
    // // Validate security headers first
    // const securityResult = await validateSecurityHeaders(request);
    // if ("error" in securityResult) {
    //   console.error("[HEAD] /api/settings - Security validation failed:", securityResult.error);
    //   return NextResponse.json(
    //     { error: securityResult.error },
    //     { status: securityResult.status }
    //   );
    // }

    // Get userId from query parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // Read settings
    const settings = await readSettings(userId);
    
    // Return 200 if settings exist, 404 if they don't
    return new NextResponse(null, { 
      status: settings && Object.keys(settings).length > 0 ? 200 : 404 
    });
  } catch (error) {
    console.error("Settings check error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Validate security headers first
    const securityResult = await validateSecurityHeaders(request);
    if ("error" in securityResult) {
      console.error("[POST] /api/settings - Security validation failed:", securityResult.error);
      return NextResponse.json(
        { error: securityResult.error },
        { status: securityResult.status }
      );
    }

    console.log("Settings POST: Starting to process request");
    
    // Parse and validate request body
    let body: APISettingsPayload;
    try {
      body = await request.json();
      console.log("Settings POST: Request body parsed", { 
        hasUserId: !!body.userId,
        hasPublicKey: !!body.publicKey,
        hasPassword: !!body.password
      });
    } catch (error) {
      console.error("Settings POST: JSON parse error", error);
      return NextResponse.json(
        { error: "Invalid request body" },
        { status: 400 }
      );
    }

    // Validate required fields
    const requiredFields = ['userId', 'publicKey', 'password', 'deviceId', 'timestamp'];
    const missingFields = requiredFields.filter(field => !body[field]);
    
    if (missingFields.length > 0) {
      console.error("Settings POST: Missing required fields", missingFields);
      return NextResponse.json(
        { error: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    try {
      // Create user if they don't exist yet (webhook might be delayed)
      const tempEmail = `temp_${body.userId}@mepassword.temp`;
      await createUser(
        body.userId,
        tempEmail,
        true,
        "",
        "",
        "",
        ""
      );
      console.log("Settings POST: Created temporary user");
    } catch (error) {
      // If error is not about duplicate user, rethrow it
      if (!(error instanceof Error) || !error.message.includes('duplicate key value')) {
        throw error;
      }
      console.log("Settings POST: User already exists");
    }

    console.log("Settings POST: Writing settings to database");
    // Write settings
    await writeSettings(body);
    console.log("Settings POST: Settings written successfully");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Settings POST: Error occurred:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Validate security headers first
    const securityResult = await validateSecurityHeaders(request);
    if ("error" in securityResult) {
      console.error("[PUT] /api/settings - Security validation failed:", securityResult.error);
      return NextResponse.json(
        { error: securityResult.error },
        { status: securityResult.status }
      );
    }

    console.log("Settings PUT: Starting to process request");
    
    // Get userId from request body
    let body: Partial<APISettingsPayload>;
    try {
      const rawBody = await request.text();
      console.log("Settings PUT: Raw request body:", rawBody);
      
      body = JSON.parse(rawBody);
      console.log("Settings PUT: Parsed body:", {
        hasUserId: !!body.userId,
        userId: body.userId,
        hasPublicKey: !!body.publicKey,
        hasSessionSettings: !!body.sessionSettings,
        hasDeviceId: !!body.deviceId,
        hasTimestamp: !!body.timestamp
      });
    } catch (error) {
      console.error("Settings PUT: JSON parse error", error);
      return NextResponse.json(
        { error: "Invalid request body", details: error instanceof Error ? error.message : "Unknown error" },
        { status: 400 }
      );
    }

    if (!body.userId) {
      console.error("Settings PUT: Missing userId in request body");
      return NextResponse.json(
        { error: "userId is required in request body" },
        { status: 400 }
      );
    }

    // Read current settings
    console.log("Settings PUT: Reading current settings for userId:", body.userId);
    const currentSettings = await readSettings(body.userId);

    // Merge settings if they exist
    const updatedSettings: APISettingsPayload = {
      userId: body.userId,
      publicKey: body.publicKey || currentSettings?.publicKey,
      password: body.password || currentSettings?.password,
      deviceId: body.deviceId || currentSettings?.deviceId,
      timestamp: body.timestamp || Date.now(),
      sessionSettings: body.sessionSettings || currentSettings?.sessionSettings
    };

    console.log("Settings PUT: Writing merged settings to database");
    await writeSettings(updatedSettings);
    console.log("Settings PUT: Settings updated successfully");

    return NextResponse.json({
      success: true,
      message: "Settings updated successfully"
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
