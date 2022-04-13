import { ResultAsync } from 'neverthrow'
import { Transaction } from 'sequelize'
import Receipt from '../commons/services/orm/models/receipts.database.model'
import { DetailedReceiptModel, ReceiptModel } from './models/receipts.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import ReceiptItem from '../commons/services/orm/models/receipt_items.database.model'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'
import PizziTransaction from '../commons/services/orm/models/transactions.database.model'
import Shop from '../commons/services/orm/models/shops.database.model'
import User from '../commons/services/orm/models/users.database.model'

export enum ReceiptsServiceError {
  ReceiptNotFound,
  DatabaseError,
}

export type ReceiptsServiceResult<T> = ResultAsync<T, ReceiptsServiceError>

export default class ReceiptsService {
  static getDetailedReceiptById(
    receipt_id: number,
    transaction: Transaction | null = null
  ): ReceiptsServiceResult<DetailedReceiptModel> {
    return ResultAsync.fromPromise(
      Receipt.findOne({
        where: { id: receipt_id },
        include: [
          {
            model: ReceiptItem,
            include: [{ model: ShopItem }, { model: PizziTransaction, include: [{ model: Shop }, { model: User }] }],
          },
        ],
        transaction,
      }),
      () => ReceiptsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(ReceiptsServiceError.ReceiptNotFound))
      .map((receipt) => {
        return {
          id: receipt.id,
          tva_percentage: receipt.tva_percentage,
          total_price: receipt.total_price,
          created_at: receipt.transaction.created_at,
          shop: {
            name: receipt.transaction.shop.name,
            logo: receipt.transaction.shop.logo,
          },
          user: {
            firstname: receipt.transaction.user.firstname,
            surname: receipt.transaction.user.surname,
          },
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
    return ResultAsync.fromPromise(
      Receipt.findAll({
        where: { id: receipt_ids },
        include: [{ model: PizziTransaction, include: [{ model: Shop }, { model: User }] }],
        transaction,
      }),
      () => ReceiptsServiceError.DatabaseError
    ).map((receipts) =>
      receipts.map((receipt) => {
        return {
          id: receipt.id,
          tva_percentage: receipt.tva_percentage,
          total_price: receipt.total_price,
          created_at: receipt.transaction.created_at,
          shop: {
            name: receipt.transaction.shop.name,
            logo: receipt.transaction.shop.logo,
          },
          user: {
            firstname: receipt.transaction.user.firstname,
            surname: receipt.transaction.user.surname,
          },
        }
      })
    )
  }

  static createReceipt(
    tva_percentage: number,
    total_price: string,
    transaction: Transaction | null = null
  ): ReceiptsServiceResult<Omit<ReceiptModel, 'created_at' | 'shop' | 'user'>> {
    return ResultAsync.fromPromise(
      Receipt.create({ tva_percentage: tva_percentage, total_price: total_price }, { transaction }),
      () => ReceiptsServiceError.DatabaseError
    )
  }
}
