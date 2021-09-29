import { ResultAsync } from 'neverthrow'
import Client from '../commons/services/orm/models/clients.database.model'
import { ClientModel } from './models/client.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'

export type ClientsServiceResult<T> = ResultAsync<T, ClientsServiceError>

export enum ClientsServiceError {
  ClientNotFound,
  DatabaseError,
}

export class ClientsService {
  static getClientFromIdAndSecret(
    client_id: string,
    client_secret: string,
    transaction: Transaction | null = null
  ): ClientsServiceResult<ClientModel> {
    return ResultAsync.fromPromise(
      Client.findOne({ where: { client_id: client_id, client_secret: client_secret }, transaction }),
      () => ClientsServiceError.DatabaseError
    ).andThen(okIfNotNullElse(ClientsServiceError.ClientNotFound))
  }
}
