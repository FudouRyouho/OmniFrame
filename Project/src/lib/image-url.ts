/**
 * @domain Shared / Infrastructure / Images
 */

export const resolveLocalImageUrl = (imageName?: string | null): string | undefined => {
  if (!imageName) return undefined;
  return `/images/${imageName}`;
};

type WithImageFields = {
  image_name?: string | null;
  image?: string | null;
};

/**
 * Puebla `image` desde `image_name`. Es el único productor de ese campo: los artefactos de
 * `public/data` ya no lo traen — resolver la URL es responsabilidad de esta capa, no del pipeline.
 */
export const hydrateImageFromImageName = <T extends WithImageFields>(item: T): T => ({
  ...item,
  image: resolveLocalImageUrl(item.image_name) ?? null,
});