const STATIC_PATH = "scream/static";

export const DEFAULT_AVATAR_KEY = "Twitter_default_profile_400x400.png";

/** Resolve stored object keys and legacy CDN URLs through SCREAM's static route. */
export function resolveImageUrl(value?: string | null): string {
  if (!value) return "";

  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) return trimmed;

  const base = process.env.NEXT_PUBLIC_CDN_BASE_URL?.replace(/\/+$/, "");
  if (!base) return trimmed;

  let objectKey = trimmed;
  if (objectKey === base || objectKey.startsWith(`${base}/`)) {
    objectKey = objectKey.slice(base.length);
  } else if (/^https?:\/\//i.test(objectKey)) {
    return objectKey;
  }

  objectKey = objectKey.replace(/^\/+/, "");
  if (objectKey.startsWith(`${STATIC_PATH}/`)) {
    objectKey = objectKey.slice(STATIC_PATH.length + 1);
  }

  return `${base}/${STATIC_PATH}/${objectKey}`;
}

export function resolveAvatarUrl(value?: string | null): string {
  return resolveImageUrl(value || DEFAULT_AVATAR_KEY);
}
