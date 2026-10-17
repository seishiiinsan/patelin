---
name: Patelin
description: A cartoon collector's binder for the 34,875 communes of France.
colors:
  tricolore-blue: "#2f6fed"
  tricolore-blue-ink: "#ffffff"
  poppy-red: "#ff5a4f"
  binder-cream: "#fff8ec"
  page-white: "#ffffff"
  ink-navy: "#1f2433"
  slate-muted: "#646b7d"
  kraft-line: "#ead9bd"
  night-binder: "#161a26"
  night-page: "#212636"
  night-ink: "#f4efe6"
  night-muted: "#a3a9b8"
  night-line: "#343a4d"
  tier-commune: "#8a94a6"
  tier-peu-commune: "#3fae5a"
  tier-rare: "#2f80ed"
  tier-epique: "#8b5cf6"
  tier-legendaire: "#f5a623"
  tier-mythique: "#e83e8c"
  postcard-paper: "#f3e6cf"
  postcard-ink: "#3d2b1f"
  postcard-frame: "#8a6a4a"
typography:
  display:
    fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif"
    fontSize: "3rem"
    fontWeight: 600
    lineHeight: 1
  headline:
    fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif"
    fontSize: "1.875rem"
    fontWeight: 600
    lineHeight: 1.2
  title:
    fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif"
    fontSize: "1.25rem"
    fontWeight: 600
    lineHeight: 1.25
  card-name:
    fontFamily: "Fredoka, ui-rounded, system-ui, sans-serif"
    fontSize: "clamp(13px, 9cqw, 28px)"
    fontWeight: 600
    lineHeight: 1.05
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  body-lead:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 400
    lineHeight: 1.55
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 600
    lineHeight: 1.4
rounded:
  field: "12px"
  pack: "12px"
  container: "16px"
  glow: "24px"
  pill: "9999px"
  card: "6cqw"
  card-photo: "3cqw"
spacing:
  gutter: "16px"
  gap-tight: "8px"
  gap: "12px"
  gap-loose: "16px"
  container-pad: "20px"
  section: "40px"
  page-max: "1024px"
components:
  button-primary:
    backgroundColor: "{colors.poppy-red}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
    typography: "{typography.label}"
  button-brand:
    backgroundColor: "{colors.tricolore-blue}"
    textColor: "{colors.tricolore-blue-ink}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-secondary:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.pill}"
    padding: "12px 24px"
  button-compact:
    backgroundColor: "{colors.poppy-red}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.pill}"
    padding: "8px 20px"
  field:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.field}"
    padding: "0 12px"
    height: "44px"
  container:
    backgroundColor: "{colors.page-white}"
    rounded: "{rounded.container}"
    padding: "20px"
  nav-link-active:
    backgroundColor: "{colors.tricolore-blue}"
    textColor: "{colors.tricolore-blue-ink}"
    rounded: "{rounded.pill}"
    padding: "8px 16px"
  chip-new:
    backgroundColor: "{colors.poppy-red}"
    textColor: "{colors.page-white}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
  chip-set:
    backgroundColor: "{colors.page-white}"
    textColor: "{colors.ink-navy}"
    rounded: "{rounded.pill}"
    padding: "4px 12px"
---

# Design System: Patelin

## Overview

**Creative North Star: "The Collector's Binder"**

Patelin is a binder you leaf through. The pages are calm and warm: cream paper (Binder Cream), white sleeves (Page White), thin kraft-colored lines. All the strong color belongs to what sits in the sleeves, the commune cards, framed in their tier color. The interface stays quiet so a Mythique frame, a "Nouvelle !" sticker or a tier glow reads as an event.

The art direction is "cartoon, grand public", as the spec sets it. The cartoon lives in the rounded Fredoka titles, the hand-drawn fallback villages, the tilted stickers and the chunky pill buttons, not in noise around them. Everything in the hand should feel toyful: round, bold, tactile, with clear feedback when pressed.

Density is low and mobile-first. One column of content, never wider than 1024px, with cards in a 2-column grid on phones that grows to 5 on desktop. The system rejects casino gacha: no gold and neon flooding the screen, no flashing loot boxes, no pressure loops. Excitement comes from the card itself, once, at the moment it turns over.

**Key Characteristics:**

