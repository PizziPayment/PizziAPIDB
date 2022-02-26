import { AutoIncrement, BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript'
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

@Table({ tableName: 'shop_items', timestamps: false })
export default class ReceiptItem extends Model<ReceiptItemsAttributes, ReceiptItemsCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @ForeignKey(() => Receipt)
  receipt_id!: number

  @ForeignKey(() => ShopItem)
  shop_item_id!: number

  @Column
  quantity!: number

  @Column
  warranty!: string

  @Column
  eco_tax!: number

  @Column
  discount!: number

  @BelongsTo(() => Receipt)
  receipt!: Receipt

  @HasOne(() => ShopItem)
  shop_item!: ShopItem
}
