import { Transaction } from 'sequelize'
import { ResultAsync } from 'neverthrow'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'
import ShopItemModel from './models/shop_items.model'

export enum ShopItemsServiceError {
  DatabaseError,
}

export type ShopItemsServiceResult<T> = ResultAsync<T, ShopItemsServiceError>

export class ShopItemsService {
  static createShopItem(
    shop_id: number,
    name: string,
    price: number,
    transaction: Transaction | null = null
  ): ShopItemsServiceResult<ShopItemModel> {
    return ResultAsync.fromPromise(
      ShopItem.create(
        {
          shop_id: shop_id,
          name: name,
          price: price,
        },
        { transaction }
      ),
      () => ShopItemsServiceError.DatabaseError
    )
  }
}
