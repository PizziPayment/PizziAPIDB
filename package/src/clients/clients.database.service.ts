import { err, ok, Result } from 'neverthrow'
import Client from '../commons/services/orm/models/clients.database.model'
import ClientModel from './models/client.model'

export type ClientsServiceResult<T> = Result<T, ClientsServiceError>

export enum ClientsServiceError {
  ClientNotFound,
  DatabaseError,
}

export class ClientsService {
  static async getClientFromIdAndSecret(
    client_id: string,
    client_secret: string
  ): Promise<ClientsServiceResult<ClientModel>> {
    try {
      const client = await Client.findOne({ where: { client_id: client_id, client_secret: client_secret } })

      if (!client) {
        return err(ClientsServiceError.ClientNotFound)
      }
      return ok(client)
    } catch {
      return err(ClientsServiceError.DatabaseError)
    }
  }
}