- Warm cream page, white containers, kraft hairlines; color is held back for the cards.
- Six tier colors are the loudest thing on any screen, and they always mean rarity.
- Rounded Fredoka for anything with a name, Nunito for everything read.
- Pills for every action, 16px-radius containers, 5:7 cards with corners that scale with the card.
- Motion only around opening a booster, always with a reduced-motion fallback.
- Full light and dark themes, following the system setting.

## Colors

A warm paper neutral holds a two-color brand (a confident blue and a poppy red) and a six-step rarity spectrum that runs from slate gray to magenta.

### Primary

- **Tricolore Blue** (`tricolore-blue`): the brand color. The Patelin wordmark, the card back, the free booster pack, the active nav pill, form submit buttons and focus outlines. It's the color of "this is Patelin".
- **Tricolore Blue Ink** (`tricolore-blue-ink`): text and icons on Tricolore Blue.

### Secondary

- **Poppy Red** (`poppy-red`): the call to act and the moment of novelty. Primary buttons ("Voir les boosters", "Ouvrir", "Ouvrir un booster"), the "Nouvelle !" sticker, the new-card count chip, the ring around the next card to flip, the daily booster pack, error text and error borders.

### Tertiary: the rarity spectrum

The tiers run from common to rarest, and each color is reserved for its tier. They're defined as `--color-tier-<key>` in `app/globals.css`, and `lib/tiers.ts` holds the thresholds.

- **Fieldstone Gray** (`tier-commune`): Commune, under 1,000 inhabitants.
- **Meadow Green** (`tier-peu-commune`): Peu commune, from 1,000.
- **Lake Blue** (`tier-rare`): Rare, from 3,000.
- **Lavender Violet** (`tier-epique`): Épique, from 10,000. Also used for the département booster pack.
- **Sunflower Amber** (`tier-legendaire`): Légendaire, from 30,000.
- **Fuchsia** (`tier-mythique`): Mythique, the 42 cities from 100,000.

### Postcard variant

The rare "carte postale ancienne" variant swaps the whole card into an aged-paper palette: **Postcard Paper** (`postcard-paper`) for the face, **Postcard Ink** (`postcard-ink`) for its text, **Postcard Frame** (`postcard-frame`) for the frame, and a 35 % sepia on the photo.

### Neutral

- **Binder Cream** (`binder-cream`): the page background in light mode. Warm, never pure white.
- **Page White** (`page-white`): containers, the header, the mobile tab bar, fields, secondary buttons.
- **Ink Navy** (`ink-navy`): body text and headings. A blue-black, never pure black.
- **Slate Muted** (`slate-muted`): secondary text, help text, inactive nav labels, counts.
- **Kraft Line** (`kraft-line`): every 1px border and divider, and the photo placeholder.
- **Night Binder**, **Night Page**, **Night Ink**, **Night Muted**, **Night Line** (`night-*`): the same five roles in dark mode, swapped in under `prefers-color-scheme: dark`. Brand, accent and tier colors stay the same in both themes.

### Named Rules

**The Sleeve Rule.** Strong color lives on the cards and the packs, not on the page. Pages stay cream, white and navy; if a screen without cards looks colorful, something borrowed a card's color.

**The Rarity Monopoly Rule.** A tier color means that tier and nothing else. Never use Meadow Green for success, Fuchsia for a promo or Sunflower Amber for a warning. The one standing exception is Lavender Violet on the département pack.

**The One Red Button Rule.** Poppy Red marks the single main action of a view. A second action next to it is a secondary pill (white, kraft border).

## Typography

**Display Font:** Fredoka (with ui-rounded, system-ui)
**Body Font:** Nunito (with system-ui)

**Character:** Fredoka's soft round terminals carry the cartoon voice. Nunito is a rounded sans that keeps long text and numbers easy to read. Both load through `next/font/google` as `--font-fredoka` and `--font-nunito`, mapped to Tailwind's `font-display` and `font-sans`.

### Hierarchy

- **Display** (Fredoka 600, 48px, line-height 1): the home page's "Patelin" title in Tricolore Blue. Once per site, effectively.
- **Headline** (Fredoka 600, 30px): page titles ("Collection", "Boosters", "Styleguide").
- **Title** (Fredoka 600, 20px): container and offer titles ("Booster gratuit", the home page steps).
- **Card name** (Fredoka 600, `clamp(13px, 9cqw, 28px)`, line-height 1.05, at most 2 lines): the commune's name on its card. It scales with the card's width.
- **Body** (Nunito 400, 16px): all running text. The home lead is 18px with a max width of about 36rem.
- **Label** (Nunito 600, 14px): buttons, nav links, chips, help and counts. Button labels go up to 16px semibold.

