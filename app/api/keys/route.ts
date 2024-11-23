import { NextRequest, NextResponse } from "next/server";
import { readStorage, writeStorage } from "../../../utils/storage";
import { EncryptedPassword } from "../../../types";
import { validateAuthToken } from "../../../middleware/auth";

export async function GET(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const storage = await readStorage();
    return NextResponse.json({ keys: storage.keys });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch keys" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const body: EncryptedPassword = await request.json();

    if (!body.id || !body) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const storage = await readStorage();

    // Add metadata
    const keyEntry: EncryptedPassword = {
      ...body,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: 1,
    };

    storage.keys.push(keyEntry);
    await writeStorage(storage);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to save key" }, { status: 500 });
  }
}
