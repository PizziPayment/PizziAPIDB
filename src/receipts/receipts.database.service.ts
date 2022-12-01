import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize'
import PizziTransaction from '../commons/services/orm/models/transactions.database.model'
import Receipt from '../commons/services/orm/models/receipts.database.model'
import { DetailedReceiptModel, ReceiptModel } from './models/receipts.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import ReceiptItem from '../commons/services/orm/models/receipt_items.database.model'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'
import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'

export class ReceiptsService {
  static getDetailedReceiptById(
    receipt_id: number,
    transaction: Transaction | null = null
  ): PizziResult<DetailedReceiptModel> {
    return ResultAsync.fromPromise(
      Receipt.findOne({
        where: { id: receipt_id },
        include: [{ model: ReceiptItem, include: [{ model: ShopItem }] }, { model: PizziTransaction }],
        transaction,
      }),
      () => PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.ReceiptNotFound, `invalid receipt_id: ${receipt_id}`)))
      .map((receipt) => {
        return {
          id: receipt.id,
          total_price: receipt.total_price,
          created_at: receipt.transaction.created_at,
          items: (receipt.items || []).map((item) => {
            return {
              id: item.id,
              name: item.shop_item.name,
              price: item.shop_item.price,
              quantity: item.quantity,
              tva_percentage: item.tva_percentage,
              warranty: item.warranty,
              eco_tax: item.eco_tax,
              discount: item.discount,
            }
          }),
        }
      })
  }

  static getShortenedReceipts(
    receipt_ids: Array<number>,
    transaction: Transaction | null = null
  ): PizziResult<Array<ReceiptModel>> {
    return ResultAsync.fromPromise(Receipt.findAll({ where: { id: receipt_ids }, transaction }), () =>
      PizziError.internalError()
    )
  }

  static createReceipt(total_price: number, transaction: Transaction | null = null): PizziResult<ReceiptModel> {
    return ResultAsync.fromPromise(Receipt.create({ total_price: total_price }, { transaction }), () =>
      PizziError.internalError()
    )
  }
}
