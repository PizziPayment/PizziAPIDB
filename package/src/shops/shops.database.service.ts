import { errAsync, okAsync, ResultAsync } from 'neverthrow'
import { ShopModel } from './models/shop.model'
import Shop from '../commons/services/orm/models/shop.database.model'

export type ShopsServiceResult<T> = ResultAsync<T, ShopsServiceError>

export enum ShopsServiceError {
  DatabaseError,
  ShopNotFound,
}

export class ShopsServices {
  static deleteShopById(shop_id: number): ShopsServiceResult<null> {
    return this.getShopFromId(shop_id)
      .andThen(destroyShop)
      .map(() => null)
  }

  static getShopFromId(shop_id: number): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.findOne({ where: { id: shop_id } }),
      () => ShopsServiceError.DatabaseError
    ).andThen((maybe_shop) => (maybe_shop ? okAsync(maybe_shop) : errAsync(ShopsServiceError.ShopNotFound)))
  }

  static createShop(name: string, phone: string, address: string, zipcode: number): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.create({
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
      }),
      () => ShopsServiceError.DatabaseError
    )
  }
}

// Pipeline

function destroyShop(shop: ShopModel): ShopsServiceResult<ShopModel> {
  return ResultAsync.fromPromise(Shop.destroy({ where: { id: shop.id } }), () => ShopsServiceError.DatabaseError).map(
    () => shop
  )
}
