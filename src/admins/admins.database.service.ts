import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize/types'
import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'
import Admin from '../commons/services/orm/models/admins.database.model'
import Credential from '../commons/services/orm/models/credentials.database.model'

export interface AdminModel {
  id: number
  credential_id: number
  email: string
}

export class AdminsService {
  static createAdmin(transaction?: Transaction): PizziResult<number> {
    return ResultAsync.fromPromise(Admin.create(undefined, { transaction }), () => PizziError.internalError()).map(
      (admin) => admin.id
    )
  }

  static deleteAdminById(id: number, transaction?: Transaction): PizziResult<void> {
    return ResultAsync.fromPromise(Admin.destroy({ where: { id }, transaction }), () =>
      PizziError.internalError()
    ).andThen((n) => {
      if (n > 0) {
        return okAsync(undefined)
      } else {
        return errAsync(new PizziError(ErrorCause.InvalidAdmin, `invalid id: ${id}`))
      }
    })
  }

  static getAdminsPage(page: number, nb_items: number, transaction?: Transaction): PizziResult<AdminModel[]> {
    return ResultAsync.fromPromise(
      Admin.findAll({ limit: nb_items, offset: (page - 1) * nb_items, include: [{ model: Credential }], transaction }),
      () => PizziError.internalError()
    ).map((arr) => arr.map(to_model))
  }
}

function to_model(admin: Admin): AdminModel {
  return { id: admin.id, credential_id: admin.credential.id, email: admin.credential.email }
}
