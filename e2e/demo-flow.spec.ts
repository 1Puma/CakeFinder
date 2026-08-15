import { expect, test } from "@playwright/test";

test("demo flow: example spec, edit, match", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "CakeMatch" })).toBeVisible();
  await page.getByRole("button", { name: /Three-tier fondant/ }).click();
  await expect(page.getByText("Spec")).toBeVisible({ timeout: 30_000 });
  await page.getByPlaceholder(/make it two tiers/).fill("make it two tiers and drop the gold leaf");
  await page.getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("Confirm these edits")).toBeVisible();
  await page.getByRole("button", { name: "Apply" }).click();
  await page.getByRole("button", { name: "Find decorators" }).click();
  await expect(page.getByText(/Limiting constraint|Searching Places/)).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole("heading", { name: "East Side Buttercream" })).toBeVisible({
    timeout: 30_000,
  });
});
