import { ResultAsync } from 'neverthrow'
import { Op, Transaction } from 'sequelize'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Order } from '../commons/models/sequelize.model'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'
import { intoShopItemModel, ShopItemCreationModel, ShopItemModel, SortBy } from './models/shop_items.model'

export enum ShopItemsServiceError {
  NotFound,
  DatabaseError,
}

export type ShopItemsServiceResult<T> = ResultAsync<T, ShopItemsServiceError>

export class ShopItemsService {
  static createShopItem(
    shop_id: number,
    name: string,
    price: string,
    transaction: Transaction | null = null
  ): ShopItemsServiceResult<ShopItemModel> {
    return ResultAsync.fromPromise(
      ShopItem.create(
        {
          name: name,
          price: price,
          shop_id: shop_id,
          created_at: new Date(),
          enable: true,
        },
        { transaction }
      ),
      () => ShopItemsServiceError.DatabaseError
    )
  }

  static createShopItems(
    shop_id: number,
    items: Array<ShopItemCreationModel>,
    transaction: Transaction | null = null
  ): ShopItemsServiceResult<Array<ShopItemModel>> {
    return ResultAsync.fromPromise(
      ShopItem.bulkCreate(
        items.map(({ name, price }) => {
          return {
            shop_id: shop_id,
            name,
            price,
            created_at: new Date(),
            enable: true,
          }
        }),
        { validate: true, transaction }
      ),
      () => ShopItemsServiceError.DatabaseError
    )
  }

  static retrieveShopItemFromId(
    id: number,
    transaction: Transaction | null = null
  ): ShopItemsServiceResult<ShopItemModel> {
    return ResultAsync.fromPromise(
      ShopItem.findOne({ where: { id }, transaction }),
      () => ShopItemsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(ShopItemsServiceError.NotFound))
      .map(intoShopItemModel)
  }

  static retrieveShopItemFromIdAndEnable(
    id: number,
    enable: boolean,
    transaction: Transaction | null = null
  ): ShopItemsServiceResult<ShopItemModel> {
    return ResultAsync.fromPromise(
      ShopItem.findOne({ where: { id, enable }, transaction }),
      () => ShopItemsServiceError.DatabaseError
    ).andThen(okIfNotNullElse(ShopItemsServiceError.NotFound))
  }

  static retrieveShopItemPage(
    shop_id: number,
    page: number,
    nb_items: number,
    sort_by: SortBy,
    order: Order,
    query: string = '',
    transaction: Transaction | null = null
  ): ShopItemsServiceResult<Array<ShopItemModel>> {
    return ResultAsync.fromPromise(
      ShopItem.findAndCountAll({
        where: { name: { [Op.like]: `%${query}%` }, shop_id: shop_id },
        order: [[sort_by, order]],
        limit: nb_items,
        offset: page - 1,
        raw: true,
        transaction,
      }),
      () => ShopItemsServiceError.DatabaseError
    ).map((result) => result.rows)
  }

  static updateShopItemFromId(
    id: number,
    name: string | null,
    price: string | null,
    transaction: Transaction | null = null
  ): ShopItemsServiceResult<ShopItemModel> {
    return ShopItemsService.deleteShopItemById(id, transaction).andThen((shop_item) => {
      const new_shop_item = Object.assign(shop_item, nonNullShopItemValues(name, price))

      return ShopItemsService.createShopItem(
        new_shop_item.shop_id,
        new_shop_item.name,
        new_shop_item.price,
        transaction
      )
    })
  }

  static deleteShopItemById(id: number, transaction: Transaction | null = null): ShopItemsServiceResult<ShopItemModel> {
    return ResultAsync.fromPromise(
      ShopItem.update({ enable: false }, { where: { id, enable: true }, transaction, returning: true }),
      () => ShopItemsServiceError.NotFound
    )
      .andThen(okIfNotNullElse(ShopItemsServiceError.NotFound))
      .map((updated_shop_items) => updated_shop_items[1][0])
  }
}

function nonNullShopItemValues(name: string | null, price: string | null): Record<string, string> {
  const record: Record<string, string> = {}
  const values = { name: name, price: price }

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) {
      record[key] = value
    }
  }
  return record
}
