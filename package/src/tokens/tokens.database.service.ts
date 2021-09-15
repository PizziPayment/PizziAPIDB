import { err, errAsync, ok, okAsync, Result, ResultAsync } from 'neverthrow'
import Token from '../commons/services/orm/models/tokens.database.model'
import { TokenModel } from './models/token.model'

export type TokensServiceResult<T> = ResultAsync<T, TokensServiceError>

export enum TokensServiceError {
  TokenNotFound,
  DatabaseError,
}

export class TokensService {
  static getTokenFromValue(token: string): TokensServiceResult<TokenModel> {
    return ResultAsync.fromPromise(
      Token.findOne({ where: { access_token: token } }),
      () => TokensServiceError.DatabaseError
    ).andThen((maybe_token) => (maybe_token ? okAsync(maybe_token) : errAsync(TokensServiceError.TokenNotFound)))
  }
}
