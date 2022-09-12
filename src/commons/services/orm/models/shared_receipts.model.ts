import { AutoIncrement, Column, DataType, Model, PrimaryKey, Table } from 'sequelize-typescript'

export interface SharedReceiptAttribute {
  id: number
  receipt_id: number
  recipient_id: number
  shared_at: Date
  completed: boolean
}

export type SharedReceiptCreation = Omit<SharedReceiptAttribute, 'id'>

@Table({ tableName: 'shared_receipts', timestamps: false })
export class SharedReceipt extends Model<SharedReceiptAttribute, SharedReceiptCreation> {
  @PrimaryKey
  @Column
  @AutoIncrement
  declare id: number

  @Column({ allowNull: false })
  receipt_id!: number

  @Column({ allowNull: false })
  recipient_id!: number

  @Column({ type: DataType.DATE, allowNull: false })
  shared_at!: Date

  @Column({ allowNull: false })
  completed!: boolean
}
