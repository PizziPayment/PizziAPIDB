import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

interface ReceiptAttributes {
  id: number
  tva_percentage: number
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
}
