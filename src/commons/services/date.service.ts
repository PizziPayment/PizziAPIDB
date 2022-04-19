export function createExpirationDate(kind: 'hour' | 'day', offset: number): Date {
  let value: number = 0

  if (kind === 'hour') {
    value = new Date().setHours(new Date().getHours() + offset)
  } else {
    value = new Date().setDate(new Date().getDate() + offset)
  }

  return new Date(value)
}

export function createAccessTokenLifetime() {
  return createExpirationDate('hour', 1)
}

export function createRefreshTokenLifetime() {
  return createExpirationDate('day', 30)
}
