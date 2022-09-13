import SharedReceipt from '../commons/services/orm/models/shared_receipts.model'
import { ResultAsync } from 'neverthrow'
import { IPizziError, PizziError } from '../commons/models/service.error.model'
import { SharedReceiptModel } from './models/shared_receipts.model'
import { Transaction } from 'sequelize'

export type SharedReceiptsServiceResult<T> = ResultAsync<T, IPizziError>

export class SharedReceiptsService {
  static initiateSharing(
    receipt_id: number,
    recipient_id: number,
    transaction: Transaction | null = null
  ): SharedReceiptsServiceResult<SharedReceiptModel> {
    return ResultAsync.fromPromise(
      SharedReceipt.create(
        {
          receipt_id: receipt_id,
          recipient_id: recipient_id,
          shared_at: new Date(),
          completed: false,
        },
        { transaction }
      ),
      () => PizziError.internalError()
    )
  }

  static validateSharing(
    shared_receipt_id: number,
    transaction: Transaction | null = null
  ): SharedReceiptsServiceResult<null> {
    return ResultAsync.fromPromise(
      SharedReceipt.update({ completed: true }, { where: { id: shared_receipt_id } }),
      () => PizziError.internalError()
    ).map(() => null)
  }
}
