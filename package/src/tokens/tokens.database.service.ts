import { err, ok } from 'neverthrow'
import { DatabaseServiceError, DatabaseServiceResult } from '../commons/models/response.model'
import Token from '../commons/services/orm/models/tokens.database.model'
import TokenModel from './models/token.model'

export default class TokensService {
  async getTokenFromValue(token: string): Promise<DatabaseServiceResult<TokenModel>> {
    try {
      const maybe_token = await Token.findOne({ where: { access_token: token } })

      if (!maybe_token) {
        return err(DatabaseServiceError.TokenNotFound)
      }
      return ok(maybe_token)
    } catch {
      return err(DatabaseServiceError.DatabaseError)
    }
  }
}
