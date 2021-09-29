import { ResultAsync } from 'neverthrow'
import Credential from '../commons/services/orm/models/credentials.database.model'
import Token from '../commons/services/orm/models/tokens.database.model'
import { CredentialModel } from './models/credential.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'

export type CredentialsServiceResult<T> = ResultAsync<T, CredentialsServiceError>

export enum CredentialsServiceError {
  DuplicatedEmail,
  OwnerNotFound,
  DatabaseError,
}

export class CredentialsService {
  static deleteCredentialFromId(
    credential_id: number,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<null> {
    return this.getCredentialFromId(credential_id, transaction)
      .andThen(onTransaction(transaction, destroyOwnersTokens))
      .andThen(onTransaction(transaction, destroyCredential))
      .map(() => null)
  }

  static getCredentialFromId(
    credential_id: number,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<CredentialModel> {
    return ResultAsync.fromPromise(
      Credential.findOne({ where: { id: credential_id }, transaction }),
      () => CredentialsServiceError.DatabaseError
    ).andThen(okIfNotNullElse(CredentialsServiceError.OwnerNotFound))
  }

  static getCredentialFromMailAndPassword(
    email: string,
    hashed_password: string,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<CredentialModel> {
    return ResultAsync.fromPromise(
      Credential.findOne({
        where: { email: email, password: hashed_password },
        transaction,
      }),
      () => CredentialsServiceError.DatabaseError
    ).andThen(okIfNotNullElse(CredentialsServiceError.OwnerNotFound))
  }

  static createCredentialWithId(
    id_type: 'user' | 'shop' | 'admin',
    id: number,
    email: string,
    password: string,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<CredentialModel> {
    return ResultAsync.fromPromise(
      Credential.create(
        {
          email: email,
          password: password,
          [`${id_type}_id`]: id,
        },
        { transaction }
      ),
      () => CredentialsServiceError.DatabaseError
    )
  }

  static isEmailUnique(email: string, transaction: Transaction | null = null): CredentialsServiceResult<null> {
    return ResultAsync.fromPromise(
      Credential.findOne({ where: { email: email }, transaction }),
      () => CredentialsServiceError.DatabaseError
    )
      .map((t) => !t) // Reverse null and not null to match `okIfNotNullElse` function.
      .andThen(okIfNotNullElse(CredentialsServiceError.DuplicatedEmail))
      .map(() => null)
  }
}

// Pipeline

function destroyOwnersTokens(
  credential: CredentialModel,
  transaction: Transaction | null
): CredentialsServiceResult<CredentialModel> {
  return ResultAsync.fromPromise(
    Token.findAll({ where: { credential_id: credential.id }, transaction }),
    () => CredentialsServiceError.DatabaseError
  ).andThen((tokens) =>
    ResultAsync.fromPromise(
      Promise.all(tokens.map((tok) => tok.destroy({ transaction }))),
      () => CredentialsServiceError.DatabaseError
    ).map(() => credential)
  )
}

function destroyCredential(
  credential: CredentialModel,
  transaction: Transaction | null
): CredentialsServiceResult<CredentialModel> {
  return ResultAsync.fromPromise(
    Credential.destroy({ where: { id: credential.id }, transaction }),
    () => CredentialsServiceError.DatabaseError
  ).map(() => credential)
}
