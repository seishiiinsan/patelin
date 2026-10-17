import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Profil" };

export default function ProfilPage() {
  return <ComingSoon title="Profil" phase={2} />;
}
