import type { Metadata } from "next";
import { ComingSoon } from "@/components/coming-soon";

export const metadata: Metadata = { title: "Collection" };

export default function CollectionPage() {
  return <ComingSoon title="Collection" phase={3} />;
}
