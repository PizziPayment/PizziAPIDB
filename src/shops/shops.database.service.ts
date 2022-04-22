import { ResultAsync } from 'neverthrow'
import { ShopModel, ShopUpdateModel } from './models/shop.model'
import Shop from '../commons/services/orm/models/shops.database.model'
import { okIfNotNullElse, mapUpdatedRow } from '../commons/extensions/neverthrow.extension'
import { Transaction } from 'sequelize'
import { assignNonNullValues } from '../commons/services/util.service'
import Credential from '../commons/services/orm/models/credentials.database.model'
import { CredentialsService } from '../credentials/credentials.database.service'
import { onTransaction } from '../commons/extensions/generators.extension'

export type ShopsServiceResult<T> = ResultAsync<T, ShopsServiceError>

export enum ShopsServiceError {
  DatabaseError,
  ShopNotFound,
}

export class ShopsServices {
  static disableShopById(id: number, transaction: Transaction): ShopsServiceResult<null> {
    return ResultAsync.fromPromise(
      Shop.findOne({ where: { id, enabled: true }, include: [{ model: Credential }], transaction }),
      () => ShopsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(ShopsServiceError.ShopNotFound))
      .andThen(
        onTransaction(
          transaction,
          (shop: Shop, transaction: Transaction | null): ShopsServiceResult<Shop> =>
            ResultAsync.fromPromise(
              shop.set('enabled', false).save({ transaction }),
              () => ShopsServiceError.DatabaseError
            )
        )
      )
      .andThen(
        onTransaction(
          transaction,
          (shop: Shop, transaction: Transaction | null): ShopsServiceResult<null> =>
            CredentialsService.deleteCredentialFromId(shop.credential.id, transaction)
              .map(() => null)
              .mapErr(() => ShopsServiceError.DatabaseError)
        )
      )
  }

  static getShopFromId(
    id: number,
    enabled: boolean = true,
    transaction: Transaction | null = null
  ): ShopsServiceResult<ShopModel> {
    return ResultAsync.fromPromise(
      Shop.findOne({ where: { id, enabled }, transaction }),
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
          enabled: true,
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
