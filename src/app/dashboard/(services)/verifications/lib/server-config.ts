export const ServerConfig = {
  apiVerificationsBaseUrl: process.env.API_VERIFICATIONS_BASE_URL ?? '',
  apiVerificationsUsername: process.env.API_VERIFICATIONS_USERNAME ?? '',
  apiVerificationsPassword: process.env.API_VERIFICATIONS_PASSWORD ?? '',
} as const;
