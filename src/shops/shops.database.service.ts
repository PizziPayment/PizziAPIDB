import { ResultAsync } from 'neverthrow'
import { ShopModel, ShopUpdateModel } from './models/shop.model'
import Shop from '../commons/services/orm/models/shops.database.model'
import { okIfNotNullElse, mapUpdatedRow } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { assignNonNullValues } from '../commons/services/util.service'

export type ShopsServiceResult<T> = ResultAsync<T, ShopsServiceError>

export enum ShopsServiceError {
  DatabaseError,
  ShopNotFound,
}

export class ShopsServices {
  static deleteShopById(id: number, transaction: Transaction | null = null): ShopsServiceResult<null> {
    return ResultAsync.fromPromise(Shop.destroy({ where: { id }, transaction }), () => ShopsServiceError.DatabaseError)
      .andThen(okIfNotNullElse(ShopsServiceError.ShopNotFound))
      .map(() => null)
  }

  static getShopFromId(id: number, transaction: Transaction | null = null): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.findOne({ where: { id }, transaction }),
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

  static updateShopFromId(
    id: number,
    model: ShopUpdateModel,
    transaction: Transaction | null = null
  ): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.update(assignNonNullValues(model), {
        where: { id },
        returning: true,
        transaction,
      }),
      () => ShopsServiceError.DatabaseError
    ).andThen(mapUpdatedRow(ShopsServiceError.ShopNotFound))
  }
}
