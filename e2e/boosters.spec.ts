import { expect, test, type Page } from "@playwright/test";

// Uses the development email + password sign-in (AUTH_DEV_LOGIN) and needs communes in the
// database: the real import locally, `npm run data:fixture` in CI.
async function newPlayer(page: Page) {
  const suffix = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
  await page.goto("/connexion");
  await page.getByLabel("E-mail").fill(`e2e-boosters-${suffix}@patelin.test`);
  await page.getByLabel(/Mot de passe/).fill("motdepasse-e2e");
  await page.getByRole("button", { name: "Se connecter" }).click();
  await expect(page).toHaveURL("/bienvenue");
  await page.getByLabel("Ton pseudo").fill(`b_${suffix}`.slice(0, 20));
  await page.getByRole("button", { name: "Valider" }).click();
  await expect(page).toHaveURL("/profil");
}

test("visitors are asked to sign in before opening boosters", async ({
  page,
}) => {
  await page.goto("/boosters");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Boosters");
  await expect(page.getByRole("link", { name: "Se connecter" })).toBeVisible();
});

test("a player opens a booster, then finds one of its cards in the collection", async ({
  page,
}) => {
  await newPlayer(page);
  await page.goto("/boosters");
  await expect(page.getByText("8 / 8")).toBeVisible();
  // The daily and department-of-the-day boosters arrive with the first visit.
  await expect(
    page.getByRole("heading", { name: "Booster du jour" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Ouvrir" }).first().click();
  // Only the next card can be turned over: the 5th comes last.
  await expect(
    page.getByRole("button", { name: "Retourner la carte 5" }),
  ).toBeDisabled();
  await page.getByRole("button", { name: "Retourner la carte 1" }).click();
  await page.getByRole("button", { name: "Tout retourner" }).click();

  const summary = page.getByRole("region", { name: "Résumé du booster" });
  // A new player's first card is always new.
  await expect(summary).toContainText(/\+\d nouvelles?/);

  const firstCard = page.getByRole("article").first();
  const name = (await firstCard.getAttribute("aria-label"))!.split(",")[0]!;

  await page.getByRole("link", { name: "Voir ma collection" }).click();
  await expect(page).toHaveURL("/collection");
  await page.getByLabel("Rechercher une commune").fill(name);
  await page.getByLabel("Rechercher une commune").press("Enter");
  await page
    .getByRole("link", { name: new RegExp(`^${name},`) })
    .first()
    .click();

  await expect(page.getByRole("heading", { level: 1 })).toHaveText(name);
  await expect(page.getByText("Exemplaires normaux")).toBeVisible();

  await page.goto("/boosters");
  await expect(page.getByText("7 / 8")).toBeVisible();
});

test("the collection hides communes the player does not own", async ({
  page,
}) => {
  await newPlayer(page);
  await page.goto("/collection/29019");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Ce patelin n’existe pas",
  );
  await expect(page.getByText("Brest")).toHaveCount(0);
});
