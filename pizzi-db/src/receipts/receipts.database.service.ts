import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize'
import Receipt from '../commons/services/orm/models/receipts.database.model'
import ReceiptModel from './models/receipts.model'

export enum ReceiptsServiceError {
  DatabaseError,
}

export type ReceiptsServiceResult<T> = ResultAsync<T, ReceiptsServiceError>

export default class ReceiptsService {
  static createReceipt(
    tva_percentage: number,
    transaction: Transaction | null = null
  ): ReceiptsServiceResult<ReceiptModel> {
    return ResultAsync.fromPromise(
      Receipt.create(
        {
          tva_percentage: tva_percentage,
        },
        { transaction }
      ),
      () => ReceiptsServiceError.DatabaseError
    )
  }
}
