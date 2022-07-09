import { Transaction } from 'sequelize'
import { ResultAsync } from 'neverthrow'
import ReceiptItem from '../commons/services/orm/models/receipt_items.database.model'
import ReceiptItemModel, { DetailedReceiptItemModel } from './models/receipt_items.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'
import { ErrorCause, IPizziError, PizziError } from '../commons/models/service.error.model'

export type ReceiptItemsServiceResult<T> = ResultAsync<T, IPizziError>

export class ReceiptItemsService {
  static getReceiptItems(
    receipt_id: number,
    transaction: Transaction | null = null
  ): ReceiptItemsServiceResult<Array<ReceiptItemModel>> {
    return ResultAsync.fromPromise(ReceiptItem.findAll({ where: { receipt_id: receipt_id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.ReceiptItemNotFound, `invalid receipt_id: ${receipt_id}`)))
  }

  static getDetailedReceiptItems(
    receipt_id: number,
    transaction: Transaction | null = null
  ): ReceiptItemsServiceResult<Array<DetailedReceiptItemModel>> {
    return ResultAsync.fromPromise(
      ReceiptItem.findAll({ where: { receipt_id: receipt_id }, include: [{ model: ShopItem }], transaction }),
      () => PizziError.internalError()
    )
      .map((receipt_items) => {
        return receipt_items.map((receipt_item) => {
          return {
            id: receipt_item.id,
            receipt_id: receipt_item.receipt_id,
            shop_item_id: receipt_item.shop_item_id,
            discount: receipt_item.discount,
            eco_tax: receipt_item.eco_tax,
            quantity: receipt_item.quantity,
            warranty: receipt_item.warranty,
            name: receipt_item.shop_item.name,
            price: receipt_item.shop_item.price,
          }
        })
      })
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.ReceiptItemNotFound, `invalid receipt_id: ${receipt_id}`)))
  }

  static createReceiptItems(
    receipt_id: number,
    receipt_items: Array<{
      shop_item_id: number
      discount: number
      eco_tax: number
      quantity: number
      warranty: string
    }>,
    transaction: Transaction | null = null
  ): ReceiptItemsServiceResult<Array<ReceiptItemModel>> {
    return ResultAsync.fromPromise(
      ReceiptItem.bulkCreate(
        receipt_items.map((item) => {
          return { ...item, receipt_id }
        }),
        { validate: true, transaction }
      ),
      () => PizziError.internalError()
    )
  }

  static createReceiptItem(
    receipt_id: number,
    shop_item_id: number,
    discount: number,
    eco_tax: number,
    quantity: number,
    warranty: string,
    transaction: Transaction | null = null
  ): ReceiptItemsServiceResult<ReceiptItemModel> {
    return ResultAsync.fromPromise(
      ReceiptItem.create(
        {
          receipt_id: receipt_id,
          shop_item_id: shop_item_id,
          discount: discount,
          eco_tax: eco_tax,
          quantity: quantity,
          warranty: warranty,
        },
        { transaction }
      ),
      () => PizziError.internalError()
    )
  }
}
