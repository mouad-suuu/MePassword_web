import { NextRequest, NextResponse } from "next/server";
import Database from "../../../services/database";
import { Devices } from "../../../utils/device";
import { validateAuthToken } from "../../../middleware/auth";

// GET /api/devices - List all devices for a user
export async function GET(request: NextRequest) {
  try {
    const authResult = await validateAuthToken(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userId } = authResult;
    const devices = await Database.deviceService.getUserDevices(userId);
    return NextResponse.json({ devices });
  } catch (error) {
    console.error('[GET /api/devices] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch devices' },
      { status: 500 }
    );
  }
}

// POST /api/devices - Register, deactivate a device or all devices
export async function POST(request: NextRequest) {
  try {
    const authResult = await validateAuthToken(request);
    if ('error' in authResult) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { userId } = authResult;
    const body = await request.json();
    const { action, deviceId, browser, os, source } = body;

    if (action === 'register') {
      if (!browser || !os || !source) {
        return NextResponse.json({ error: 'Browser, OS, and source are required' }, { status: 400 });
      }
      const device = await Devices.handleDeviceCheck(userId, browser, os, source as 'web' | 'extension' | 'unknown');
      return NextResponse.json({ device });
    } else if (action === 'deactivate') {
      if (!deviceId) {
        return NextResponse.json({ error: 'Device ID is required' }, { status: 400 });
      }
      await Database.deviceService.deactivateDevice(deviceId);
      return NextResponse.json({ success: true });
    } else if (action === 'deactivateAll') {
      await Database.deviceService.deactivateAllDevices(userId);
      return NextResponse.json({ success: true });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error) {
    console.error('[POST /api/devices] Error:', error);
    return NextResponse.json(
      { error: 'Failed to process device action' },
      { status: 500 }
    );
  }
}
