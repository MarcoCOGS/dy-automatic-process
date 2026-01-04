export const ServerConfig = {
  appName: process.env.APP_NAME ?? '',
  appUrl: process.env.APP_URL ?? '',
  maxFailedAttempts: parseInt(process.env.MAX_FAILED_ATTEMPTS ?? '5'),
  redisPath: process.env.REDIS_PATH ?? '',
  sendGridApiKey: process.env.SEND_GRID_API_KEY ?? '',
  sendGridDefaultFrom: process.env.SEND_GRID_DEFAULT_FROM ?? '',
} as const;
