import Link from "next/link";

const STEPS = [
  {
    title: "Ouvre des boosters",
    text: "5 cartes de communes par booster. Plus une commune est peuplée, plus sa carte est rare.",
  },
  {
    title: "Place les patelins",
    text: "La plus petite commune de chaque booster se place sur la carte de France, en 30 secondes.",
  },
  {
    title: "Complète tes sets",
    text: "Départements, régions, homonymes : échange tes doubles avec tes amis pour tout finir.",
  },
] as const;

export default function HomePage() {
  return (
    <div className="flex flex-col gap-10">
      <section className="flex flex-col items-start gap-4 pt-4">
        <h1 className="font-display text-5xl font-semibold text-brand">
          Patelin
        </h1>
        <p className="max-w-xl text-lg">
          Collectionne les 34 875 communes de France, de Paris au plus petit
          hameau.
        </p>
        <Link
          href="/boosters"
          className="rounded-full bg-accent px-6 py-3 font-semibold text-white shadow-sm"
        >
          Voir les boosters
        </Link>
      </section>

      <ul className="grid gap-4 md:grid-cols-3">
        {STEPS.map((step) => (
          <li
            key={step.title}
            className="rounded-2xl border border-border bg-surface p-5"
          >
            <h2 className="font-display text-xl font-semibold">{step.title}</h2>
            <p className="mt-2 text-muted">{step.text}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
