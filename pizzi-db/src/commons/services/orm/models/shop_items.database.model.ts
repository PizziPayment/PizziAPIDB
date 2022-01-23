import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Shop from './shops.database.model'

interface ShopItemsAttributes {
  id: number
  name: string
  price: string
}

export type ShopItemsCreation = Omit<ShopItemsAttributes, 'id'>

@Table({ tableName: 'shop_items', timestamps: false })
export default class ShopItem extends Model<ShopItemsAttributes, ShopItemsCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column
  name!: string

  @Column
  price!: string

  @ForeignKey(() => Shop)
  shop_id!: number
}
