import { defaults } from "./defaults.js";
import { legacyDefaults } from "./legacyDefaults.js";

const copy = (value) =>
  value === undefined ? undefined : JSON.parse(JSON.stringify(value));
const isObject = (value) => value !== null && typeof value === "object";

function equal(left, right) {
  if (left === right) return true;
  if (!isObject(left) || !isObject(right)) return false;
  if (Array.isArray(left) !== Array.isArray(right)) return false;
  const keys = Object.keys(left);
  return (
    keys.length === Object.keys(right).length &&
    keys.every(
      (key) => Object.hasOwn(right, key) && equal(left[key], right[key]),
    )
  );
}

/** Adopt new defaults field by field, without overwriting a user's edits. */
function merge(saved, previous, current, replaceUnchanged) {
  if (saved === undefined) return copy(current);
  if (replaceUnchanged && previous !== undefined && equal(saved, previous))
    return copy(current);
  if (!isObject(saved) || !isObject(current)) return copy(saved);
  if (Array.isArray(current)) {
    if (!Array.isArray(saved)) return copy(saved);
    // Section order is editorial state. Match sections by id, never by their position.
    if (
      current.every((item) => isObject(item) && typeof item.id === "string")
    ) {
      const migrated = saved.map((item) => {
        const next = current.find((section) => section.id === item?.id);
        if (!next) return copy(item);
        const prior = Array.isArray(previous)
          ? previous.find((section) => section.id === item.id)
          : undefined;
        return merge(item, prior, next, replaceUnchanged);
      });
      for (const item of current) {
        if (!saved.some((section) => section?.id === item.id))
          migrated.push(copy(item));
      }
      return migrated;
    }
    return saved.map((item, index) =>
      current[index] === undefined
        ? copy(item)
        : merge(item, previous?.[index], current[index], replaceUnchanged),
    );
  }
  if (Array.isArray(saved)) return copy(saved);
  const result = copy(saved);
  for (const [key, value] of Object.entries(current)) {
    result[key] = merge(saved[key], previous?.[key], value, replaceUnchanged);
  }
  return result;
}

/** Call after validating an imported/saved project. Does not mutate its input. */
export function migrateSettings(saved) {
  if (!isObject(saved) || Array.isArray(saved)) return copy(saved);
  const currentRevision = defaults.designRevision ?? 1;
  const savedRevision = saved.designRevision ?? 1;
  if (savedRevision > currentRevision) return copy(saved);
  const migrated = merge(
    saved,
    legacyDefaults,
    defaults,
    savedRevision < currentRevision,
  );
  migrated.designRevision = currentRevision;
  if (!migrated.logo && defaults.logo) migrated.logo = defaults.logo;
  return migrated;
}
