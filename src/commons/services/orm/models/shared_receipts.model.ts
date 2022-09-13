import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  HasOne,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'
import Receipt from './receipts.database.model'
import User from './users.database.model'

export interface SharedReceiptAttribute {
  id: number
  receipt_id: number
  recipient_id: number
  shared_at: Date
  completed: boolean
}

export type SharedReceiptCreation = Omit<SharedReceiptAttribute, 'id'>

@Table({ tableName: 'shared_receipts', timestamps: false })
export default class SharedReceipt extends Model<SharedReceiptAttribute, SharedReceiptCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @ForeignKey(() => Receipt)
  @Column({ allowNull: false })
  receipt_id!: number

  @ForeignKey(() => User)
  @Column({ allowNull: false })
  recipient_id!: number

  @Column({ type: DataType.DATE, allowNull: false })
  shared_at!: Date

  @Column({ allowNull: false })
  completed!: boolean

  @BelongsTo(() => User)
  recipient!: User

  @BelongsTo(() => Receipt)
  receipt!: Receipt
}
