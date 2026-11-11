import { test, expect } from "@playwright/test";
import { build } from "vite";
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, resolve, sep } from "node:path";
import { tmpdir } from "node:os";
import JSZip from "jszip";
import { resolveMediaUrl } from "../src/mediaUrl.js";

const prefix = "/Strona-WWW-Rem-Pol-Resources/";

test("media resolver preserves custom URLs and offline embedded media", () => {
  for (const value of [
    "https://example.com/logo.png#original",
    "data:image/png;base64,AAA",
    "blob:https://example.com/upload",
    "/custom/logo.svg",
    "./my-photo.jpg",
    "//cdn.example.com/photo.png",
  ])
    expect(resolveMediaUrl(value)).toBe(value);
  expect(resolveMediaUrl("/industrial-details.png#tile=3")).toBe(
    "/industrial-details.png#tile=3",
  );
  globalThis.REMPOL_MEDIA = { "/industrial-details.png": "blob:offline-sheet" };
  try {
    expect(resolveMediaUrl("/industrial-details.png#tile=3")).toBe(
      "blob:offline-sheet#tile=3",
    );
    expect(resolveMediaUrl("/custom/logo.svg")).toBe("/custom/logo.svg");
  } finally {
    delete globalThis.REMPOL_MEDIA;
  }
});

test("production Pages path loads photos and exports an editable project", async ({
  browser,
}) => {
  test.setTimeout(45000);
  const output = resolve(tmpdir(), "rempol-pages-validation");
  await build({
    base: prefix,
    build: { outDir: output, emptyOutDir: true },
    logLevel: "error",
  });
  const types = {
    ".html": "text/html",
    ".js": "application/javascript",
    ".css": "text/css",
    ".png": "image/png",
    ".woff2": "font/woff2",
  };
  const server = createServer(async (request, response) => {
    const pathname = decodeURIComponent(
      new URL(request.url, "http://localhost").pathname,
    );
    if (!pathname.startsWith(prefix)) {
      response.writeHead(404);
      response.end();
      return;
    }
    const path = resolve(output, pathname.slice(prefix.length) || "index.html");
    if (!path.startsWith(output + sep)) {
      response.writeHead(403);
      response.end();
      return;
    }
    try {
      const contents = await readFile(path);
      response.writeHead(200, {
        "Content-Type": types[extname(path)] || "application/octet-stream",
      });
      response.end(contents);
    } catch {
      response.writeHead(404);
      response.end();
    }
  });
  await new Promise((done) => server.listen(0, "127.0.0.1", done));
  const context = await browser.newContext();
  try {
    const page = await context.newPage();
    const origin = `http://127.0.0.1:${server.address().port}`;
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin + prefix);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Skilled People. Strong Projects.",
    );
    const photos = await page
      .locator(".hero-media,.service-image,.about-landscape,.careers-image")
      .evaluateAll(async (elements) =>
        Promise.all(
          elements.map(async (element) => {
            const url = getComputedStyle(element).backgroundImage.match(
              /url\(["']?(.*?)["']?\)/,
            )[1];
            const image = new Image();
            image.src = url;
            await image.decode();
            return { url, width: image.naturalWidth };
          }),
        ),
      );
    expect(photos).toHaveLength(7);
    for (const photo of photos) {
      expect(photo.url).toContain(origin + prefix);
      expect(photo.width).toBeGreaterThan(500);
    }
    await page.getByRole("button", { name: "Edit Mode", exact: true }).click();
    await page
      .getByLabel("Nagłówek", { exact: true })
      .fill("Pages preview works.");
    await page.reload();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Pages preview works.",
    );
    await page.getByRole("button", { name: "Edit Mode", exact: true }).click();
    await page.getByRole("button", { name: "Projekt", exact: true }).click();
    const [json] = await Promise.all([
      page.waitForEvent("download"),
      page
        .getByRole("button", { name: "Eksportuj ustawienia JSON", exact: true })
        .click(),
    ]);
    expect(json.suggestedFilename()).toBe("rempol-settings.json");
    const [download] = await Promise.all([
      page.waitForEvent("download"),
      page
        .getByRole("button", { name: "Eksportuj projekt ZIP", exact: true })
        .click(),
    ]);
    const archive = await JSZip.loadAsync(
      await readFile(await download.path()),
    );
    expect(archive.file("src/mediaUrl.js")).not.toBeNull();
    for (const file of [
      "industrial-concept.png",
      "industrial-details.png",
      "shipyard-hero.png",
      "norway-fjord.png",
      "shipyard-team.png",
    ]) {
      const contents = await archive.file("public/" + file).async("uint8array");
      expect(Array.from(contents.slice(0, 4))).toEqual([137, 80, 78, 71]);
    }
    expect(errors).toEqual([]);
  } finally {
    await context.close();
    await new Promise((done) => server.close(done));
  }
});
