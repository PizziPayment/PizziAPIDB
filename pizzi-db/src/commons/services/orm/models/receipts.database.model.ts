import { AutoIncrement, Column, DataType, HasMany, Model, PrimaryKey, Table } from 'sequelize-typescript'
import ReceiptItem from './receipt_items.database.model'

export interface ReceiptAttributes {
  id: number
  tva_percentage: number
  total_price: string
}

export type ReceiptCreation = Omit<ReceiptAttributes, 'id'>

@Table({ tableName: 'receipts', timestamps: false })
export default class Receipt extends Model<ReceiptAttributes, ReceiptCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column(DataType.FLOAT)
  tva_percentage!: number

  @Column
  total_price!: string

  @HasMany(() => ReceiptItem)
  items!: Array<ReceiptItem>
}
