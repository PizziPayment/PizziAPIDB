import { Result } from 'neverthrow'

export type DatabaseServiceResult<T> = Result<T, DatabaseServiceError>

export enum DatabaseServiceError {
  OwnerNotFound,
  ClientNotFound,
  DatabaseError,
  TokenNotFound,
  DuplicatedEmail,
}
