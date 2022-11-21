import SharedReceipt from '../commons/services/orm/models/shared_receipts.model'
import { ResultAsync } from 'neverthrow'
import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'
import { DetailedSharedReceiptModel, SharedReceiptModel } from './models/shared_receipts.model'
import { Transaction } from 'sequelize'
import PizziTransaction from '../commons/services/orm/models/transactions.database.model'
import Credential from '../commons/services/orm/models/credentials.database.model'
import User from '../commons/services/orm/models/users.database.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import Receipt from '../commons/services/orm/models/receipts.database.model'
import ReceiptItem from '../commons/services/orm/models/receipt_items.database.model'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'

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
        },
        { transaction }
      ),
      () => PizziError.internalError()
    )
  }

  static validateSharing(
    shared_receipt_id: number,
    recipient_id: number,
    transaction: Transaction | null = null
  ): PizziResult<null> {
    return ResultAsync.fromPromise(
      SharedReceipt.update({ recipient_id }, { where: { id: shared_receipt_id }, transaction }),
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

  static getDetailedSharedReceiptsByUserId(
    user_id: number,
    transaction: Transaction | null = null
  ): PizziResult<Array<DetailedSharedReceiptModel>> {
    return ResultAsync.fromPromise(
      SharedReceipt.findAll({
        where: {
          recipient_id: user_id,
        },
        include: [
          {
            model: Receipt,
            include: [
              {
                model: PizziTransaction,
                include: [{ model: User }],
              },
              {
                model: ReceiptItem,
                include: [{ model: ShopItem }],
              },
            ],
          },
        ],
        transaction,
      }),
      () => PizziError.internalError()
    ).map((shared_receipts) =>
      shared_receipts.map((shared_receipt) => {
        return {
          id: shared_receipt.id,
          shared_at: shared_receipt.shared_at,
          user: {
            firstname: shared_receipt.receipt.transaction.user.firstname,
            surname: shared_receipt.receipt.transaction.user.surname,
            avatar_id: shared_receipt.receipt.transaction.user.avatar_id,
          },
          receipt: {
            id: shared_receipt.receipt.id,
            total_price: shared_receipt.receipt.total_price,
            items: shared_receipt.receipt.items.map((receipt_item) => {
              return {
                id: receipt_item.id,
                name: receipt_item.shop_item.name,
                price: receipt_item.shop_item.price,
                tva_percentage: receipt_item.tva_percentage,
                quantity: receipt_item.quantity,
                warranty: receipt_item.warranty,
                eco_tax: receipt_item.eco_tax,
                discount: receipt_item.discount,
              }
            }),
          },
        }
      })
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
          },
          { transaction }
        )
      )
  }
}
