import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GDPR right of access and portability: everything stored about the signed-in player, as JSON.
// OAuth tokens are left out: they are credentials, not personal data the player needs.
export async function GET(request: Request) {
  const session = await auth.api.getSession({ headers: request.headers });
  if (!session)
    return Response.json({ error: "Non connecté" }, { status: 401 });

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
    select: {
      pseudo: true,
      name: true,
      email: true,
      image: true,
      boostersOpened: true,
      createdAt: true,
      accounts: { select: { providerId: true, createdAt: true } },
      sessions: {
        select: {
          createdAt: true,
          expiresAt: true,
          ipAddress: true,
          userAgent: true,
        },
      },
    },
  });

  return Response.json(
    { exportedAt: new Date().toISOString(), user },
    {
      headers: {
        "Content-Disposition":
          'attachment; filename="patelin-mes-donnees.json"',
      },
    },
  );
}
