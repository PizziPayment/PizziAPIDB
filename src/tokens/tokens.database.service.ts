import { ResultAsync } from 'neverthrow'
import Token, { TokenCreation } from '../commons/services/orm/models/tokens.database.model'
import { TokenModel } from './models/token.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'
import { randomBytes } from 'crypto'
import { ClientModel } from '../clients/models/client.model'
import { CredentialModel } from '../credentials/models/credential.model'
import { ErrorCause, IPizziError, PizziError } from '../commons/models/service.error.model'

export type TokensServiceResult<T> = ResultAsync<T, IPizziError>

export class TokensService {
  static generateTokenBetweenClientAndCredential(
    client: ClientModel,
    credential: CredentialModel,
    transaction: Transaction | null = null
  ): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.findOne({
        where: {
          client_id: client.id,
          credential_id: credential.id,
        },
        transaction,
      }),
      () => PizziError.internalError()
    ).andThen((token) => {
      if (!token) {
        return ResultAsync.fromPromise(Token.create(this.generateToken(client, credential), { transaction }), () =>
          PizziError.internalError()
        )
      } else {
        return ResultAsync.fromPromise(
          Object.assign(token, this.generateToken(client, credential)).save({ transaction }),
          () => PizziError.internalError()
        )
      }
    })
  }

  static getTokenFromValue(token: string, transaction: Transaction | null = null): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(Token.findOne({ where: { access_token: token }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.TokenNotFound, `invalid token: ${token}`)))
  }

  static getTokenFromId(token_id: number, transaction: Transaction | null = null): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(Token.findOne({ where: { id: token_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.TokenNotFound, `invalid token_id ${token_id}`)))
  }

  static deleteUserToken(token: TokenModel, transaction: Transaction | null = null): TokensServiceResult<null> {
    return this.getTokenFromId(token.id, transaction)
      .andThen(onTransaction(transaction, destroyToken))
      .map(() => null)
  }

  static deleteTokensFromCredentialId(
    credential_id: number,
    transaction: Transaction | null = null
  ): TokensServiceResult<null> {
    return ResultAsync.fromPromise(Token.destroy({ where: { credential_id: credential_id }, transaction }), () =>
      PizziError.internalError()
    ).map(() => null)
  }

  private static generateToken(client: ClientModel, credential: CredentialModel): TokenCreation {
    return {
      access_token: randomBytes(20).toString('hex'),
      refresh_token: randomBytes(20).toString('hex'),
      expires_at: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
      client_id: client.id,
      credential_id: credential.id,
    }
  }
}

// Pipeline

function destroyToken(token: TokenModel, transaction: Transaction | null): TokensServiceResult<TokenModel> {
  return ResultAsync.fromPromise(Token.destroy({ where: { id: token.id }, transaction }), () =>
    PizziError.internalError()
  ).map(() => token)
}
