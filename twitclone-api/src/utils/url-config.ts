const LOCAL_URL_PATTERN = /^(localhost|127(?:\.\d{1,3}){3})(?::|\/|$)/i;

function sanitizeUrlValue(value: string) {
    return value.trim().replace(/^['"]|['"]$/g, "").replace(/\/+$/, "");
}

function normalizeConfiguredUrl(value?: string | null) {
    if (!value) {
        return "";
    }

    const sanitized = sanitizeUrlValue(value);
    if (!sanitized) {
        return "";
    }

    if (/^https?:\/\//i.test(sanitized)) {
        return sanitized;
    }

    const scheme = LOCAL_URL_PATTERN.test(sanitized) ? "http" : "https";
    return `${scheme}://${sanitized}`;
}

function uniqueValues(values: string[]) {
    return Array.from(new Set(values));
}

function parseConfiguredUrls(...values: Array<string | null | undefined>) {
    return uniqueValues(
        values
            .flatMap((value) => (value ? value.split(/[\n,]/) : []))
            .map((value) => normalizeConfiguredUrl(value))
            .filter((value) => value.length > 0)
    );
}

function toUrlOrigin(url: string) {
    try {
        return new URL(url).origin;
    } catch {
        return url;
    }
}

function toUniqueOrigins(urls: string[]) {
    return uniqueValues(urls.map((url) => toUrlOrigin(url)));
}

export { normalizeConfiguredUrl, parseConfiguredUrls, toUniqueOrigins };
