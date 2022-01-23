import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Shop from './shops.database.model'
import Receipt from './receipts.database.model'

interface ReceiptItemsAttributes {
  id: number
  name: string
  price: string
}

export type ReceiptItemsCreation = Omit<ReceiptItemsAttributes, 'id'>

@Table({ tableName: 'shop_items', timestamps: false })
export default class ReceiptItems extends Model<ReceiptItemsAttributes, ReceiptItemsCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @ForeignKey(() => Receipt)
  receipt_id!: string

  @Column
  quantity!: string

  @Column
  warranty!: boolean

  @Column
  eco_tax!: number

  @Column
  discount!: number
}
