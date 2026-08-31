/**
 * Hands the user a file without a server round trip.
 *
 * @param data - Anything `JSON.stringify` can serialise.
 * @param filename - Suggested name, e.g. `hibi-export-2026-08-24.json`.
 */
export function downloadJson(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  link.href = url
  link.download = filename
  link.click()

  URL.revokeObjectURL(url)
}
