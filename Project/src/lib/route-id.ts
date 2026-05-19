/**
 * @domain Shared / Infrastructure / Navigation
 * @SSoT docs/domains/ui-ux/shell-principles.md
 */
const normalize = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

export const toRouteSlug = (value: string): string =>
  normalize(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const lastPathToken = (value: string): string => {
  const parts = value.split("/").filter(Boolean);
  return parts[parts.length - 1] ?? value;
};

export const matchesRouteIdentifier = (
  item: { name: string; unique_name: string },
  identifier: string
): boolean => {
  const raw = identifier.trim();
  const rawNorm = normalize(raw);
  const lastRaw = lastPathToken(raw);
  const lastNorm = normalize(lastRaw);

  const uniqueNorm = normalize(item.unique_name);
  const uniqueTailNorm = normalize(lastPathToken(item.unique_name));
  const nameNorm = normalize(item.name);
  const nameSlug = toRouteSlug(item.name);

  if (rawNorm === uniqueNorm) return true;
  if (lastNorm === uniqueTailNorm) return true;
  if (rawNorm === nameNorm) return true;
  if (toRouteSlug(raw) === nameSlug) return true;
  if (toRouteSlug(lastRaw) === nameSlug) return true;

  return false;
};
