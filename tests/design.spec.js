import { test, expect } from "@playwright/test";
import { legacyDefaults } from "../src/legacyDefaults.js";
import { migrateSettings } from "../src/projectSettings.js";

const key = "rempol-prototype-v1";
const clone = (value) => JSON.parse(JSON.stringify(value));

function savedProject() {
  const project = clone(legacyDefaults);
  project.sections.reverse();
  project.sections.find((s) => s.id === "home").title =
    "Our people. Our shared future.";
  project.sections.find((s) => s.id === "about").visible = false;
  project.sections.find((s) => s.id === "careers").padding = 42;
  project.red = "#B02030";
  return project;
}

test("design migration preserves editorial changes and is repeatable", () => {
  const old = savedProject();
  const unchanged = clone(old);
  const updated = migrateSettings(old);
  expect(old).toEqual(unchanged);
  expect(updated.designRevision).toBe(2);
  expect(updated.heroSize).toBe(56);
  expect(updated.heroX).toBe(5.3);
  expect(updated.red).toBe("#B02030");
  expect(updated.sections.map((s) => s.id)).toEqual(
    old.sections.map((s) => s.id),
  );
  expect(updated.sections.find((s) => s.id === "home")).toMatchObject({
    title: "Our people. Our shared future.",
    height: 400,
    padding: 40,
    image: "/shipyard-hero.png",
  });
  expect(updated.sections.find((s) => s.id === "about").visible).toBe(false);
  expect(updated.sections.find((s) => s.id === "careers").padding).toBe(42);
  expect(migrateSettings(updated)).toEqual(updated);
  const customImage = clone(old);
  customImage.sections.find((s) => s.id === "home").image =
    "data:image/png;base64,dXNlci1pbWFnZQ==";
  customImage.logo = "data:image/png;base64,dXNlci1sb2dv";
  expect(migrateSettings(customImage).logo).toBe(customImage.logo);
  expect(
    migrateSettings(customImage).sections.find((s) => s.id === "home").image,
  ).toBe(customImage.sections.find((s) => s.id === "home").image);
});

test("loading an old saved homepage applies the new design and keeps user edits", async ({
  page,
}) => {
  const project = savedProject();
  await page.addInitScript(
    ({ key, project }) => localStorage.setItem(key, JSON.stringify(project)),
    { key, project },
  );
  await page.goto("http://127.0.0.1:5173");
  await expect(page.getByRole("heading", { level: 1 })).toHaveText(
    "Our people. Our shared future.",
  );
  await expect(page.locator("#about")).toHaveCount(0);
  await expect(page.locator("main > section").first()).toHaveAttribute(
    "id",
    "contact",
  );
  await expect
    .poll(() =>
      page.evaluate(
        (key) => JSON.parse(localStorage.getItem(key)).designRevision,
        key,
      ),
    )
    .toBe(2);
  const saved = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)),
    key,
  );
  expect(saved.heroSize).toBe(56);
  expect(saved.sections.find((s) => s.id === "home")).toMatchObject({
    height: 400,
    padding: 40,
    image: "/shipyard-hero.png",
  });
  expect(saved.red).toBe("#B02030");
});

for (const viewport of [
  { width: 1440, height: 1000 },
  { width: 390, height: 844 },
]) {
  test(`hero editor controls affect the rendered design at ${viewport.width}px`, async ({
    page,
  }) => {
    await page.setViewportSize(viewport);
    await page.goto("http://127.0.0.1:5173");
    await page.getByRole("button", { name: "Edit Mode", exact: true }).click();
    if (viewport.width === 390) {
      const panel = await page.locator(".editor").boundingBox();
      expect(panel.y).toBeGreaterThan(viewport.height * 0.45);
      expect(panel.width).toBe(viewport.width);
    }
    const font = () =>
      page
        .locator("#home h1")
        .evaluate((el) => parseFloat(getComputedStyle(el).fontSize));
    const left = () =>
      page
        .locator(".hero-copy")
        .evaluate((el) => parseFloat(getComputedStyle(el).left));
    const oldFont = await font();
    const sizeSlider = page.getByRole("slider", { name: /Wielkość nagłówka/ });
    await sizeSlider.press("Home");
    for (let i = 0; i < 10; i++) await sizeSlider.press("ArrowRight");
    await expect.poll(font).not.toBe(oldFont);
    await expect
      .poll(font)
      .toBeCloseTo(42 * (viewport.width === 390 ? 0.72 : 1), 1);
    const oldLeft = await left();
    await page.getByRole("slider", { name: /Położenie poziome/ }).press("End");
    await expect.poll(left).toBeGreaterThan(oldLeft);
    await page
      .locator(".editor")
      .getByRole("button", { name: "Our services", exact: true })
      .click();
    await page.getByRole("slider", { name: /Odstępy pionowe/ }).press("Home");
    await expect
      .poll(() =>
        page
          .locator("#services")
          .evaluate((el) => parseFloat(getComputedStyle(el).paddingTop)),
      )
      .toBe(0);
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth),
    ).toBe(viewport.width);
  });
}

test("desktop services navigate within the homepage and bundled photographs decode", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("http://127.0.0.1:5173");
  const originalUrl = page.url();
  const navigation = page.getByRole("navigation", { name: "Main navigation" });
  const services = navigation.getByRole("button", {
    name: "Our Services",
    exact: true,
  });
  await services.click();
  await expect(services).toHaveAttribute("aria-expanded", "true");
  await expect(page.locator(".services-dropdown")).toBeVisible();
  await page
    .locator(".services-dropdown")
    .getByRole("button", { name: "Piping & Installation", exact: true })
    .click();
  await expect(page.locator(".services-dropdown")).toHaveCount(0);
  const target = page.locator("#service-1");
  await expect(target).toContainText("Piping &");
  await expect
    .poll(async () => {
      const bounds = await target.boundingBox();
      return bounds !== null && bounds.y >= 0 && bounds.y < 1000;
    })
    .toBe(true);
  expect(page.url()).toBe(originalUrl);
  await expect(page.locator("main > section")).toHaveCount(6);
  await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
  const photographs = [
    [".hero-media", "/shipyard-hero.png"],
    [".about-landscape", "/norway-fjord.png"],
    [".careers-image", "/shipyard-team.png"],
  ];
  for (const [selector, path] of photographs)
    await expect(page.locator(selector)).toHaveCSS(
      "background-image",
      new RegExp(path),
    );
  const dimensions = await page.evaluate(
    async (paths) =>
      Promise.all(
        paths.map(async (path) => {
          const image = new Image();
          image.src = path;
          await image.decode();
          return { width: image.naturalWidth, height: image.naturalHeight };
        }),
      ),
    photographs.map(([, path]) => path),
  );
  for (const image of dimensions) {
    expect(image.width).toBeGreaterThan(500);
    expect(image.height).toBeGreaterThan(250);
  }
});