### Named Rules

**The Named Things Rule.** Fredoka is for things that have a name: the game, a page, a booster, a commune. Sentences, numbers and controls are Nunito.

**The French Numbers Rule.** Every number is formatted with `toLocaleString("fr-FR")` (thin-space thousands, comma decimals), followed by a lighter unit ("hab.", "km²").

## Layout

The page is one centered column, `max-w-5xl` (1024px), with a 16px side gutter, 24px above the content and 40px below. Sections stack with gaps of 24px between blocks and 40px between major sections. Inside containers, gaps are 8 to 16px.

Card grids are the main layout pattern. A collection shows 2 columns on phones, 3 from 640px and 5 from 1024px, with gaps of 12px, then 16px. A booster opening shows 2 columns on phones, with the fifth card centered at half width across both columns, and 5 in a row from 640px.

Below 768px the header keeps only the wordmark, and navigation moves to a 5-tab bar fixed to the bottom, 56px tall, padded for the safe area. The footer adds 80px of bottom padding so it clears that bar.

Cards size themselves with container queries (`@container` and `cqw` units). The same component works as a 150px grid tile or a 400px hero card without any variant prop.

## Elevation & Depth

Depth is mostly tonal: white containers on a cream page, divided by 1px kraft lines. Shadows are short and soft, Tailwind's defaults, and they lift objects you hold rather than layout.

### Shadow Vocabulary

