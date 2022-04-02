import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  NotNull,
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

  @NotNull
  @Column({ allowNull: false })
  name!: string

  @NotNull
  @Column({ allowNull: false })
  price!: number

  @NotNull
  @Column({ allowNull: false, type: DataType.DATE })
  created_at!: Date

  @ForeignKey(() => Shop)
  @NotNull
  @Column({ allowNull: false })
  shop_id!: number

  @BelongsTo(() => Shop)
  shop!: Shop

  @HasMany(() => ReceiptItem, 'shop_item_id')
  receipt_items!: Array<ReceiptItem>
}
