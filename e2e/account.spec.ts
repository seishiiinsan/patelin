import { expect, test, type Page } from "@playwright/test";

// Uses the development email + password sign-in (AUTH_DEV_LOGIN, see playwright.config.ts).
// Sign-ups go through several redirects; a dev server compiles each route on first visit.
test.describe.configure({ timeout: 90_000 });
const NAVIGATION = { timeout: 20_000 };

// Form errors, not the route announcer Next.js also marks as an alert.
function formError(page: Page) {
  return page.getByRole("main").getByRole("alert");
}

function uniqueSuffix() {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
}

async function signIn(page: Page, email: string) {
  await page.goto("/connexion");
  await page.getByLabel("E-mail").fill(email);
  await page.getByLabel(/Mot de passe/).fill("motdepasse-e2e");
  await page.getByRole("button", { name: "Se connecter" }).click();
}

async function choosePseudo(page: Page, pseudo: string) {
  await page.getByLabel("Ton pseudo").fill(pseudo);
  await page.getByRole("button", { name: "Valider" }).click();
}

test("the profile asks for a sign-in", async ({ page }) => {
  await page.goto("/profil");
  await expect(page).toHaveURL("/connexion", NAVIGATION);
});

test("a new player picks a pseudo, exports their data and deletes the account", async ({
  page,
}) => {
  const suffix = uniqueSuffix();
  const pseudo = `e2e_${suffix}`.slice(0, 20);

  await signIn(page, `e2e-${suffix}@patelin.test`);
  await expect(page).toHaveURL("/bienvenue", NAVIGATION);

  // Length limits are enforced by the browser; character rules only by the server.
  await choosePseudo(page, "Jean Dupont");
  await expect(formError(page)).toContainText("lettres, des chiffres");

  await choosePseudo(page, pseudo);
  await expect(page).toHaveURL("/profil", NAVIGATION);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(pseudo);

  const exported = await page.request.get("/api/compte/export");
  expect(exported.ok()).toBe(true);
  expect((await exported.json()).user.pseudo).toBe(pseudo);

  await page.getByRole("button", { name: "Supprimer mon compte" }).click();
  await page.getByLabel("Pseudo de confirmation").fill(pseudo);
  await page.getByRole("button", { name: "Supprimer définitivement" }).click();
  await expect(page).toHaveURL("/", NAVIGATION);

  await page.goto("/profil");
  await expect(page).toHaveURL("/connexion", NAVIGATION);
});

test("two players cannot share a pseudo, whatever the case", async ({
  browser,
}) => {
  const suffix = uniqueSuffix();
  const pseudo = `Dup_${suffix}`.slice(0, 20);

  const first = await (await browser.newContext()).newPage();
  await signIn(first, `e2e-a-${suffix}@patelin.test`);
  await choosePseudo(first, pseudo);
  await expect(first).toHaveURL("/profil", NAVIGATION);

  const second = await (await browser.newContext()).newPage();
  await signIn(second, `e2e-b-${suffix}@patelin.test`);
  await expect(second).toHaveURL("/bienvenue", NAVIGATION);
  await choosePseudo(second, pseudo.toLowerCase());
  await expect(formError(second)).toHaveText("Ce pseudo est déjà pris.");
});

test("the legal pages are linked from every page", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Informations légales" })
    .getByRole("link", { name: "Confidentialité" })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Politique de confidentialité",
  );
});
