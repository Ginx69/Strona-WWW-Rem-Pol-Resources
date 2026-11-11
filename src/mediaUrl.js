/** Files bundled with the prototype, retained separately from user media URLs. */
export const bundledMediaFiles = [
  "industrial-concept.png",
  "industrial-details.png",
  "shipyard-hero.png",
  "norway-fjord.png",
  "shipyard-team.png",
];
const bundledPaths = new Set(bundledMediaFiles.map((file) => "/" + file));

/** Resolve bundled media for GitHub Pages or the optional offline HTML build. */
export function resolveMediaUrl(value) {
  if (typeof value !== "string") return value;
  const marker = value.indexOf("#");
  const path = marker === -1 ? value : value.slice(0, marker);
  const fragment = marker === -1 ? "" : value.slice(marker);
  if (globalThis.REMPOL_MEDIA && Object.hasOwn(globalThis.REMPOL_MEDIA, path))
    return globalThis.REMPOL_MEDIA[path] + fragment;
  if (!bundledPaths.has(path)) return value;
  const base = import.meta.env?.BASE_URL || "/";
  return base.replace(/\/?$/, "/") + path.slice(1) + fragment;
}
