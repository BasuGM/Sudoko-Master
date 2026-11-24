import { expect, test } from "@playwright/test";

test("plays an easy puzzle with notes, undo, hint, pause, and restore", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /easy/i }).click();
  await page.waitForURL("**/game");
  const empty = page.getByRole("gridcell", { name: /empty/i }).first();
  await empty.click();
  await page.keyboard.press("5");
  await expect(page.getByRole("gridcell", { name: /entered 5/i }).first()).toBeVisible();

  await page.getByRole("button", { name: "Notes", exact: true }).click();
  await page.keyboard.press("3");
  await page.getByRole("button", { name: "Undo" }).click();
  await page.getByRole("button", { name: "Hint" }).click();
  await expect(page.getByRole("complementary", { name: "Hint" })).toBeVisible();

  await page.getByRole("button", { name: "Pause" }).click();
  await expect(page.getByText("Paused")).toBeVisible();
  await page.getByRole("button", { name: "Resume" }).first().click();

  await page.reload();
  await expect(page.getByRole("grid")).toBeVisible();
  await expect(page.getByRole("gridcell", { name: /entered 5/i }).first()).toBeVisible();
});

test("starts the daily puzzle", async ({ page }) => {
  await page.goto("/daily");
  await page.getByRole("button", { name: /play today|play again/i }).click();
  await expect(page.getByRole("grid")).toBeVisible({ timeout: 30_000 });
});

test("keeps the play navigation on a narrow screen", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await expect(page.getByRole("navigation", { name: "Primary" }).last()).toBeVisible();
  await expect(page.getByRole("heading", { name: "Sit with a grid." })).toBeVisible();
});
