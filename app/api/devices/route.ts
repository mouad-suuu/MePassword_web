import { NextRequest, NextResponse } from "next/server";
import { validateSecurityHeaders } from "../../../middleware/security";
import { deactivateAllDevices, getUserDevices, deactivateDevice } from "../../../utils/database";
import { Device } from "../../../types";

// GET /api/devices - List all devices for a user
export async function GET(request: NextRequest) {
  try {
    const validation = await validateSecurityHeaders(request);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const userId = request.headers.get('x-user-id') || 
                  request.nextUrl.searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const devices = await getUserDevices(userId);
    return NextResponse.json({ devices });
  } catch (error) {
    console.error('[GET /api/devices] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST /api/devices - Deactivate a device or all devices
export async function POST(request: NextRequest) {
  try {
    const validation = await validateSecurityHeaders(request);
    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: validation.status });
    }

    const userId = request.headers.get('x-user-id');
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const body = await request.json();
    const { action, deviceId } = body;

    if (action === 'deactivate') {
      if (!deviceId) {
        return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
      }
      await deactivateDevice(deviceId);
      return NextResponse.json({ success: true });
    } else if (action === 'deactivateAll') {
      await deactivateAllDevices(userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[POST /api/devices] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    );
  }
}
