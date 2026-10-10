/** Shared UTC day parsing for the family's daily embeds. No storage, service or rollover timer. */
export function embedDay(value: string | null | undefined, now = new Date()): string | null {
  if (value === null || value === undefined || ["off", "false", "no", "0"].includes(value.trim().toLowerCase())) return null;
  const asked = value.trim().toLowerCase();
  const day = ["", "today", "on", "true", "1"].includes(asked) ? Number.isNaN(now.getTime()) ? "" : now.toISOString().slice(0, 10) : value.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw new RangeError("Use a real UTC date written YYYY-MM-DD.");
  const time = Date.parse(`${day}T00:00:00Z`);
  if (!Number.isFinite(time) || new Date(time).toISOString().slice(0, 10) !== day) throw new RangeError("Use a real UTC date written YYYY-MM-DD.");
  return day;
}

/** The same day and namespace give the same nonzero 32-bit seed on every machine. */
export function dailySeed(day: string, namespace: string): number {
  const parsed = embedDay(day);
  if (parsed === null) throw new RangeError("A daily seed needs a UTC date.");
  let hash = 2166136261;
  for (const letter of `${parsed}/${namespace}`) hash = Math.imul(hash ^ letter.charCodeAt(0), 16777619) >>> 0;
  return hash || 1;
}
