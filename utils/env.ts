export function validateEnv() {
  const requiredEnvVars = [
    "AUTH_KEY_HASH",
    "JWT_SECRET",
    "ENCRYPTION_KEY",
    "DATABASE_URL",
    "STORAGE_PATH",
  ];

  const missingVars = requiredEnvVars.filter((envVar) => !process.env[envVar]);

  if (missingVars.length > 0) {
    throw new Error(
      `Missing required environment variables: ${missingVars.join(", ")}`
    );
  }
}
