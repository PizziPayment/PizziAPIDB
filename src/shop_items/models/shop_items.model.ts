import { ShopItemsAttributes } from '../../commons/services/orm/models/shop_items.database.model'

export enum ShopItemSortBy {
  DATE = 'created_at',
  NAME = 'name',
  PRICE = 'price',
}

export interface ShopItemCreationModel {
  name: string
  price: number
  category?: string
}

export interface ShopItemModel {
  id: number
  shop_id: number
  name: string
  price: number
  created_at: Date
  enabled: boolean
  category?: string
}

export function intoShopItemModel(model: ShopItemsAttributes): ShopItemModel {
  return {
    id: model.id,
    shop_id: model.shop_id,
    name: model.name,
    price: model.price,
    created_at: model.created_at,
    enabled: model.enabled,
    category: model.category,
  }
}
