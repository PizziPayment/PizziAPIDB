import { errAsync, okAsync, ResultAsync } from 'neverthrow'
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

  static getClientsPage(page: number, nb_items: number, transaction?: Transaction): PizziResult<ClientModel[]> {
    return ResultAsync.fromPromise(
      Client.findAll({
        limit: nb_items,
        offset: (page - 1) * nb_items,
        transaction,
      }),
      () => PizziError.internalError()
    )
  }

  static deleteClientById(id: number, transaction: Transaction | null = null): PizziResult<void> {
    return ResultAsync.fromPromise(Client.destroy({ where: { id }, transaction }), () =>
      PizziError.internalError()
    ).andThen((n) => {
      if (n > 0) {
        return okAsync(undefined)
      } else {
        return errAsync(new PizziError(ErrorCause.ClientNotFound, `invalid id: ${id}`))
      }
    })
  }

  static isClientIdUsed(client_id: string, transaction?: Transaction): PizziResult<boolean> {
    return ResultAsync.fromPromise(Client.count({ where: { client_id }, transaction }), () =>
      PizziError.internalError()
    ).map((n) => n > 0)
  }
}
