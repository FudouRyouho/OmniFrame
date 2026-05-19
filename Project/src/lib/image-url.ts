/**
 * @domain Shared / Infrastructure / Images
 * @SSoT docs/domains/integration/runtime-hydration.md
 */
export const resolveLocalImageUrl = (imageName?: string | null): string | undefined => {
  if (!imageName) return undefined;
  return `/images/${imageName}`;
};

type WithImageFields = {
  image_name?: string | null;
  image?: string | null;
};

export const hydrateImageFromImageName = <T extends WithImageFields>(item: T): T & { image: string | null } => {
  const local = resolveLocalImageUrl(item.image_name);
  return {
    ...item,
    image: local ?? item.image ?? null,
  };
};