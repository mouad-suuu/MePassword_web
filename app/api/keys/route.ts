"use server"
import { NextRequest, NextResponse } from "next/server";
import { writeKeys , readKeys } from "../../../utils/database";
import { EncryptedPassword } from "../../../types";
import { validateAuthToken } from "../../../middleware/auth";

export async function GET(request: NextRequest, {params}: {params: Promise<{id: string}>}) {
  console.log('[GET] /api/keys - Start');
  
  try {
    const user_id = (await params).id
    console.log('[GET] User ID:', user_id);

    const authResult = await validateAuthToken(request);
    console.log('[GET] Auth validation result:', authResult);

    if ("error" in authResult) {
      console.log('[GET] Authentication failed');
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const keys = await readKeys(user_id);
    console.log('[GET] Successfully retrieved keys, count:', keys.length);

    return NextResponse.json({ keys });
  } catch (error) {
    console.error('[GET] Error occurred:', error);

    return NextResponse.json(
      { error: "Failed to fetch keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest,{params}: {params: Promise<{id: string}>}) {
  console.log('[POST] /api/keys - Start');

  try {
    const user_id = (await params).id
    console.log('[POST] User ID:', user_id);

    const authResult = await validateAuthToken(request);
    console.log('[POST] Auth validation result:', authResult);

    if ("error" in authResult) {
      console.log('[POST] Authentication failed');
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    let body: Partial<EncryptedPassword>;
    try {
      body = await request.json();
      console.log('[POST] Request body received:', { ...body, password: '[REDACTED]' });
    } catch {
      console.log('[POST] Invalid JSON payload');
      return NextResponse.json(
        { error: "Invalid JSON payload" },
        { status: 400 }
      );
    }

    if (!body.id || !body.website || !body.user || !body.password) {
      console.log('[POST] Missing required fields');
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

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

    await writeKeys(user_id,keyEntry);
    console.log('[POST] Successfully added new key');

    return NextResponse.json({
      success: true,
      key: keyEntry,
    });
  } catch (error) {
    console.error('[POST] Error occurred:', error);

    return NextResponse.json(
      {
        error: "Failed to save key",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest,{params}: {params: Promise<{id: string}>}) {
 
  try { 
    const user_id = (await params).id
    console.log('[PUT] User ID:', user_id);

    const authResult = await validateAuthToken(request);
    console.log('[PUT] Auth validation result:', authResult);

    if ("error" in authResult) {
      console.log('[PUT] Authentication failed');
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const body: EncryptedPassword = await request.json();
    console.log('[PUT] Request body received:', { ...body, password: '[REDACTED]' });

    if (!body.id) {
      console.log('[PUT] Missing key ID');
      return NextResponse.json({ error: "Missing key ID" }, { status: 400 });
    }

    const updatedKey: EncryptedPassword = {
      ...body,
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: (body.version || 1) + 1,
    };

    await writeKeys(user_id,updatedKey);
    console.log('[PUT] Successfully updated key');

    return NextResponse.json({
      success: true,
      key: updatedKey,
    });
  } catch (error) {
    console.error('[PUT] Error occurred:', error);
    return NextResponse.json(
      { error: "Failed to update key" },
      { status: 500 }
    );
  }
}
