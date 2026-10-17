# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

Responsive web, played mostly on phones: below `md` the main navigation becomes a tab bar fixed to the bottom of the screen.

## Users

The main player is a card collector: someone used to TCGs or gacha games who wants rare pulls, finished sets and good trades. They sign in with Google or Discord and pick a public pseudo. The name and email from those providers stay private.

The spec's art direction is "grand public", so the game must stay approachable to players outside that core. No other audience has been confirmed.

## Product Purpose

Patelin is a free web card game about French communes. Players open boosters, complete sets, trade with friends and place villages on the map of France to earn decorations.

The goal is a game players come back to several times a day. They collect the 34,875 communes of metropolitan France and the DROM, "de Paris au plus petit hameau".

Success has no metric yet. The spec only sets milestones: the MVP is playable after phase 4 and the full game after phase 8.

## Positioning

Every card is a real commune, and its rarity is its real population: the more inhabitants, the rarer the card. The draw is uniform over communes, so the rarity pyramid falls out of France's own demography (24,844 Communes down to 42 Mythiques, the cities over 100,000).

Skill sits on the other end of the scale. In each booster the smallest commune is the one to place on the map, so the challenge always falls on villages, which is what "Patelin" means.

The game is 100 % free, with no monetization of any kind.

## Operating Context

- **Boosters**: the spec settles the free offer at one booster every 10 minutes, with a stock of up to 10. The code still gives one per hour with a stock of 8 (`lib/free-boosters.ts`). A booster holds 5 cards, and the fifth is drawn among Rare and above. Regional boosters, bought with in-game currency, cover the 13 metropolitan regions plus one "Outre-mer" booster.
- **Placement**: after each booster, the player has 30 seconds and one try to place its smallest commune. The département is shown. The decoration depends on the distance.
- **Patelin du jour**: one commune under 1,000 inhabitants per day, the same for everyone, picked on the server ahead of time and reset at midnight Paris time. Players are ranked by distance, ties broken by speed. Results are hidden until midnight, and the top 10 get a dated special card.
- **Collection**: a France map with départements colored by completion %, with DROM insets, and a département view that doubles as that département's set page. Sets cover départements, régions, préfectures and homonyms (19 names shared by 8 or more communes).
- **Social**: friends only for direct trades, cards for cards with no currency. There's a referral link that also makes the two players friends, a showcase of 5 favorite cards visible to friends, a fixed-price market, and six leaderboards.
- **Opening**: each opening ends with a "Nouvelle !" badge on new cards and a live recap of collection progress.

## Capabilities and Constraints

- **Rarity tiers** (`lib/tiers.ts`), by population: Commune (from 0), Peu commune (1,000), Rare (3,000), Épique (10,000), Légendaire (30,000), Mythique (100,000).
- **Card variants**: a rare "carte postale ancienne" variant (about 1 in 100) exists for the 2,062 communes that have a public-domain postcard on Wikimedia. The variant is stored on the card instance. Decorated cards are unique instances; plain cards are fungible counts.
- **Server authority**: everything that creates value (draws, timers, distances, trades, market) is decided by the server inside one database transaction, never by the browser.
- **No answers on the map**: the map must never help a placement. Public map files carry INSEE codes only, and the collection map never shows the names of communes the player doesn't own.
- **Photo credits**: commune photos are Wikimedia Commons images and always show their stored author and license.
- **Communes are never deleted**: a commune that leaves the INSEE list is deactivated and leaves the draw.
- **Language**: all player-facing text is in French.
- **Undecided** (open questions in the spec): placement on every booster or 1 in 3; targeted fusion of duplicates; market tax (5–10 %); booster, regional booster and recycling prices; arrondissement cards for Paris, Lyon and Marseille; the domain name (patelin.fr or .gg).
- **Rejected**: an opening animation on the map, a bad-luck counter, coats of arms as fallback art, placement records.

## Brand Commitments

- **Name**: Patelin. The wordmark is currently plain text; no logo file exists.
- **Voice**: playful and warm. The game addresses the player as "tu", is light and a bit cheeky, and never makes fun of small places. Every village is worth something.
- **Art direction**: "cartoon, grand public". The spec makes this binding.
- **Fixed terms**: Patelin du jour, booster, set, décoration, "Nouvelle !", and the six tier names above.

## Evidence on Hand

- **Commune data**: 34,875 communes from geo.api.gouv.fr (Licence Ouverte Etalab), surveyed 2026-10-17, with population, area, département and région. 129 of them are in the DROM.
- **Photos**: Wikimedia Commons photos for 34,344 communes. About 530 have none and use the fallback art (`components/card-fallback-art.tsx`).
- **Postcards**: public-domain postcards for 2,062 communes.
- **Map contours**: simplified contours in `public/geo/`.
- **Spec**: the full rules, data model and 132-step roadmap are in "Patelin — Cahier des charges" (https://claude.ai/code/artifact/347d8d4a-fc4e-406e-84f7-3d3f01783e09).
- **Missing**: there are no players, testimonials, press, player counts or screenshots of real play yet. Never invent them.
- **Legal pages**: they still hold `[placeholders]` for the publisher's name and contact email.

## Product Principles

1. **The collection comes first.** When features conflict, the one that makes opening, owning and completing feel better wins. The map and the social features serve the collection.
2. **Real data is the content.** Every card shows a real commune with its real figures and its photo credit. Never round, embellish or invent a fact about a commune.
3. **Every village counts.** Rarity rewards big cities, so the voice and the placement challenge make the small villages matter. Humor is never at their expense.
4. **Fair, free, server-decided.** There is no money in the game and no way to buy an advantage. Nothing on screen may leak a placement answer.
5. **Built for short return visits.** A booster every 10 minutes and one daily challenge set the rhythm. Each visit should pay off within a few taps on a phone.
