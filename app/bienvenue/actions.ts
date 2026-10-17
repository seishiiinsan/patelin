"use server";

import { redirect } from "next/navigation";
import { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { validatePseudo } from "@/lib/pseudo";
import { requireSignedIn } from "@/lib/session";

export type ChoosePseudoState = { error: string | null };

export async function choosePseudo(
  _previous: ChoosePseudoState,
  formData: FormData,
): Promise<ChoosePseudoState> {
  const user = await requireSignedIn();
  // The pseudo is chosen once; changing it later is not part of the game yet.
  if (user.pseudo) redirect("/profil");

  const check = validatePseudo(String(formData.get("pseudo") ?? ""));
  if (!check.ok) return { error: check.error };

  try {
    await prisma.user.update({
      where: { id: user.id },
      data: { pseudo: check.pseudo, pseudoKey: check.key },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return { error: "Ce pseudo est déjà pris." };
    }
    throw error;
  }
  redirect("/profil");
}
