export enum SortBy {
  DATE = 'created_at',
  NAME = 'name',
  PRICE = 'price',
}

export enum Order {
  ASC = 'asc',
  DESC = 'desc',
}

export interface ShopItemCreationModel {
  name: string
  price: number
}

export interface ShopItemModel {
  id: number
  shop_id: number
  name: string
  price: number
  created_at: Date
}
