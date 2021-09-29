import { errAsync, okAsync, ResultAsync } from 'neverthrow'

export function okIfNotNullElse<T, E>(error: E): (t: T | null) => ResultAsync<T, E> {
  return (t) => (t ? okAsync(t) : errAsync(error))
}
