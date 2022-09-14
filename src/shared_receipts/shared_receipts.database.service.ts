import SharedReceipt from '../commons/services/orm/models/shared_receipts.model'
import { ResultAsync } from 'neverthrow'
import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'
import { SharedReceiptModel } from './models/shared_receipts.model'
import { Transaction } from 'sequelize'
import Credential from '../commons/services/orm/models/credentials.database.model'
import User from '../commons/services/orm/models/users.database.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'

export class SharedReceiptsService {
  static initiateSharing(
    receipt_id: number,
    recipient_id: number,
    transaction: Transaction | null = null
  ): PizziResult<SharedReceiptModel> {
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

  static validateSharing(shared_receipt_id: number, transaction: Transaction | null = null): PizziResult<null> {
    return ResultAsync.fromPromise(
      SharedReceipt.update({ completed: true }, { where: { id: shared_receipt_id }, transaction }),
      () => PizziError.internalError()
    ).map(() => null)
  }

  static getSharedReceiptByUserId(
    user_id: number,
    transaction: Transaction | null = null
  ): PizziResult<Array<SharedReceiptModel>> {
    return ResultAsync.fromPromise(
      SharedReceipt.findAll({
        where: {
          recipient_id: user_id,
        },
        transaction,
      }),
      () => PizziError.internalError()
    )
  }

  static shareReceiptByEmail(
    receipt_id: number,
    user_email: string,
    transaction: Transaction | null = null
  ): PizziResult<SharedReceiptModel> {
    return ResultAsync.fromPromise(
      Credential.findOne({
        where: { email: user_email },
        include: [{ model: User }],
        transaction,
      }),
      () => PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.CredentialNotFound, `invalid email: ${user_email}`)))
      .map((credential) =>
        SharedReceipt.create(
          {
            receipt_id: receipt_id,
            recipient_id: credential.user.id,
            shared_at: new Date(),
            completed: true,
          },
          { transaction }
        )
      )
  }
}
