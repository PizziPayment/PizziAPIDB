import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize/types'
import { PizziError, PizziResult } from '../commons/models/service.error.model'
import Admin from '../commons/services/orm/models/admins.database.model'

export class AdminsService {
  static createAdmin(transaction?: Transaction): PizziResult<Admin> {
    return ResultAsync.fromPromise(Admin.create(undefined, { transaction }), () => PizziError.internalError())
  }

  static deleteAdminById(id: number, transaction: Transaction): PizziResult<void> {
    return ResultAsync.fromPromise(Admin.destroy({ where: { id }, transaction }), () => PizziError.internalError()).map(
      () => { }
    )
  }
}