import { createAuthClient } from "better-auth/react";

// Browser-side auth calls (sign in, sign out, delete account) on the same origin.
export const authClient = createAuthClient();
