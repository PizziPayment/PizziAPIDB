import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Receipt from './receipts.database.model'
import Product from './products.database.model'

interface ReceiptProductAttributes {
  id: number
  id_receipt: number
  id_product: number
  quantity: number
  unit_price: number
}

export type ReceiptProductCreation = Omit<ReceiptProductAttributes, 'id'>

@Table({ tableName: 'receipt_products', timestamps: false })
export default class ReceiptProduct extends Model<ReceiptProductAttributes, ReceiptProductCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @ForeignKey(() => Receipt)
  @Column
  id_receipt!: number

  @ForeignKey(() => Product)
  @Column
  id_product!: number

  @Column
  quantity!: number

  @Column
  unit_price!: number
}
