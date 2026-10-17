import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Boosters" };

export default function BoostersPage() {
  return <ComingSoon title="Boosters" phase={3} />;
}
