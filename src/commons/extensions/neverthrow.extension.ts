import { errAsync, okAsync, ResultAsync } from 'neverthrow'

export function okIfNotNullElse<T, E>(error: E): (t: T | null) => ResultAsync<T, E> {
  return (t) => (t ? okAsync(t) : errAsync(error))
}

export function mapUpdatedRow<T, E>(error: E): (results: [number, T[]]) => ResultAsync<T, E> {
  return (results) => {
    if (results[0] === 1) {
      return okAsync(results[1][0])
    } else {
      return errAsync(error)
    }
  }
}
