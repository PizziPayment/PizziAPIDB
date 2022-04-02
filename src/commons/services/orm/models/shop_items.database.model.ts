import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'
import Shop from './shops.database.model'
import ReceiptItem from './receipt_items.database.model'

interface ShopItemsAttributes {
  id: number
  name: string
  price: number
  shop_id: number
  created_at: Date
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
  price!: number

  @Column(DataType.DATE)
  created_at!: Date

  @ForeignKey(() => Shop)
  @Column
  shop_id!: number

  @BelongsTo(() => Shop)
  shop!: Shop

  @HasMany(() => ReceiptItem, 'shop_item_id')
  receipt_items!: Array<ReceiptItem>
}
