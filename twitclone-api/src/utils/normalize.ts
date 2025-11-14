export function normalizeUsername(username: string): string {
    return username
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9_]/g, '')
      .normalize('NFC');
}