import { NextRequest, NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix";
import { WebhookEvent } from "@clerk/nextjs/server";
import { createUser, deleteUser, initDatabase } from "../../../utils/database";
import { headers } from "next/headers";

// Add more verbose logging at the top
console.log("🌐 Webhook Route Initialized");
console.log("Webhook Secret:", process.env.WEBHOOK_SECRET ? "✅ Present" : "❌ Missing");

let isInitialized = false;
const webhookSecret = process.env.WEBHOOK_SECRET;

async function initializeDatabaseIfNeeded() {
  console.log("🔍 Attempting to initialize database");
  if (!isInitialized) {
    try {
      await initDatabase();
      isInitialized = true;
      console.log("✅ Database initialized successfully");
    } catch (error) {
      console.error("❌ Failed to initialize database:", error);
      throw error;
    }
  } else {
    console.log("ℹ️ Database already initialized");
  }
}

export async function POST(req: NextRequest) {
  console.log("🚀 Webhook POST method called");

  try {
    // Ensure database is initialized before processing webhook
    console.log("🔒 Ensuring database initialization");
    await initializeDatabaseIfNeeded();

    console.log("📋 Extracting webhook headers");
    const headerPayload = await headers();
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
      return new NextResponse("Error occurred -- no svix headers", {
        status: 400,
      });
    }

    console.log("📦 Parsing request payload");
    const payload = await req.json();
    const body = JSON.stringify(payload);

    console.log("🔐 Verifying webhook signature");
    const wh = new Webhook(webhookSecret);
    let evt: WebhookEvent;

    try {
      evt = wh.verify(body, {
        "svix-id": svixId,
        "svix-timestamp": svixTimestamp,
        "svix-signature": svixSignature,
      } as WebhookRequiredHeaders) as WebhookEvent;
      console.log("✅ Webhook signature verified successfully");
    } catch (err) {
      console.error("❌ Webhook verification failed:", err);
      return new NextResponse("Error occurred during verification", {
        status: 400,
      });
    }

    console.log("🎯 Processing webhook event:", evt.type);
    try {
      switch (evt.type) {
        case "user.created":
        case "user.updated":
          console.log("👤 User event detected");
          const userData = evt.data as {
            id: string;
            email_addresses: {
              email_address: string;
              id: string;
              verification?: { status: string };
            }[];
            primary_email_address_id: string;
            first_name?: string;
            last_name?: string;
            username?: string;
            image_url?: string;
          };

          console.log("📧 User Data:", {
            userId: userData.id,
            emailCount: userData.email_addresses.length,
            primaryEmailId: userData.primary_email_address_id
          });

          // Find primary email
          const primaryEmail = userData.email_addresses.find(
            (email) => email.id === userData.primary_email_address_id
          );

          if (!primaryEmail) {
            console.error("❌ No primary email found");
            throw new Error("No primary email found");
          }

          console.log("🚀 Creating/Updating user in database");
          // Create or update user in the database
          await createUser(
            userData.id, 
            primaryEmail.email_address,
            primaryEmail.verification?.status === "verified",
            userData.first_name || '',
            userData.last_name || '',
            userData.username || '',
            userData.image_url || ''
          );
          console.log("✅ User processed successfully");
          break;

        case "user.deleted":
          await deleteUser(evt.data.id);
          console.log(`🗑️ User deleted: ${evt.data.id}`);
          break;

        case "email.created":
          console.log("📬 Email created event received:", evt.data);
          break;

        default:
          console.log("❓ Unhandled webhook event type:", evt.type);
      }

      console.log("🎉 Webhook processed successfully");
      return new NextResponse("Webhook processed successfully", {
        status: 200,
      });
    } catch (error) {
      console.error("❌ Error processing webhook:", error);
      return new NextResponse("Error occurred during processing", {
        status: 400,
      });
    }
  } catch (globalError) {
    console.error("🚨 Global error in webhook handler:", globalError);
    return new NextResponse("Unexpected error occurred", {
      status: 500,
    });
  }
}