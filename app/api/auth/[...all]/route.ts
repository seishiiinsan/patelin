import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Sign-in, OAuth callbacks, sign-out and account deletion, all handled by Better Auth.
export const { GET, POST } = toNextJsHandler(auth);
