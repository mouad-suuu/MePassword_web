import Database from "../services/database";

async function runMaintenance() {
  try {

    // Cleanup inactive devices (30 days)
    await Database.deviceService.cleanupInactiveDevices(30);

    process.exit(0);
  } catch (error) {
    console.error("Error during maintenance:", error);
    process.exit(1);
  }
}

runMaintenance();
