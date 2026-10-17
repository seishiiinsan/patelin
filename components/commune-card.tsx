import Image from "next/image";
import type { CardData } from "@/lib/cards";
import { TIERS } from "@/lib/tiers";
import { CardFallbackArt } from "./card-fallback-art";

const formatNumber = (value: number, digits = 0) =>
  value.toLocaleString("fr-FR", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  });

// "Chabe01 · CC BY-SA 4.0". Wikimedia licenses require the author and the license next to the
// photo, so they stay on the face of the card.
function credit(card: CardData): string {
  if (!card.image) return "Illustration Patelin · pas encore de photo";
  return [card.image.author ?? "Auteur inconnu", card.image.license]
    .filter(Boolean)
    .join(" · ");
}

// A commune card. Sizes follow the card's own width (container query units), so the same
// component works in a grid of small cards and as a large card on its own.
export function CommuneCard({
  card,
  isNew = false,
  sizes = "(min-width: 768px) 200px, 45vw",
  priority = false,
}: {
  card: CardData;
  isNew?: boolean;
  // `sizes` of the photo, for next/image to pick the right thumbnail width.
  sizes?: string;
  priority?: boolean;
}) {
  const tier = TIERS.find((t) => t.key === card.tier) ?? TIERS[0];
  const tierColor = `var(--color-tier-${tier.key})`;
  const postcard = card.variant === "postcard";

  // cqw units resolve against the nearest container: the wrapper, so the card's own border and
  // corners scale too.
  return (
    <div className="@container w-full">
      <article
        aria-label={`${card.name}, ${card.departmentName}, ${tier.label}${postcard ? ", carte postale ancienne" : ""}`}
        className={`relative flex aspect-[5/7] w-full flex-col overflow-hidden rounded-[6cqw] border-[2.5cqw] shadow-md ${
          postcard ? "bg-[#f3e6cf] text-[#3d2b1f]" : "bg-surface"
        }`}
        style={{ borderColor: postcard ? "#8a6a4a" : tierColor }}
      >
        <header className="flex flex-col gap-[1cqw] px-[5cqw] pt-[4cqw] pb-[3cqw]">
          <h3 className="line-clamp-2 font-display text-[clamp(13px,9cqw,28px)] leading-[1.05] font-semibold">
            {card.name}
          </h3>
          <p className="truncate text-[clamp(10px,6cqw,16px)] opacity-70">
            {card.departmentName} · {card.departmentCode}
          </p>
        </header>

        <div className="relative mx-[4cqw] aspect-[4/3] overflow-hidden rounded-[3cqw] bg-border">
          {card.image ? (
            <Image
              src={card.image.url}
              alt={
                postcard
                  ? `Carte postale ancienne de ${card.name}`
                  : `Photo de ${card.name}`
              }
              fill
              sizes={sizes}
              priority={priority}
              className={`object-cover ${postcard ? "sepia-[.35]" : ""}`}
            />
          ) : (
            <CardFallbackArt seed={card.inseeCode} />
          )}
          {isNew && (
            <span className="absolute top-[2cqw] right-[2cqw] rotate-6 rounded-full bg-accent px-[3cqw] py-[1cqw] text-[clamp(9px,5.5cqw,14px)] font-bold text-white shadow">
              Nouvelle !
            </span>
          )}
          <p className="absolute inset-x-0 bottom-0 truncate bg-gradient-to-t from-black/70 to-transparent px-[3cqw] pt-[4cqw] pb-[1.5cqw] text-[clamp(7px,4cqw,11px)] text-white">
            {credit(card)}
          </p>
        </div>

        <dl className="grid flex-1 grid-cols-2 content-center gap-x-[3cqw] px-[5cqw] text-[clamp(10px,6cqw,16px)]">
          <div>
            <dt className="sr-only">Population</dt>
            <dd className="font-semibold">
              {formatNumber(card.population)}{" "}
              <span className="font-normal opacity-70">hab.</span>
            </dd>
          </div>
          <div className="text-right">
            <dt className="sr-only">Superficie</dt>
            <dd className="font-semibold">
              {formatNumber(card.surfaceHa / 100, 1)}{" "}
              <span className="font-normal opacity-70">km²</span>
            </dd>
          </div>
        </dl>

        <footer
          className="flex items-center justify-between px-[5cqw] py-[2.5cqw] text-[clamp(10px,6cqw,16px)] font-semibold text-white"
          style={{ backgroundColor: tierColor }}
        >
          <span>{tier.label}</span>
          {postcard && <span>Carte postale</span>}
        </footer>
      </article>
    </div>
  );
}
