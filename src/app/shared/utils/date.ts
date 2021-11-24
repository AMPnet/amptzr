export function dateToIsoString(date?: string): string | undefined {
  if (!date) {
    return undefined
  }

  return new Date(date).toISOString()
}
