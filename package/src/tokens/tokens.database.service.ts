import { err, ok, Result } from 'neverthrow'
import Token from '../commons/services/orm/models/tokens.database.model'
import TokenModel from './models/token.model'

export type TokensServiceResult<T> = Result<T, TokensServiceError>

export enum TokensServiceError {
  TokenNotFound,
  DatabaseError,
}

export default class TokensService {
  async getTokenFromValue(token: string): Promise<TokensServiceResult<TokenModel>> {
    try {
      const maybe_token = await Token.findOne({ where: { access_token: token } })

      if (!maybe_token) {
        return err(TokensServiceError.TokenNotFound)
      }
      return ok(maybe_token)
    } catch {
      return err(TokensServiceError.DatabaseError)
    }
  }
}
