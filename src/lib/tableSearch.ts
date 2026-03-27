/** Client-side table filter: substring match (case-insensitive) across joined fields. */
export function matchesTableSearch(
  raw: string,
  parts: Array<string | number | null | undefined>
): boolean {
  const q = raw.trim().toLowerCase()
  if (!q) return true
  const hay = parts
    .map((p) => (p === null || p === undefined ? '' : String(p)))
    .join(' ')
    .toLowerCase()
  return hay.includes(q)
}
