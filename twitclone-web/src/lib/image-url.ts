export const DEFAULT_AVATAR_KEY = "Twitter_default_profile_400x400.png";

/** Resolve object keys against the complete CDN prefix supplied by the environment. */
export function resolveImageUrl(value?: string | null): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;

  const base = process.env.NEXT_PUBLIC_CDN_BASE_URL?.replace(/\/+$/, "");
  if (!base) return trimmed;

  const baseUrl = new URL(base);
  let objectKey = trimmed;
  let suffix = "";

  if (/^https?:\/\//i.test(objectKey)) {
    const imageUrl = new URL(objectKey);
    if (imageUrl.origin !== baseUrl.origin) return objectKey;

    objectKey = imageUrl.pathname;
    suffix = `${imageUrl.search}${imageUrl.hash}`;
  }

  objectKey = objectKey.replace(/^\/+/, "");
  const basePath = baseUrl.pathname.replace(/^\/+|\/+$/g, "");
  if (basePath && objectKey.startsWith(`${basePath}/`)) {
    objectKey = objectKey.slice(basePath.length + 1);
  }

  return `${base}/${objectKey}${suffix}`;
}

export function resolveAvatarUrl(value?: string | null): string {
  return resolveImageUrl(value || DEFAULT_AVATAR_KEY);
}
