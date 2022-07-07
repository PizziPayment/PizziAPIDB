import { ResultAsync } from 'neverthrow'
import { ShopModel, ShopUpdateModel } from './models/shop.model'
import Shop from '../commons/services/orm/models/shops.database.model'
import { okIfNotNullElse, okIfOneElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { assignNonNullValues } from '../commons/services/util.service'
import { ErrorCause, IPizziError, PizziError } from '../commons/models/service.error.model'

export type ShopsServiceResult<T> = ResultAsync<T, IPizziError>

export class ShopsServices {
  static deleteShopById(id: number, transaction: Transaction | null = null): ShopsServiceResult<null> {
    return ResultAsync.fromPromise(Shop.destroy({ where: { id }, transaction }), () => PizziError.internalError())
      .andThen(okIfNotNullElse(new PizziError(`invalid id: ${id}`, ErrorCause.ShopNotFound)))
      .map(() => null)
  }

  static getShopFromId(id: number, transaction: Transaction | null = null): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(Shop.findOne({ where: { id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(`invalid id: ${id}`, ErrorCause.ShopNotFound)))
  }

  static createShop(
    name: string,
    phone: string,
    siret: number,
    address: string,
    city: string,
    zipcode: number,
    transaction: Transaction | null = null
  ): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.create(
        {
          siret: siret,
          address: address,
          city: city,
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
      () => PizziError.internalError()
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
      () => PizziError.internalError()
    ).andThen(okIfOneElse(new PizziError(`invalid id: ${id}`, ErrorCause.ShopNotFound)))
  }
}
