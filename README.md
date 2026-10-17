# Patelin

Jeu web gratuit de collection de cartes des communes françaises : on ouvre des boosters, on complète des sets, on échange entre amis et on place les plus petits villages sur la carte de France.

Le cahier des charges et la roadmap complète sont dans [Patelin — Cahier des charges](https://claude.ai/code/artifact/347d8d4a-fc4e-406e-84f7-3d3f01783e09).

## Stack

- [Next.js 16](https://nextjs.org) (App Router, TypeScript strict, Cache Components) et Tailwind CSS 4
- PostgreSQL 18 et [Prisma 7](https://www.prisma.io) (adaptateur `pg`)
- Vitest pour les tests unitaires, Playwright pour les tests de bout en bout
- Logs serveur en JSON avec pino

## Démarrer en local

Prérequis : Node.js 24 et Docker.

```bash
npm install
cp .env.example .env
npm run db:up
npm run db:migrate
npm run dev
```

L'application tourne sur [http://localhost:3000](http://localhost:3000). La route [/api/health](http://localhost:3000/api/health) vérifie que la base répond.

## Commandes

| Commande             | Rôle                                                        |
| -------------------- | ----------------------------------------------------------- |
| `npm run dev`        | Serveur de développement                                    |
| `npm run build`      | Build de production                                         |
| `npm run lint`       | ESLint                                                      |
| `npm run typecheck`  | Vérification des types TypeScript                           |
| `npm run format`     | Formate le code avec Prettier                               |
| `npm test`           | Tests unitaires (Vitest)                                    |
| `npm run test:e2e`   | Tests de bout en bout (Playwright, base de données requise) |
| `npm run db:up`      | Démarre PostgreSQL dans Docker                              |
| `npm run db:down`    | Arrête PostgreSQL                                           |
| `npm run db:migrate` | Applique et crée les migrations Prisma                      |
| `npm run db:studio`  | Ouvre Prisma Studio                                         |

Avant les tests de bout en bout, installer le navigateur une fois : `npx playwright install chromium`. Les tests démarrent leur propre serveur sur le port 3100. Next.js refuse un deuxième `next dev` dans le même projet : si `npm run dev` tourne déjà, réutiliser son port avec `E2E_PORT=<port> npm run test:e2e`.

## Organisation du code

- `app/` : pages et routes (App Router)
- `components/` : composants d'interface partagés
- `lib/` : logique métier et utilitaires (tiers de rareté, client Prisma, logger)
- `prisma/` : schéma et migrations ; le client généré va dans `generated/` (non versionné)
- `e2e/` : tests Playwright
- `app/dev/` : pages réservées au développement (`/dev/styleguide`, `/dev/error`), en 404 en production
