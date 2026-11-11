import { build } from "vite";
import { readFile, writeFile, readdir, mkdir } from "node:fs/promises";
import { dirname, extname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { tmpdir } from "node:os";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const output = join(tmpdir(), "rempol-standalone-build");
const destination = join(root, "artifacts/rempol-interactive.html");

await build({
  root,
  configFile: join(root, "vite.config.js"),
  publicDir: false,
  base: "./",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: output,
    emptyOutDir: true,
    copyPublicDir: false,
    cssCodeSplit: false,
    lib: {
      entry: join(root, "src/main.jsx"),
      formats: ["iife"],
      name: "RempolPrototype",
      fileName: () => "prototype.js",
    },
    rollupOptions: { output: { inlineDynamicImports: true } },
  },
});

const mimeTypes = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".woff2": "font/woff2",
  ".woff": "font/woff",
};
const media = {};
for (const file of await readdir(join(root, "public"))) {
  const mime = mimeTypes[extname(file).toLowerCase()];
  if (!mime) continue;
  media["/" + file] = {
    type: mime,
    data: (await readFile(join(root, "public", file))).toString("base64"),
  };
}
let css = "";
for (const file of await readdir(output)) {
  if (file.endsWith(".css")) css += await readFile(join(output, file), "utf8");
}
// Library mode normally embeds these already; resolve emitted font URLs as well.
const urls = [...css.matchAll(/url\(["']?([^"')]+)["']?\)/g)];
for (const [, url] of urls) {
  if (url.startsWith("data:") || /^(https?:|#)/.test(url)) continue;
  const file = resolve(output, url.replace(/^\//, ""));
  const mime = mimeTypes[extname(file)] || "application/octet-stream";
  const encoded = `data:${mime};base64,${(await readFile(file)).toString("base64")}`;
  css = css.split(url).join(encoded);
}
const javascript = await readFile(join(output, "prototype.js"), "utf8");
const initialization = `
(() => {
  const encoded = ${JSON.stringify(media)};
  const urls = Object.create(null);
  for (const [path, file] of Object.entries(encoded)) {
    const bytes = Uint8Array.from(atob(file.data), c => c.charCodeAt(0));
    urls[path] = URL.createObjectURL(new Blob([bytes], {type:file.type}));
  }
  window.REMPOL_MEDIA = urls;
  const originalFetch = window.fetch.bind(window);
  window.fetch = (input, options) => {
    const path = typeof input === 'string' ? input : input instanceof URL ? input.href : null;
    return originalFetch(path && Object.hasOwn(urls, path) ? urls[path] : input, options);
  };
})();`;
const scriptText = initialization + "\n" + javascript;
const html = `<!doctype html>
<html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#141B36"><title>Rem-Pol Resources — Interactive Prototype</title><style>${css.replace(/<\/style/gi, "<\\/style")}</style></head><body><div id="root"></div><script>${scriptText.replace(/<\/script/gi, "<\\/script")}</script></body></html>`;
await mkdir(dirname(destination), { recursive: true });
await writeFile(destination, html);
console.log(
  `Portable interactive HTML: ${destination} (${(Buffer.byteLength(html) / 1024 / 1024).toFixed(1)} MiB)`,
);
