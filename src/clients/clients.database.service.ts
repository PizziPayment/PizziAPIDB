import { ResultAsync } from 'neverthrow'
import Client from '../commons/services/orm/models/clients.database.model'
import { ClientModel } from './models/client.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'

export class ClientsService {
  static createClientFromIdAndSecret(client_id: string, client_secret: string, transaction: Transaction | null = null) {
    return ResultAsync.fromPromise(Client.create({ client_id, client_secret }, { transaction }), () =>
      PizziError.internalError()
    )
  }

  static getClientFromIdAndSecret(
    client_id: string,
    client_secret: string,
    transaction: Transaction | null = null
  ): PizziResult<ClientModel> {
    return ResultAsync.fromPromise(
      Client.findOne({ where: { client_id: client_id, client_secret: client_secret }, transaction }),
      () => PizziError.internalError()
    ).andThen(
      okIfNotNullElse(
        new PizziError(ErrorCause.ClientNotFound, `invalid client_id: ${client_id} or client_secret: ${client_secret}`)
      )
    )
  }
}
