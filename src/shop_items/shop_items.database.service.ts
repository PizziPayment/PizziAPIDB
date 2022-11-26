import { ResultAsync } from 'neverthrow'
import { Op, Transaction } from 'sequelize'
import { okIfNotNullElse } from '../commons/extensions/neverthrow.extension'
import { Order } from '../commons/services/sequelize/model'
import ShopItem from '../commons/services/orm/models/shop_items.database.model'
import { intoShopItemModel, ShopItemCreationModel, ShopItemModel, ShopItemSortBy } from './models/shop_items.model'
import { assignNonNullValues } from '../commons/services/util.service'
import { ErrorCause, PizziError, PizziResult } from '../commons/models/service.error.model'

export class ShopItemsService {
  static createShopItem(
    shop_id: number,
    name: string,
    price: number,
    category?: string,
    color?: string,
    transaction: Transaction | null = null
  ): PizziResult<ShopItemModel> {
    return ResultAsync.fromPromise(
      ShopItem.create(
        {
          name: name,
          price: price,
          shop_id: shop_id,
          created_at: new Date(),
          enabled: true,
          category: category,
          color: color,
        },
        { transaction }
      ),
      () => PizziError.internalError()
    ).map(intoShopItemModel)
  }

  static createShopItems(
    shop_id: number,
    items: Array<ShopItemCreationModel>,
    transaction: Transaction | null = null
  ): PizziResult<Array<ShopItemModel>> {
    return ResultAsync.fromPromise(
      ShopItem.bulkCreate(
        items.map(({ name, price, category, color }) => {
          return {
            shop_id: shop_id,
            name,
            price,
            created_at: new Date(),
            enabled: true,
            category: category,
            color: color,
          }
        }),
        { validate: true, transaction }
      ),
      () => PizziError.internalError()
    ).map((items) => items.map(intoShopItemModel))
  }

  static retrieveShopItemFromId(id: number, transaction: Transaction | null = null): PizziResult<ShopItemModel> {
    return ResultAsync.fromPromise(ShopItem.findOne({ where: { id }, transaction }), () => PizziError.internalError())
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.ShopItemNotFound, `invalid id: ${id}`)))
      .map(intoShopItemModel)
  }

  static retrieveShopItemFromIdAndEnable(
    id: number,
    enabled: boolean,
    transaction: Transaction | null = null
  ): PizziResult<ShopItemModel> {
    return ResultAsync.fromPromise(ShopItem.findOne({ where: { id, enabled }, transaction }), () =>
      PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.ShopItemNotFound, `invalid id: ${id}`)))
      .map(intoShopItemModel)
  }

  static retrieveShopItemPage(
    shop_id: number,
    page: number,
    nb_items: number,
    sort_by: ShopItemSortBy,
    order: Order,
    query: string = '',
    enabled: boolean = true,
    transaction: Transaction | null = null
  ): PizziResult<Array<ShopItemModel>> {
    return ResultAsync.fromPromise(
      ShopItem.findAndCountAll({
        where: { name: { [Op.like]: `%${query}%` }, shop_id, enabled },
        order: [[sort_by, order]],
        limit: nb_items,
        offset: (page - 1) * nb_items,
        raw: true,
        transaction,
      }),
      () => PizziError.internalError()
    ).map((result) => result.rows.map(intoShopItemModel))
  }

  static updateShopItemFromId(
    id: number,
    name?: string | null,
    price?: number | null,
    category?: string,
    transaction: Transaction | null = null
  ): PizziResult<ShopItemModel> {
    return ShopItemsService.deleteShopItemById(id, transaction).andThen((shop_item) => {
      const new_shop_item = Object.assign(shop_item, assignNonNullValues({ name, price, category }))
      if (category !== undefined) {
        new_shop_item.category = category
      }

      return ShopItemsService.createShopItem(
        new_shop_item.shop_id,
        new_shop_item.name,
        new_shop_item.price,
        new_shop_item.category,
        new_shop_item.color,
        transaction
      )
    })
  }

  static deleteShopItemById(id: number, transaction: Transaction | null = null): PizziResult<ShopItemModel> {
    return ResultAsync.fromPromise(
      ShopItem.update({ enabled: false }, { where: { id, enabled: true }, transaction, returning: true }),
      () => PizziError.internalError()
    )
      .andThen(okIfNotNullElse(new PizziError(ErrorCause.ShopItemNotFound, `invalid id: ${id}`)))
      .map((updated_shop_items) => intoShopItemModel(updated_shop_items[1][0]))
  }
}
