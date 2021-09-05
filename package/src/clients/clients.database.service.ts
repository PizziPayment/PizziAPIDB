import { err, ok } from 'neverthrow'
import { DatabaseServiceError, DatabaseServiceResult } from '../commons/models/response.model'
import Client from '../commons/services/orm/models/clients.database.model'
import ClientModel from './models/client.model'

export default class ClientsService {
  async getClientFromIdAndSecret(
    client_id: string,
    client_secret: string
  ): Promise<DatabaseServiceResult<ClientModel>> {
    try {
      const client = await Client.findOne({ where: { client_id: client_id, client_secret: client_secret } })

      if (!client) {
        return err(DatabaseServiceError.ClientNotFound)
      }
      return ok(client)
    } catch {
      return err(DatabaseServiceError.DatabaseError)
    }
  }
}
