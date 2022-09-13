import { ResultAsync } from 'neverthrow'
import { ShopModel, ShopUpdateModel } from './models/shop.model'
import Shop from '../commons/services/orm/models/shops.database.model'
import { okIfNotNullElse, okIfOneElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { assignNonNullValues } from '../commons/services/util.service'
import { ErrorCause, fieldNotFoundErrorFilter, PizziError, PizziResult } from '../commons/models/service.error.model'

const shopNotFoundErrorFilter = fieldNotFoundErrorFilter<Shop>('shop', ErrorCause.ShopNotFound)

export class ShopsServices {
  static deleteShopById(id: number, transaction: Transaction | null = null): PizziResult<null> {
    return ResultAsync.fromPromise(Shop.destroy({ where: { id }, transaction }), () => PizziError.internalError())
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.ShopNotFound, `invalid id: ${id}`)))
      .map(() => null)
  }

  static getShopFromId(id: number, transaction: Transaction | null = null): PizziResult<ShopModel> {
    return ResultAsync.fromPromise(Shop.findOne({ where: { id }, transaction }), () =>
      PizziError.internalError()
    ).andThen(okIfNotNullElse(new PizziError(ErrorCause.ShopNotFound, `invalid id: ${id}`)))
  }

  static createShop(
    name: string,
    phone: string,
    siret: number,
    address: string,
    city: string,
    zipcode: number,
    transaction: Transaction | null = null
  ): PizziResult<ShopModel> {
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
  ): PizziResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.update(assignNonNullValues(model), {
        where: { id },
        returning: true,
        transaction,
      }),
      () => PizziError.internalError()
    ).andThen(okIfOneElse(new PizziError(ErrorCause.ShopNotFound, `invalid id: ${id}`)))
  }

  // Returns the id of the previous avatar, if there was one
  static updateAvatarFromImageId(
    shop_id: number,
    image_id: number,
    transaction: Transaction | null = null
  ): PizziResult<number | undefined> {
    return ResultAsync.fromPromise(Shop.findOne({ where: { id: shop_id } }), () => PizziError.internalError())
      .andThen(shopNotFoundErrorFilter(shop_id))
      .andThen((shop) => {
        let old_image: number | undefined = undefined

        if (shop.avatar_id != null) {
          old_image = shop.avatar_id
        }

        return ResultAsync.fromPromise(
          Object.assign(shop, assignNonNullValues({ image: image_id })).save({ transaction }),
          () => PizziError.internalError()
        ).map(() => old_image)
      })
  }
}