- **Held object** (`shadow-md`: `0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`): commune cards, card backs, booster packs. Things you collect.
- **Pressable** (`shadow-sm`: `0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): primary pill buttons, the "Nouvelle !" sticker, the wordmark sticker on packs.
- **Rarity glow** (a blurred tier-color halo, 70 % opacity, fading in over 700ms): only behind the guaranteed Rare-or-better fifth card once it flips.

### Named Rules

**The Flat Page Rule.** Containers, the header and the tab bar carry no shadow. Only collectibles and pressable pills get lifted.

**The Earned Glow Rule.** A glow is a reward. It appears only around a card that just turned over, in that card's tier color.

## Shapes

The form language is round and soft, with no sharp corners anywhere.

- **Pills** (fully rounded): every button, nav link, chip and badge.
- **Containers** (16px radius): offers, summaries, empty states, error messages, the home steps.
- **Fields and packs** (12px radius): search fields, selects, booster packs. The pseudo field still uses 8px and should move to 12px.
- **Cards** (a 5:7 rectangle with a 6cqw radius and a 2.5cqw frame, so the corners and frame scale with the card). The photo window inside is 4:3 with a 3cqw radius.
- **Stickers**: the "Nouvelle !" badge leans 6° clockwise. The "Patelin" wordmark on packs and card backs leans 12° the other way. These small tilts are the cartoon signature.

## Components

### Buttons

Chunky, round and tactile, like game tokens.

- **Shape:** fully rounded pill.
- **Primary** (`button-primary`): Poppy Red with white semibold text, 12px × 24px, a soft pressable shadow. Used for the main action of a view.
- **Compact** (`button-compact`): the same, at 8px × 20px, for actions inside an offer card ("Ouvrir").
- **Brand** (`button-brand`): Tricolore Blue with white text, for submitting a form ("Valider", "Chercher").
- **Secondary** (`button-secondary`): Page White with Ink Navy text and a 1px kraft border, for the alternative next to a primary ("Voir ma collection", "Tout retourner", pagination).
- **Disabled:** 50 % opacity and a not-allowed cursor.
- **Hover / Focus:** none are defined yet beyond the browser default focus ring. The toyful direction calls for a slight press (scale to about 0.97) and a visible Tricolore Blue focus outline; add both whenever a button is touched.

### Chips

- **New-cards chip** (`chip-new`): Poppy Red, white semibold text ("+2 nouvelles").
- **Set progress chip** (`chip-set`): white with a kraft border and the progress in semibold ("Ain 12 / 393").
- **"Nouvelle !" sticker:** a Poppy Red pill on the card photo, tilted 6°, with a small shadow.

### Containers

- **Corner style:** 16px radius.
- **Background:** Page White on Binder Cream, with a 1px Kraft Line border.
- **Shadow strategy:** none (the Flat Page Rule).
- **Internal padding:** 20px for summaries and the home steps, 16px for offer cards.
- **Error:** the same container with a Poppy Red border and Poppy Red semibold text, `role="alert"`.

### Inputs / Fields

- **Style:** Page White, 1px Kraft Line border, 12px radius, 44px tall, 12px side padding. Selects use the same style at 14px.
- **Label:** above the field, semibold. Help text sits below in Slate Muted at 14px.
- **Error:** a semibold Poppy Red line below the field, `role="alert"`.
- **Focus:** the browser default for now. It should become a 2px Tricolore Blue outline.

### Navigation

- **Desktop (768px and up):** pill links in the header, Nunito semibold 14px. The active link is a Tricolore Blue pill with white text. Inactive links are Slate Muted and turn Ink Navy on hover.
- **Mobile:** a 5-column tab bar fixed to the bottom of the screen, white with a top kraft line, 56px tall, with the safe-area inset. The active tab is Tricolore Blue text. There are no icons yet.
- **Footer:** legal links and the data credit ("Données : geo.api.gouv.fr · Photos : Wikimedia Commons") in Slate Muted at 14px.

### Commune Card (signature component)

The card is the product. It's a 5:7 rectangle framed in its tier color, built from top to bottom:

1. The commune's name (Fredoka, up to 2 lines), then "Département · code" at 70 % opacity.
2. A 4:3 photo window with rounded corners. The photo is a Wikimedia thumbnail with its credit ("author · license") on a dark gradient strip along the bottom edge. Without a photo, a seeded cartoon village (sky, hills, houses and a church) is drawn from the INSEE code.
3. Population and area on one row, the numbers in semibold and the units at 70 % opacity.
4. A footer band filled with the tier color, with the tier name in white.

The postcard variant swaps the face to Postcard Paper and the frame to Postcard Frame, sepias the photo and adds "Carte postale" to the footer band. The card back is a Tricolore Blue card with a white frame, a polka-dot pattern and the tilted "Patelin" sticker.

### Booster Pack

A 3:4 rounded tile with diagonal white stripes over the pack's color: Tricolore Blue for free, Poppy Red for the daily booster, Lavender Violet for a département booster. The tilted "Patelin" sticker sits in the middle. While a booster opens, the pack shakes (±6°, 0.5s, looping).

### Booster Reveal

Five card backs in a row. The next card to flip carries a 4px Poppy Red ring at 60 % opacity. Each flip is a 500ms Y-axis rotation. "Tout retourner" flips them one by one, 450ms apart, always ending on the fifth card. When it flips, the fifth card pops (scale to 1.08 over 0.6s, after 0.35s) and gets its tier glow. Each flip is announced in an `aria-live` region. Every animation has a `motion-reduce` fallback.

## Do's and Don'ts

### Do:

- **Do** keep pages Binder Cream, Page White and Ink Navy, and let the cards bring the color (the Sleeve Rule).
- **Do** use the `--color-tier-*` tokens for anything about rarity, and only for rarity.
- **Do** make every action a pill, with one Poppy Red primary per view.
- **Do** show the photo's author and license on the face of every card that has a photo.
- **Do** size anything that lives inside a card in `cqw`, so it scales with the card.
- **Do** give every motion a `motion-reduce` fallback, and animate transforms and opacity only (they stay smooth on low-end phones).
- **Do** check both themes. Brand, accent and tier colors are shared, so they must work on Binder Cream and on Night Binder.

### Don't:

- **Don't** look like casino gacha: no gold or neon washes, no flashing or looping loot-box effects, no countdown pressure beyond the plain "Le prochain arrive dans … min."
- **Don't** use a tier color for status, success or decoration.
- **Don't** shadow layout containers, the header or the tab bar.
- **Don't** put white text on Poppy Red below 18px bold: it's 3.1:1. The current 16px semibold button labels fall short of AA and need a deeper red or larger text. Poppy Red error text on Binder Cream is 2.9:1, which is also too low.
- **Don't** set small white text on tier colors as they stand. On the card's footer band, white reaches only 2.0:1 on Sunflower Amber, 2.8:1 on Meadow Green and 3.1 to 4.2:1 on the others, all under AA for 10 to 16px text. The tier name needs a dark ink on the light tiers or deeper tier shades.
- **Don't** show a commune name on any map element for a commune the player doesn't own.
