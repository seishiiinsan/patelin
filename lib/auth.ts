import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { logger } from "./logger";
import { prisma } from "./prisma";

// Email + password sign-in, only for local development and the end-to-end tests:
// players sign in with Google or Discord. Never set AUTH_DEV_LOGIN in production.
export const devLoginEnabled = process.env.AUTH_DEV_LOGIN === "true";
if (
  devLoginEnabled &&
  process.env.NODE_ENV === "production" &&
  !process.env.CI
) {
  logger.warn(
    "AUTH_DEV_LOGIN is on in production: anyone can create a password account",
  );
}

// A provider is offered only when its OAuth credentials are configured.
function oauthCredentials(prefix: "GOOGLE" | "DISCORD") {
  const clientId = process.env[`${prefix}_CLIENT_ID`];
  const clientSecret = process.env[`${prefix}_CLIENT_SECRET`];
  return clientId && clientSecret ? { clientId, clientSecret } : undefined;
}

const google = oauthCredentials("GOOGLE");
const discord = oauthCredentials("DISCORD");

export type SocialProvider = "google" | "discord";
export const socialProviders: SocialProvider[] = [
  ...(google ? (["google"] as const) : []),
  ...(discord ? (["discord"] as const) : []),
];

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  // In development the app may run on any local port (3000 is often taken).
  trustedOrigins:
    process.env.NODE_ENV === "production" ? [] : ["http://localhost:*"],
  emailAndPassword: { enabled: devLoginEnabled },
  // Better Auth limits sign-in attempts per IP in production. The end-to-end tests sign up many
  // accounts from one IP in parallel, so their server turns the limit off.
  ...(process.env.AUTH_DISABLE_RATE_LIMIT === "true" && {
    rateLimit: { enabled: false },
  }),
  socialProviders: {
    ...(google && { google }),
    ...(discord && { discord }),
  },
  user: {
    // Players can delete their account from the profile page (GDPR right to erasure).
    deleteUser: { enabled: true },
  },
  // Must stay last: sets the session cookie from server actions.
  plugins: [nextCookies()],
});
