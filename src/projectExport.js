import JSZip from "jszip";
import { bundledMediaFiles, resolveMediaUrl } from "./mediaUrl";
import ownSource from "./projectExport.js?raw";

/** Bundle the editable source, settings and bundled media for agency handoff. */
export async function createProjectArchive(config) {
  const zip = new JSZip();
  const files = import.meta.glob(
    [
      "./*.{js,jsx,css}",
      "../tests/*.js",
      "../scripts/*.mjs",
      "../.github/workflows/*.yml",
      "../index.html",
      "../package.json",
      "../package-lock.json",
      "../vite.config.js",
      "../playwright.config.js",
      "../README.md",
      "../environment-setup.sh",
      "../.gitignore",
    ],
    { query: "?raw", import: "default", eager: true },
  );
  for (const [path, source] of Object.entries(files)) {
    const target = path.startsWith("../")
      ? path.slice(3)
      : "src/" + path.slice(2);
    zip.file(target, source);
  }
  zip.file("src/projectExport.js", ownSource);
  zip.file("settings.json", JSON.stringify(config, null, 2));
  for (const file of bundledMediaFiles) {
    const response = await fetch(resolveMediaUrl("/" + file));
    if (!response.ok)
      throw new Error("Nie udało się pobrać materiałów do eksportu.");
    zip.file("public/" + file, await response.arrayBuffer());
  }
  zip.file(
    "README-EXPORT.txt",
    "npm ci\nnpm run dev\nOpen the application and import settings.json in Edit Mode. Uploaded media are included in settings.json.",
  );
  return zip.generateAsync({ type: "uint8array" });
}
