export function assignNonNullValues(obj: Object): Record<string, string | number> {
  const record: Record<string, string | number> = {}

  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined && value !== null) {
      record[key] = value
    }
  }

  return record
}
