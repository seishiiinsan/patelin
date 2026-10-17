import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Market" };

export default function MarketPage() {
  return <ComingSoon title="Market" phase={6} />;
}
