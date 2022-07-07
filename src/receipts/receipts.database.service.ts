import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize'
import Receipt from '../commons/services/orm/models/receipts.database.model'
import { DetailedReceiptModel, ReceiptModel } from './models/receipts.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import ReceiptItem from '../commons/services/orm/models/receipt_items.database.model'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'
import { ErrorCause, IPizziError, PizziError } from '../commons/models/service.error.model'

export type ReceiptsServiceResult<T> = ResultAsync<T, IPizziError>

export class ReceiptsService {
  static getDetailedReceiptById(
    receipt_id: number,
    transaction: Transaction | null = null
  ): ReceiptsServiceResult<DetailedReceiptModel> {
    return ResultAsync.fromPromise(
      Receipt.findOne({
        where: { id: receipt_id },
        include: [{ model: ReceiptItem, include: [{ model: ShopItem }] }],
        transaction,
      }),
      () => PizziError.internalError()
    )
      .andThen(
        okIfNotNullElse(
          new PizziError(`invalid receipt_id: ${receipt_id}`, ErrorCause.ReceiptNotFound)
        )
      )
      .map((receipt) => {
        return {
          id: receipt.id,
          tva_percentage: receipt.tva_percentage,
          total_price: receipt.total_price,
          items: (receipt.items || []).map((item) => {
            return {
              id: item.id,
              name: item.shop_item.name,
              price: item.shop_item.price,
              quantity: item.quantity,
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
  ): ReceiptsServiceResult<Array<ReceiptModel>> {
    return ResultAsync.fromPromise(Receipt.findAll({ where: { id: receipt_ids }, transaction }), () =>
      PizziError.internalError()
    )
  }

  static createReceipt(
    tva_percentage: number,
    total_price: string,
    transaction: Transaction | null = null
  ): ReceiptsServiceResult<ReceiptModel> {
    return ResultAsync.fromPromise(
      Receipt.create({ tva_percentage: tva_percentage, total_price: total_price }, { transaction }),
      () => PizziError.internalError()
    )
  }
}
