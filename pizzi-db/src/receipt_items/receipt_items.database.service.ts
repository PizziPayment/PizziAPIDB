import { Transaction } from 'sequelize'
import { ResultAsync } from 'neverthrow'
import ReceiptItem from '../commons/services/orm/models/receipt_items.database.model'
import ReceiptItemModel from './models/receipt_items.model'

export enum ReceiptItemsServiceError {
  DatabaseError,
}

export type ReceiptItemsServiceResult<T> = ResultAsync<T, ReceiptItemsServiceError>

export class ReceiptItemsService {
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
