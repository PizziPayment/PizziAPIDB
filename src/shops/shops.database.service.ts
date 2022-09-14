import { ResultAsync } from 'neverthrow'
import { ShopModel, ShopUpdateModel } from './models/shop.model'
import Shop from '../commons/services/orm/models/shops.database.model'
import { okIfNotNullElse, okIfOneElse } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { assignNonNullValues } from '../commons/services/util.service'
import { ErrorCause, fieldNotFoundErrorFilter, PizziError, PizziResult } from '../commons/models/service.error.model'
import Image from '../commons/services/orm/models/images.database.model'
import { ImagesService } from '../images/images.database.service'

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

  static updateAvatarFromImageId(
    shop_id: number,
    image: Buffer,
    transaction: Transaction | null = null
  ): PizziResult<void> {
    return ResultAsync.fromPromise(Shop.findOne({ where: { id: shop_id }, transaction }), () =>
      PizziError.internalError()
    )
      .andThen(shopNotFoundErrorFilter(shop_id))
      .andThen((shop) => {
        if (shop.avatar_id) {
          return ResultAsync.fromPromise(
            Image.update({ buffer: image }, { where: { id: shop.avatar_id }, transaction }),
            () => PizziError.internalError()
          ).map(() => undefined)
        } else {
          return ImagesService.createImage(image, transaction)
            .andThen((image_id) =>
              ResultAsync.fromPromise(shop.update({ avatar_id: image_id }, { transaction }), () =>
                PizziError.internalError()
              )
            )
            .map(() => undefined)
        }
      })
  }
}
