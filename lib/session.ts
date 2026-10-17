import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { cache } from "react";
import { auth } from "./auth";
import { prisma } from "./prisma";

// The signed-in player, or null. Reads request headers: render callers under <Suspense>.
// Cached per request, so a layout and a page can both ask without a second query.
export const getCurrentUser = cache(async () => {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) return null;
  return prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, pseudo: true, createdAt: true, boostersOpened: true },
  });
});

// For pages and server actions open to any signed-in account, even without a pseudo yet.
export async function requireSignedIn() {
  const user = await getCurrentUser();
  if (!user) redirect("/connexion");
  return user;
}

// For everything else: a signed-in player who has chosen a pseudo.
export async function requirePlayer() {
  const user = await requireSignedIn();
  if (!user.pseudo) redirect("/bienvenue");
  return { ...user, pseudo: user.pseudo };
}
