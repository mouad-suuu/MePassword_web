import { NextRequest, NextResponse } from "next/server";
import Database from "../../../services/database";
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
    let settings = await Database.settingsService.readSettings(userId);

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

      await Database.settingsService.writeSettings(defaultSettings);
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
    const settings = await Database.settingsService.readSettings(userId);
    
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

    
    // Parse and validate request body
    let body: APISettingsPayload;
    try {
      body = await request.json();
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
      await Database.userService.createUser(
        body.userId,
        tempEmail,
        true,
        "",
        "",
        "",
        ""
      );
    } catch (error) {
      // If error is not about duplicate user, rethrow it
      if (!(error instanceof Error) || !error.message.includes('duplicate key value')) {
        throw error;
      }
    }

    // Write settings
    await Database.settingsService.writeSettings(body);
    
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

    
    // Get userId from request body
    let body: Partial<APISettingsPayload>;
    try {
      const rawBody = await request.text();
      
      body = JSON.parse(rawBody);
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
    const currentSettings = await Database.settingsService.readSettings(body.userId);

    // Merge settings if they exist
    const updatedSettings: APISettingsPayload = {
      userId: body.userId,
      publicKey: body.publicKey || currentSettings?.publicKey,
      password: body.password || currentSettings?.password,
      deviceId: body.deviceId || currentSettings?.deviceId,
      timestamp: body.timestamp || Date.now(),
      sessionSettings: body.sessionSettings || currentSettings?.sessionSettings
    };

    await Database.settingsService.writeSettings(updatedSettings);

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
