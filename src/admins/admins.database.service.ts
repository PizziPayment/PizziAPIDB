import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize/types'
import { PizziError, PizziResult } from '../commons/models/service.error.model'
import Admin from '../commons/services/orm/models/admins.database.model'

export interface AdminModel {
  id: number
}

export class AdminsService {
  static createAdmin(transaction?: Transaction): PizziResult<AdminModel> {
    return ResultAsync.fromPromise(Admin.create(undefined, { transaction }), () => PizziError.internalError()).map(
      to_model
    )
  }

  static deleteAdminById(id: number, transaction?: Transaction): PizziResult<void> {
    return ResultAsync.fromPromise(Admin.destroy({ where: { id }, transaction }), () => PizziError.internalError()).map(
      () => { }
    )
  }

  static getAdminsPage(page: number, nb_items: number, transaction?: Transaction): PizziResult<AdminModel[]> {
    return ResultAsync.fromPromise(Admin.findAll({ limit: nb_items, offset: (page - 1) * nb_items, transaction }), () =>
      PizziError.internalError()
    ).map((arr) => arr.map(to_model))
  }
}

function to_model(admin: Admin): AdminModel {
  return { id: admin.id }
}
