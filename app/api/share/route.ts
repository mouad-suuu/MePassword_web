import { NextRequest, NextResponse } from "next/server";

import Database from "../../../services/database";
import { EncryptedPassword } from "../../../types";

export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { 
      recipientEmail, 
      items,
      type 
    }: {
      recipientEmail: string;
      items: EncryptedPassword[];
      type: 'passwords' | 'keys';
    } = body;

    if (!recipientEmail || !items || !type) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "Items must be a non-empty array" },
        { status: 400 }
      );
    }

    // Get recipient's user ID and public key
    const recipient = await Database.settingsService.getUserPublicKeyByEmail(recipientEmail);

    if (!recipient.publicKey) {
      return NextResponse.json(
        { error: "Recipient has not set up their encryption keys" },
        { status: 400 }
      );
    }

    // Share the items
    if (type === 'passwords') {
      await Database.passwordService.sharePasswords(recipient.userId, items, userId);
    } else {
      await Database.keyService.shareKeys(recipient.userId, items, userId);
    }

    return NextResponse.json({
      message: `Successfully shared ${items.length} ${type} with ${recipientEmail}`
    });
  } catch (error) {
    console.error("[POST /api/share] Error:", error);
    const message = error instanceof Error ? error.message : "Internal server error";
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
