import { ResultAsync } from 'neverthrow'
import Credential from '../commons/services/orm/models/credentials.database.model'
import Token from '../commons/services/orm/models/tokens.database.model'
import { CredentialModel } from './models/credential.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'
import { ErrorCause, IPizziError, PizziError } from '../commons/models/service.error.model'

export type CredentialsServiceResult<T> = ResultAsync<T, IPizziError>

export class CredentialsService {
  static deleteCredentialFromId(
    credential_id: number,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<null> {
    return ResultAsync.fromPromise(
      Credential.destroy({ where: { id: credential_id }, transaction }),
      () => PizziError.internalError()
    )
      .map((_) => null)
  }

  static getCredentialFromId(
    credential_id: number,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<CredentialModel> {
    return ResultAsync.fromPromise(Credential.findOne({ where: { id: credential_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.CredentialNotFound, `invalid credential_id: ${credential_id}`)))
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
      () => PizziError.internalError()
    ).andThen(
      okIfNotNullElse(
        new PizziError(ErrorCause.CredentialNotFound, `invalid email: ${email} or password: ${hashed_password}`)
      )
    )
  }

  static changePassword(
    credential_id: number,
    hashed_password: string,
    transaction: Transaction | null = null
  ): CredentialsServiceResult<null> {
    return ResultAsync.fromPromise(Credential.findOne({ where: { id: credential_id }, transaction }), () =>
      PizziError.internalError()
    )
      .andThen(
        okIfNotNullElse(new PizziError(ErrorCause.CredentialNotFound, `invalid credential_id: ${credential_id}`))
      )
      .andThen((credential) =>
        ResultAsync.fromPromise(credential.set('password', hashed_password).save({ transaction }), () =>
          PizziError.internalError()
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
    return ResultAsync.fromPromise(Credential.findOne({ where: { id: credential_id }, transaction }), () =>
      PizziError.internalError()
    )
      .andThen(
        okIfNotNullElse(new PizziError(ErrorCause.CredentialNotFound, `invalid credential_id: ${credential_id}`))
      )
      .andThen((credential) =>
        ResultAsync.fromPromise(credential.set('email', email).save({ transaction }), () => PizziError.internalError())
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
      () => PizziError.internalError()
    )
  }

  static isEmailUnique(email: string, transaction: Transaction | null = null): CredentialsServiceResult<null> {
    return ResultAsync.fromPromise(Credential.findOne({ where: { email: email }, transaction }), () =>
      PizziError.internalError()
    )
      .map((t) => !t) // Reverse null and not null to match `okIfNotNullElse` function.
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.DuplicatedEmail, email)))
      .map(() => null)
  }
}

// Pipeline

function destroyOwnersTokens(
  credential: CredentialModel,
  transaction: Transaction | null
): CredentialsServiceResult<CredentialModel> {
  return ResultAsync.fromPromise(Token.destroy({ where: { credential_id: credential.id }, transaction }), () =>
    PizziError.internalError()
  ).map(() => credential)
}
