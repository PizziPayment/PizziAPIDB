import { randomBytes } from 'crypto'
import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { createDateWithOffset } from '../commons/services/date.service'
import Token, { TokenCreation } from '../commons/services/orm/models/tokens.database.model'
import { TokenModel } from './models/token.model'

export type TokensServiceResult<T> = ResultAsync<T, TokensServiceError>

export enum TokensServiceError {
  TokenNotFound,
  DatabaseError,
}

const createAccessTokenLifetime = () => {
  return createDateWithOffset('hour', 1)
}
const createRefreshTokenLifetime = () => {
  return createDateWithOffset('day', 30)
}

export class TokensService {
  static generateTokenBetweenClientAndCredential(
    client_id: number,
    credential_id: number,
    transaction: Transaction | null = null
  ): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.create(TokensService.generateToken(client_id, credential_id), { transaction }),
      () => TokensServiceError.DatabaseError
    )
  }

  static refreshToken(token: TokenModel, transaction: Transaction | null = null): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.update(
        {
          access_expires_at: createAccessTokenLifetime(),
          refresh_expires_at: createRefreshTokenLifetime(),
        },
        { where: { id: token.id }, transaction, returning: true }
      ),
      () => TokensServiceError.DatabaseError
    ).map((refreshed_tokens) => refreshed_tokens[1][0])
  }

  static getTokenFromAccessValue(
    token: string,
    transaction: Transaction | null = null
  ): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.findOne({ where: { access_token: token }, transaction }),
      () => TokensServiceError.DatabaseError
    ).andThen(okIfNotNullElse(TokensServiceError.TokenNotFound))
  }

  static getTokenFromRefreshValue(
    token: string,
    transaction: Transaction | null = null
  ): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.findOne({ where: { refresh_token: token }, transaction }),
      () => TokensServiceError.DatabaseError
    ).andThen(okIfNotNullElse(TokensServiceError.TokenNotFound))
  }

  static getTokenFromId(token_id: number, transaction: Transaction | null = null): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.findOne({ where: { id: token_id }, transaction }),
      () => TokensServiceError.DatabaseError
    ).andThen(okIfNotNullElse(TokensServiceError.TokenNotFound))
  }

  static deleteToken(token: TokenModel, transaction: Transaction | null = null): TokensServiceResult<null> {
    return ResultAsync.fromPromise(
      Token.destroy({ where: { id: token.id }, transaction }),
      () => TokensServiceError.DatabaseError
    ).map(() => null)
  }

  static deleteTokensFromCredentialId(
    credential_id: number,
    transaction: Transaction | null = null
  ): TokensServiceResult<null> {
    return ResultAsync.fromPromise(
      Token.destroy({ where: { credential_id: credential_id }, transaction }),
      () => TokensServiceError.DatabaseError
    ).map(() => null)
  }

  private static generateToken(client_id: number, credential_id: number): TokenCreation {
    const token = {
      access_token: randomBytes(20).toString('hex'),
      access_expires_at: createAccessTokenLifetime(),
      refresh_token: randomBytes(20).toString('hex'),
      refresh_expires_at: createRefreshTokenLifetime(),
      client_id,
      credential_id,
    }
    return token
  }
}
