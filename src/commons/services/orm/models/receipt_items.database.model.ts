import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, NotNull, PrimaryKey, Table } from 'sequelize-typescript'
import Receipt from './receipts.database.model'
import ShopItem from './shop_items.database.model'

interface ReceiptItemsAttributes {
  id: number
  receipt_id: number
  shop_item_id: number
  quantity: number
  warranty: string
  eco_tax: number
  discount: number
}

export type ReceiptItemsCreation = Omit<ReceiptItemsAttributes, 'id'>

@Table({ tableName: 'receipt_items', timestamps: false })
export default class ReceiptItem extends Model<ReceiptItemsAttributes, ReceiptItemsCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @ForeignKey(() => Receipt)
  @NotNull
  @Column({ allowNull: false })
  receipt_id!: number

  @ForeignKey(() => ShopItem)
  @NotNull
  @Column({ allowNull: false })
  shop_item_id!: number

  @NotNull
  @Column({ allowNull: false })
  quantity!: number

  @NotNull
  @Column({ allowNull: false })
  warranty!: string

  @NotNull
  @Column({ allowNull: false })
  eco_tax!: number

  @NotNull
  @Column({ allowNull: false })
  discount!: number

  @BelongsTo(() => Receipt)
  receipt!: Receipt

  @BelongsTo(() => ShopItem)
  shop_item!: ShopItem
}
