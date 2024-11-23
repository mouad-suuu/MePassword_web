export function validateEnv() {
  const requiredEnvVars = [
    "AUTH_KEY_HASH",
    "BLOB_READ_WRITE_TOKEN",
    "EDGE_CONFIG",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}
