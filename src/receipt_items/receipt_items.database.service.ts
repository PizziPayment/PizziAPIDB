import { Transaction } from 'sequelize'
import { ResultAsync } from 'neverthrow'
import ReceiptItem from '../commons/services/orm/models/receipt_items.database.model'
import ReceiptItemModel from './models/receipt_items.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'

export enum ReceiptItemsServiceError {
  ReceiptNotFound,
  DatabaseError,
}

export type ReceiptItemsServiceResult<T> = ResultAsync<T, ReceiptItemsServiceError>

export class ReceiptItemsService {
  static getReceiptsItems(
    receipt_id: number,
    transaction: Transaction | null = null
  ): ReceiptItemsServiceResult<Array<ReceiptItemModel>> {
    return ResultAsync.fromPromise(
      ReceiptItem.findAll({ where: { receipt_id: receipt_id }, transaction }),
      () => ReceiptItemsServiceError.DatabaseError
    ).andThen(okIfNotNullElse(ReceiptItemsServiceError.ReceiptNotFound))
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
      () => ReceiptItemsServiceError.DatabaseError
    )
  }
}
