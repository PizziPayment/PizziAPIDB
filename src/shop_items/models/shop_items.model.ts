import { ShopItemsAttributes } from '../../commons/services/orm/models/shop_items.database.model'

export enum SortBy {
  DATE = 'created_at',
  NAME = 'name',
  PRICE = 'price',
}

export interface ShopItemCreationModel {
  name: string
  price: string
}

export interface ShopItemModel {
  id: number
  shop_id: number
  name: string
  price: string
  created_at: Date
  enabled: boolean
}

export function intoShopItemModel(model: ShopItemsAttributes): ShopItemModel {
  return {
    id: model.id,
    shop_id: model.shop_id,
    name: model.name,
    price: model.price,
    created_at: model.created_at,
    enabled: model.enabled,
  }
}
