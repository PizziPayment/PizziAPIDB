import { ResultAsync } from 'neverthrow'
import { ShopModel } from './models/shop.model'
import Shop from '../commons/services/orm/models/shop.database.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { onTransaction } from '../commons/extensions/generators.extension'

export type ShopsServiceResult<T> = ResultAsync<T, ShopsServiceError>

export enum ShopsServiceError {
  DatabaseError,
  ShopNotFound,
}

export class ShopsServices {
  static deleteShopById(shop_id: number, transaction: Transaction | null = null): ShopsServiceResult<null> {
    return this.getShopFromId(shop_id, transaction)
      .andThen(onTransaction(transaction, destroyShop))
      .map(() => null)
  }

  static getShopFromId(shop_id: number, transaction: Transaction | null = null): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.findOne({ where: { id: shop_id }, transaction }),
      () => ShopsServiceError.DatabaseError
    ).andThen(okIfNotNullElse(ShopsServiceError.ShopNotFound))
  }

  static createShop(
    name: string,
    phone: string,
    address: string,
    zipcode: number,
    transaction: Transaction | null = null
  ): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.create(
        {
          address: address,
          name: name,
          phone: phone,
          description: undefined,
          zipcode: zipcode,
          logo: undefined,
          facebook: undefined,
          instagram: undefined,
          twitter: undefined,
          website: undefined,
        },
        { transaction }
      ),
      () => ShopsServiceError.DatabaseError
    )
  }
}

// Pipeline
function destroyShop(shop: ShopModel, transaction: Transaction | null): ShopsServiceResult<ShopModel> {
  return ResultAsync.fromPromise(
    Shop.destroy({ where: { id: shop.id }, transaction }),
    () => ShopsServiceError.DatabaseError
  ).map(() => shop)
}
