import "dotenv/config";

export const ENV = {
  forgeApiKey: process.env.OPENAI_API_KEY ?? process.env.FORGE_API_KEY ?? "",
  forgeApiUrl: process.env.FORGE_API_URL ?? "",
  jwtSecret: process.env.JWT_SECRET ?? "dev-secret-change-in-production",
  oauthPortalUrl: process.env.EXPO_PUBLIC_OAUTH_PORTAL_URL ?? "",
  oauthServerUrl: process.env.EXPO_PUBLIC_OAUTH_SERVER_URL ?? "",
  appId: process.env.EXPO_PUBLIC_APP_ID ?? "",
};
