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

export interface ShopItemsAttributes {
  id: number
  name: string
  price: string
  shop_id: number
  created_at: Date
  enabled: boolean
}

export type ShopItemsCreation = Omit<ShopItemsAttributes, 'id'>

@Table({ tableName: 'shop_items', timestamps: false })
export default class ShopItem extends Model<ShopItemsAttributes, ShopItemsCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column({ allowNull: false })
  name!: string

  @Column({ allowNull: false, type: DataType.DECIMAL(16, 2) })
  price!: string

  @Column({ allowNull: false, type: DataType.DATE })
  created_at!: Date

  @ForeignKey(() => Shop)
  @Column({ allowNull: false })
  shop_id!: number

  @Column({ allowNull: false })
  enabled!: boolean

  @BelongsTo(() => Shop)
  shop!: Shop

  @HasMany(() => ReceiptItem)
  receipt_items!: Array<ReceiptItem>
}
