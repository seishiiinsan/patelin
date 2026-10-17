import { expect, test } from "@playwright/test";

test("the home page introduces the game", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("Patelin");
});

test("the layout never scrolls sideways", async ({ page }) => {
  await page.goto("/");
  const overflow = await page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

test("the main navigation leads to the collection", async ({ page }) => {
  await page.goto("/");
  await page
    .getByRole("navigation", { name: "Navigation principale" })
    .getByRole("link", { name: "Collection" })
    .click();
  await expect(page).toHaveURL("/collection");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Collection",
  );
});

test("the health check reaches the database", async ({ request }) => {
  const response = await request.get("/api/health");
  expect(response.ok()).toBe(true);
  expect(await response.json()).toEqual({ status: "ok", database: "ok" });
});
