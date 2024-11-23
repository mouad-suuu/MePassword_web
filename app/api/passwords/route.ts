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
    return NextResponse.json({ passwords: storage.passwords });
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch passwords" },
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
    const passwordEntry: EncryptedPassword = {
      ...body,
      createdAt: Date.now(),
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: 1,
    };

    storage.passwords.push(passwordEntry);
    await writeStorage(storage);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to save password" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
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

    if (!body.id) {
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const storage = await readStorage();
    const passwordIndex = storage.passwords.findIndex((p) => p.id === body.id);

    if (passwordIndex === -1) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    // Update metadata
    const updatedPassword: EncryptedPassword = {
      ...storage.passwords[passwordIndex],
      ...body,
      modifiedAt: Date.now(),
      lastAccessed: Date.now(),
      version: (storage.passwords[passwordIndex].version || 0) + 1,
    };

    storage.passwords[passwordIndex] = updatedPassword;
    await writeStorage(storage);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to update password" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  // Validate authentication
  const authResult = await validateAuthToken(request);
  if ("error" in authResult) {
    return NextResponse.json(
      { error: authResult.error },
      { status: authResult.status }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Missing password ID" },
        { status: 400 }
      );
    }

    const storage = await readStorage();
    const passwordIndex = storage.passwords.findIndex((p) => p.id === id);

    if (passwordIndex === -1) {
      return NextResponse.json(
        { error: "Password not found" },
        { status: 404 }
      );
    }

    storage.passwords.splice(passwordIndex, 1);
    await writeStorage(storage);

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "Failed to delete password" },
      { status: 500 }
    );
  }
}
