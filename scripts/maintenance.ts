import { cleanupInactiveDevices } from "../utils/database";

async function runMaintenance() {
  try {
    console.log("Starting maintenance tasks...");

    // Cleanup inactive devices (30 days)
    await cleanupInactiveDevices(30);

    console.log("Maintenance tasks completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error during maintenance:", error);
    process.exit(1);
  }
}

runMaintenance();
