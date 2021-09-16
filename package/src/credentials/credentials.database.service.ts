import { okAsync, ResultAsync } from 'neverthrow'
import Credential from '../commons/services/orm/models/credentials.database.model'
import Token from '../commons/services/orm/models/tokens.database.model'
import { CredentialModel } from './models/credential.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'

export type CredentialsServiceResult<T> = ResultAsync<T, CredentialsServiceError>

export enum CredentialsServiceError {
  DuplicatedEmail,
  OwnerNotFound,
  DatabaseError,
}

export class CredentialsService {
  static deleteCredentialFromId(credential_id: number): CredentialsServiceResult<null> {
    return this.getCredentialFromId(credential_id)
      .andThen(destroyOwnersTokens)
      .andThen(destroyCredential)
      .map(() => null)
  }

  static getCredentialFromId(credential_id: number): CredentialsServiceResult<CredentialModel> {
    return ResultAsync.fromPromise(
      Credential.findOne({ where: { id: credential_id } }),
      () => CredentialsServiceError.DatabaseError
    ).andThen(okIfNotNullElse(CredentialsServiceError.OwnerNotFound))
  }

  static createCredentialWithId(
    id_type: 'user' | 'shop' | 'admin',
    id: number,
    email: string,
    password: string
  ): CredentialsServiceResult<CredentialModel> {
    return ResultAsync.fromPromise(
      Credential.create({
        email: email,
        password: password,
        [`${id_type}_id`]: id,
      }),
      () => CredentialsServiceError.DatabaseError
    )
  }

  static isEmailUnique(email: string): CredentialsServiceResult<null> {
    return ResultAsync.fromPromise(
      Credential.findOne({ where: { email: email } }),
      () => CredentialsServiceError.DatabaseError
    )
      .map((t) => !t) // Reverse null and not null to match `okIfNotNullElse` function.
      .andThen(okIfNotNullElse(CredentialsServiceError.DuplicatedEmail))
      .map(() => null)
  }
}

// Pipeline

function destroyOwnersTokens(credential: CredentialModel): CredentialsServiceResult<CredentialModel> {
  return ResultAsync.fromPromise(
    Token.findAll({ where: { credential_id: credential.id } }),
    () => CredentialsServiceError.DatabaseError
  ).andThen((tokens) =>
    ResultAsync.fromPromise(
      Promise.all(tokens.map((tok) => tok.destroy())),
      () => CredentialsServiceError.DatabaseError
    ).map(() => credential)
  )
}

function destroyCredential(credential: CredentialModel): CredentialsServiceResult<CredentialModel> {
  return ResultAsync.fromPromise(
    Credential.destroy({ where: { id: credential.id } }),
    () => CredentialsServiceError.DatabaseError
  ).map(() => credential)
}
