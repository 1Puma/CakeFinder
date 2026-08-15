import { expect, test } from "@playwright/test";

test("demo flow: example spec, edit, match", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "CakeMatch" })).toBeVisible();
  await expect(page.getByText("Drop a cake photo")).toBeInViewport();
  await page.getByRole("button", { name: /Three-tier fondant/ }).click();
  await page.waitForURL(/\/spec\//, { timeout: 30_000 });
  await expect(page.getByRole("checkbox", { name: /Shell border/ })).toBeChecked();
  await expect(page.getByRole("checkbox", { name: /Gold leaf/ })).toBeChecked();
  await expect(page.getByPlaceholder("describe a change")).toBeVisible();
  await page.getByPlaceholder("describe a change").fill("make it two tiers and drop the gold leaf");
  await page.locator("form").getByRole("button", { name: "Apply" }).click();
  await expect(page.getByText("Confirm these edits")).toBeVisible();
  await expect(page.getByText("3 tiers → 2 tiers")).toBeVisible();
  await page
    .getByText("Confirm these edits")
    .locator("..")
    .getByRole("button", { name: "Apply" })
    .click();
  await page.getByRole("button", { name: "Find decorators" }).click();
  await page.waitForURL(/\/matches\//, { timeout: 15_000 });
  await expect(page.getByRole("heading", { name: "East Side Buttercream" })).toBeVisible({
    timeout: 30_000,
  });
  await expect(page.getByRole("button", { name: /Expand trace|Collapse trace/ })).toBeVisible();
});
