import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
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
export default class ReceiptItems extends Model<ReceiptItemsAttributes, ReceiptItemsCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @ForeignKey(() => Receipt)
  receipt_id!: string

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
}
