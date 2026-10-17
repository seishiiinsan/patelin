import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TIERS, type Tier } from "@/lib/tiers";

export const metadata: Metadata = { title: "Styleguide" };

function populationRange(tier: Tier, index: number) {
  const next = TIERS[index + 1];
  const format = (n: number) => n.toLocaleString("fr-FR");
  if (!next) return `${format(tier.minPopulation)} hab. et plus`;
  if (tier.minPopulation === 0)
    return `moins de ${format(next.minPopulation)} hab.`;
  return `${format(tier.minPopulation)} à ${format(next.minPopulation)} hab.`;
}

// Development-only page that shows the design tokens.
export default function StyleguidePage() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <div className="flex flex-col gap-6">
      <h1 className="font-display text-3xl font-semibold">Styleguide</h1>
      <section className="flex flex-col gap-3">
        <h2 className="font-display text-xl font-semibold">Tiers de rareté</h2>
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {TIERS.map((tier, index) => (
            <li
              key={tier.key}
              className="rounded-2xl p-4 text-white shadow-sm"
              style={{ backgroundColor: `var(--color-tier-${tier.key})` }}
            >
              <p className="font-display text-lg font-semibold">{tier.label}</p>
              <p className="text-sm">{populationRange(tier, index)}</p>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
