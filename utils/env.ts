export function validateEnv() {
  const requiredEnvVars = [
    "AUTH_KEY_HASH",
    "BLOB_READ_WRITE_TOKEN",
    "EDGE_CONFIG",
    "EDGE_CONFIG_ID",
    "VERCEL_TOKEN",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}
