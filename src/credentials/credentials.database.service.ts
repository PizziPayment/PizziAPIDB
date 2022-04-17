import { errAsync, okAsync, ResultAsync } from 'neverthrow'
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
    return ResultAsync.fromPromise(
      Credential.destroy({ where: { id: credential_id }, transaction }),
      () => CredentialsServiceError.DatabaseError
    ).andThen((nb) => {
      if (nb == 0) {
        return errAsync(CredentialsServiceError.OwnerNotFound)
      } else {
        return okAsync(null)
      }
    })
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

  static getCredentialFromEmailAndPassword(
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

  static changePassword(
    credential_id: number,
    hashed_password: string,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<null> {
    return ResultAsync.fromPromise(
      Credential.findOne({ where: { id: credential_id }, transaction }),
      () => CredentialsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(CredentialsServiceError.OwnerNotFound))
      .andThen((credential) =>
        ResultAsync.fromPromise(
          credential.set('password', hashed_password).save({ transaction }),
          () => CredentialsServiceError.DatabaseError
        )
      )
      .andThen(onTransaction(transaction, destroyOwnersTokens))
      .map(() => null)
  }

  static changeEmail(
    credential_id: number,
    email: string,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<null> {
    return ResultAsync.fromPromise(
      Credential.findOne({ where: { id: credential_id }, transaction }),
      () => CredentialsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(CredentialsServiceError.OwnerNotFound))
      .andThen((credential) =>
        ResultAsync.fromPromise(
          credential.set('email', email).save({ transaction }),
          () => CredentialsServiceError.DatabaseError
        )
      )
      .map(() => null)
  }

  static createCredentialWithId(
    id_type: 'user' | 'shop' | 'admin',
    id: number,
    email: string,
    hashed_password: string,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<CredentialModel> {
    return ResultAsync.fromPromise(
      Credential.create(
        {
          email: email,
          password: hashed_password,
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
    Token.destroy({ where: { credential_id: credential.id }, transaction }),
    () => CredentialsServiceError.DatabaseError
  ).map(() => credential)
}
