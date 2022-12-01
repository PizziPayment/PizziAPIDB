import { ResultAsync } from 'neverthrow'
import Credential from '../commons/services/orm/models/credentials.database.model'
import { CredentialModel } from './models/credential.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { ErrorCause, PizziResult, PizziError } from '../commons/models/service.error.model'
import { TokensService } from '../tokens/tokens.database.service'

export class CredentialsService {
  static deleteCredentialFromOwnerId(
    id_type: 'user' | 'shop' | 'admin',
    id: number,
    transaction?: Transaction
  ): PizziResult<void> {
    return ResultAsync.fromPromise(
      Credential.destroy({ where: { [`${id_type}_id`]: id }, transaction }),
      PizziError.internalError
    )
      .andThen(
        okIfNotNullElse(new PizziError(ErrorCause.CredentialNotFound, `Credential for ${id_type} ${id} not found`))
      )
      .map(() => undefined)
  }

  static deleteCredentialFromId(credential_id: number, transaction: Transaction | null = null): PizziResult<null> {
    return ResultAsync.fromPromise(Credential.destroy({ where: { id: credential_id }, transaction }), () =>
      PizziError.internalError()
    ).map(() => null)
  }

  static getCredentialFromId(
    credential_id: number,
    transaction: Transaction | null = null
  ): PizziResult<CredentialModel> {
    return ResultAsync.fromPromise(Credential.findOne({ where: { id: credential_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.CredentialNotFound, `invalid credential_id: ${credential_id}`)))
  }

  static getCredentialFromEmailAndPassword(
    email: string,
    hashed_password: string,
    transaction: Transaction | null = null
  ): PizziResult<CredentialModel> {
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

  static changeEmailAndPassword(
    credential_id: number,
    email?: string,
    password?: string,
    transaction?: Transaction
  ): PizziResult<null> {
    return ResultAsync.fromPromise(
      Credential.update({ email, password }, { where: { id: credential_id }, transaction }),
      () => PizziError.internalError()
    )
      .map(([affected_rows]) => affected_rows)
      .andThen(
        okIfNotNullElse(new PizziError(ErrorCause.CredentialNotFound, `invalid credential_id: ${credential_id}`))
      )
      .map(() => TokensService.deleteTokensFromCredentialId(credential_id))
      .map(() => null)
  }

  static createCredentialWithId(
    id_type: 'user' | 'shop' | 'admin',
    id: number,
    email: string,
    hashed_password: string,
    transaction: Transaction | null = null
  ): PizziResult<CredentialModel> {
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

  static isEmailUnique(email: string, transaction: Transaction | null = null): PizziResult<null> {
    return ResultAsync.fromPromise(Credential.findOne({ where: { email: email }, transaction }), () =>
      PizziError.internalError()
    )
      .map((t) => !t) // Reverse null and not null to match `okIfNotNullElse` function.
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.DuplicatedEmail, email)))
      .map(() => null)
  }
}
