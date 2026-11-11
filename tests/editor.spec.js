import { test, expect } from "@playwright/test";
import JSZip from "jszip";
import { readFile } from "node:fs/promises";
test("homepage and editor persist, undo, export, import and reorder", async ({
  page,
}) => {
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("http://127.0.0.1:5173");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Skilled People. Strong Projects.",
  );
  await page.getByRole("button", { name: "Edit Mode", exact: true }).click();
  await page.getByLabel("Nagłówek", { exact: true }).fill("Test headline");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Test headline",
  );
  await page.getByRole("button", { name: "Cofnij", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Skilled People.",
  );
  await page.getByRole("button", { name: "Ponów", exact: true }).click();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Test headline",
  );
  await page.reload();
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Test headline",
  );
  await page.getByRole("button", { name: "Edit Mode", exact: true }).click();
  await page
    .getByRole("button", { name: "Ukryj Our values", exact: true })
    .click();
  await expect(page.locator("#values")).toHaveCount(0);
  await page
    .getByRole("button", { name: "Pokaż Our values", exact: true })
    .click();
  await expect(page.locator("#values")).toBeVisible();
  await page
    .locator(".section-list>div")
    .nth(2)
    .dragTo(page.locator(".section-list>div").nth(1));
  await expect(page.locator("main>section").nth(1)).toHaveAttribute(
    "id",
    "services",
  );
  await page.getByRole("button", { name: "mobile", exact: true }).click();
  await expect(page.locator("main")).toHaveClass(/mobile/);
  await page.getByRole("button", { name: "Styl", exact: true }).click();
  await page
    .getByLabel("Oryginalne logo URL")
    .fill(
      'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="100" height="30"><text y="20">TEST</text></svg>',
    );
  await expect(page.locator(".brand img")).toBeVisible();
  await page.getByRole("button", { name: "Projekt", exact: true }).click();
  const [json] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("button", { name: "Eksportuj ustawienia JSON", exact: true })
      .click(),
  ]);
  expect(json.suggestedFilename()).toBe("rempol-settings.json");
  await json.saveAs("/tmp/rempol-settings.json");
  const [zip] = await Promise.all([
    page.waitForEvent("download"),
    page
      .getByRole("button", { name: "Eksportuj projekt ZIP", exact: true })
      .click(),
  ]);
  await zip.saveAs("/tmp/rempol-project.zip");
  expect(zip.suggestedFilename()).toBe("rempol-project.zip");
  const archive = await JSZip.loadAsync(
    await readFile("/tmp/rempol-project.zip"),
  );
  for (const path of [
    "src/main.jsx",
    "src/projectExport.js",
    "src/Editor.jsx",
    "src/SectionView.jsx",
    "src/SiteHeader.jsx",
    "src/Photo.jsx",
    "src/projectSettings.js",
    "src/legacyDefaults.js",
    "src/editor.css",
    "src/style.css",
    "index.html",
    "package.json",
    "package-lock.json",
    "public/industrial-concept.png",
    "public/industrial-details.png",
    "public/shipyard-hero.png",
    "public/norway-fjord.png",
    "public/shipyard-team.png",
  ])
    expect(archive.file(path), path).not.toBeNull();
  const png = await archive
    .file("public/industrial-concept.png")
    .async("uint8array");
  expect(Array.from(png.slice(0, 4))).toEqual([137, 80, 78, 71]);

  await page
    .getByRole("button", {
      name: "Przywróć ustawienia początkowe",
      exact: true,
    })
    .click();
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Skilled People.",
  );
  await page
    .locator('input[accept="application/json"]')
    .setInputFiles("/tmp/rempol-settings.json");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Test headline",
  );
  expect(errors).toEqual([]);
});
test("responsive and careers interaction", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("http://127.0.0.1:5173");
  expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBe(
    390,
  );
  await page.getByRole("button", { name: "Menu", exact: true }).click();
  await expect(page.locator("nav")).toBeVisible();
  await page.getByRole("button", { name: "Careers", exact: true }).click();
  await page
    .getByRole("button", { name: "View Job Opportunities", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page
    .getByRole("button", { name: "Zamknij oferty", exact: true })
    .click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.screenshot({ path: "/tmp/rempol-mobile.png", fullPage: true });
});

test("media uploads, video playback and invalid import", async ({ page }) => {
  await page.goto("http://127.0.0.1:5173");
  await page.getByRole("button", { name: "Edit Mode", exact: true }).click();
  await page.locator('input[accept="video/mp4,video/webm"]').setInputFiles({
    name: "demo.webm",
    mimeType: "video/webm",
    buffer: Buffer.from(
      "GkXfo59ChoEBQveBAULygQRC84EIQoKEd2VibUKHgQJChYECGFOAZwEAAAAAAALcEU2bdLpNu4tTq4QVSalmU6yBoU27i1OrhBZUrmtTrIHWTbuMU6uEElTDZ1OsggEjTbuMU6uEHFO7a1OsggLG7AEAAAAAAABZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAVSalmsCrXsYMPQkBNgIxMYXZmNjEuNy4xMDNXQYxMYXZmNjEuNy4xMDNEiYhAj0AAAAAAABZUrmvIrgEAAAAAAAA/14EBc8WIUshqtwp8NIWcgQAitZyDdW5kiIEAhoVWX1ZQOIOBASPjg4QF9eEA4JCwgUC6gUCagQJVsIRVuYEBElTDZ/tzc59jwIBnyJlFo4dFTkNPREVSRIeMTGF2ZjYxLjcuMTAzc3PWY8CLY8WIUshqtwp8NIVnyKFFo4dFTkNPREVSRIeUTGF2YzYxLjE5LjEwMSBsaWJ2cHhnyKFFo4hEVVJBVElPTkSHkzAwOjAwOjAxLjAwMDAwMDAwMAAfQ7Z1QR3ngQCjwIEAAIBQAwCdASpAAEAAAEcIhYWIhYSIAgICdaoCBsZG/VBakJgCmAD+/43k//20D/9tA//bQP/toH+N5vNasQCjloEAZADRAQAFEKwAGAAYWC/0AAiOgACjloEAyADRAQAFEKwAGAAYWC/0AAiOgACjloEBLADRAQAFEKwAGAAYWC/0AAiOgACjloEBkADRAQAFEKwAGAAYWC/0AAiOgACjloEB9ADRAQAFEKwAGAAYWC/0AAiOgACjloECWADRAQAFEKwAGAAYWC/0AAiOgACjloECvADRAQAFEBAUYABhYL/QACI6AACjloEDIADRAQAFEKwAGAAYWC/0AAiOgACjloEDhADRAQAFEKwAGAAYWC/0AAiOgAAcU7trkbuPs4EAt4r3gQHxggGj8IED",
      "base64",
    ),
  });
  const video = page.locator("video");
  await expect
    .poll(() => video.evaluate((v) => v.readyState))
    .toBeGreaterThanOrEqual(2);
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(false);
  await page
    .getByRole("button", { name: "Wstrzymaj film", exact: true })
    .click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(true);
  await page.getByRole("button", { name: "Odtwórz film", exact: true }).click();
  await expect.poll(() => video.evaluate((v) => v.paused)).toBe(false);
  await page.getByRole("button", { name: "Projekt", exact: true }).click();
  await page.locator('input[accept="application/json"]').setInputFiles({
    name: "invalid.json",
    mimeType: "application/json",
    buffer: Buffer.from('{"version":1,"sections":[]}'),
  });
  await expect(page.getByRole("status")).toContainText("Nieprawidłowy");
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Skilled People.",
  );
});
