import { Transaction, Op } from 'sequelize'
import { ResultAsync } from 'neverthrow'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'
import { ShopItemModel, ShopItemCreationModel, SortBy, Order } from './models/shop_items.model'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'

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
      ShopItem.findOne({ where: { id: id }, transaction }),
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
    price: number | null,
    transaction: Transaction | null = null
  ): ShopItemsServiceResult<ShopItemModel> {
    return ResultAsync.fromPromise(
      ShopItem.findOne({
        where: {
          id: id,
        },
        transaction,
      }),
      () => ShopItemsServiceError.DatabaseError
    )
      .andThen(okIfNotNullElse(ShopItemsServiceError.NotFound))
      .andThen((shop_item) =>
        ResultAsync.fromPromise(
          ShopItem.create(Object.assign(shop_item, nonNullShopItemValues(name, price)), { transaction }),
          () => ShopItemsServiceError.DatabaseError
        )
      )
  }

  static deleteShopItemById(id: number, transaction: Transaction | null = null): ShopItemsServiceResult<null> {
    return ResultAsync.fromPromise(
      ShopItem.destroy({ where: { id: id }, transaction }),
      () => ShopItemsServiceError.DatabaseError
    ).map(() => null)
  }
}

function nonNullShopItemValues(name: string | null, price: number | null): Record<string, string | number> {
  const record: Record<string, string | number> = {}
  const values = { name: name, price: price }

  for (const [key, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) {
      record[key] = value
    }
  }
  return record
}
