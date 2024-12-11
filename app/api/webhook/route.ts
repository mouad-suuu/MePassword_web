import { NextRequest, NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser, ensureDatabaseInitialized, recreateDatabase, performMaintenanceTasks } from "../../../utils/database";
import { headers } from "next/headers";

console.log("🌐 Webhook Route Initialized");
console.log("Webhook Secret:", process.env.WEBHOOK_SECRET ? "✅ Present" : "❌ Missing");

const webhookSecret = process.env.WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  console.log("🚀 Webhook POST method called");

  try {
    // Ensure database is initialized with latest schema
    console.log("🔒 Ensuring database initialization");
    await recreateDatabase();

    console.log("📋 Extracting webhook headers");
    const headerPayload = await headers(); // Added await here
    const svixId = headerPayload.get("svix-id");
    const svixTimestamp = headerPayload.get("svix-timestamp");
    const svixSignature = headerPayload.get("svix-signature");

    console.log("🔍 Webhook Headers:", {
      svixId: svixId ? "✅ Present" : "❌ Missing",
      svixTimestamp: svixTimestamp ? "✅ Present" : "❌ Missing",
      svixSignature: svixSignature ? "✅ Present" : "❌ Missing"
    });

    if (!svixId || !svixTimestamp || !svixSignature) {
      console.error("❌ Missing required Svix headers");
      return new NextResponse("Error occured -- no svix headers", {
        status: 400
      });
    }

    if (!webhookSecret) {
      console.error("❌ Missing Webhook Secret");
      return new NextResponse("Error occured -- no webhook secret", {
        status: 400
      });
    }

    const payload = await req.json();
    const body = JSON.stringify(payload);

    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      }) as WebhookEvent;
    } catch (err) {
      console.error("❌ Error verifying webhook:", err);
      return new NextResponse("Error occured", {
        status: 400
      });
    }

    // Type guard for user events
    if (!("email_addresses" in evt.data)) {
      console.log("ℹ️ Non-user event received:", evt.type);
      return new NextResponse("Success", { status: 200 });
    }

    const eventType = evt.type;
    const userData = evt.data as {
      id: string;
      email_addresses: { email_address: string }[];
      first_name?: string;
      last_name?: string;
      username?: string;
      image_url?: string;
    };

    console.log(`📥 Processing webhook event: ${eventType}`);

    // Run maintenance tasks before processing new events
    try {
      console.log("🧹 Running maintenance tasks");
      await performMaintenanceTasks();
    } catch (error) {
      console.error("⚠️ Maintenance tasks failed:", error);
      // Continue processing even if maintenance fails
    }

    if (eventType === "user.created" || eventType === "user.updated") {
      const email = userData.email_addresses?.[0]?.email_address;
      if (!email) {
        console.error("❌ No email found in webhook payload");
        return new NextResponse("No email found in webhook payload", {
          status: 400
        });
      }

      await createUser(
        userData.id,
        email,
        true,
        userData.first_name ?? "",
        userData.last_name ?? "",
        userData.username ?? "",
        userData.image_url ?? ""
      );

      console.log(`✅ User ${eventType === "user.created" ? "created" : "updated"} successfully`);
      return new NextResponse("Success", { status: 200 });
    }

    if (eventType === "user.deleted") {
      await deleteUser(userData.id);
      console.log("✅ User deleted successfully");
      return new NextResponse("Success", { status: 200 });
    }

    console.log("ℹ️ Unhandled webhook event type:", eventType);
    return new NextResponse("Unhandled webhook event type", { status: 400 });

  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return new NextResponse("Error occured", {
      status: 400
    });
  }
}