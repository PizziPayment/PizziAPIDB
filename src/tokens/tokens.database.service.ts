import { randomBytes } from 'crypto'
import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { createAccessTokenLifetime, createRefreshTokenLifetime } from '../commons/services/date.service'
import Token, { TokenCreation } from '../commons/services/orm/models/tokens.database.model'
import { TokenModel } from './models/token.model'
import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'

export class TokensService {
  static generateTokenBetweenClientAndCredential(
    client_id: number,
    credential_id: number,
    access_expires_at: Date = createAccessTokenLifetime(),
    refresh_expires_at: Date = createRefreshTokenLifetime(),
    transaction: Transaction | null = null
  ): PizziResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.create(TokensService.generateToken(client_id, credential_id, access_expires_at, refresh_expires_at), {
        transaction,
      }),
      () => PizziError.internalError()
    )
  }

  static refreshToken(
    token: TokenModel,
    access_expires_at: Date = createAccessTokenLifetime(),
    refresh_expires_at: Date = createRefreshTokenLifetime(),
    transaction: Transaction | null = null
  ): PizziResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.update(
        {
          access_expires_at,
          refresh_expires_at,
        },
        { where: { id: token.id }, transaction, returning: true }
      ),
      () => PizziError.internalError()
    ).map((refreshed_tokens) => refreshed_tokens[1][0])
  }

  static getTokenFromAccessValue(token: string, transaction: Transaction | null = null): PizziResult<TokenModel> {
    return ResultAsync.fromPromise(Token.findOne({ where: { access_token: token }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.TokenNotFound, `invalid token value ${token}`)))
  }

  static getTokenFromRefreshValue(token: string, transaction: Transaction | null = null): PizziResult<TokenModel> {
    return ResultAsync.fromPromise(Token.findOne({ where: { refresh_token: token }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.TokenNotFound, `invalid refresh token value ${token}`)))
  }

  static getTokenFromId(token_id: number, transaction: Transaction | null = null): PizziResult<TokenModel> {
    return ResultAsync.fromPromise(Token.findOne({ where: { id: token_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.TokenNotFound, `invalid token_id ${token_id}`)))
  }

  static deleteToken(token: TokenModel, transaction: Transaction | null = null): PizziResult<null> {
    return ResultAsync.fromPromise(Token.destroy({ where: { id: token.id }, transaction }), () =>
      PizziError.internalError()
    ).map(() => null)
  }

  static deleteTokensFromCredentialId(
    credential_id: number,
    transaction: Transaction | null = null
  ): PizziResult<null> {
    return ResultAsync.fromPromise(Token.destroy({ where: { credential_id: credential_id }, transaction }), () =>
      PizziError.internalError()
    ).map(() => null)
  }

  private static generateToken(
    client_id: number,
    credential_id: number,
    access_expires_at: Date,
    refresh_expires_at: Date
  ): TokenCreation {
    return {
      access_token: randomBytes(20).toString('hex'),
      access_expires_at,
      refresh_token: randomBytes(20).toString('hex'),
      refresh_expires_at,
      client_id,
      credential_id,
    }
  }
}
