import {
  AutoIncrement,
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  IsIn,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'
import User from './users.database.model'
import Receipt from './receipts.database.model'
import Shop from './shops.database.model'

export interface TransactionAttributes {
  id: number
  state: string
  payment_method: string
  user_id?: number
  shop_id: number
  receipt_id: number
  created_at: Date
}

export type PaymentMethod = 'card' | 'cash'
export type TransactionState = 'failed' | 'pending' | 'validated'

export type TransactionCreation = Omit<TransactionAttributes, 'id'>

@Table({ tableName: 'transactions', timestamps: false })
export default class Transaction extends Model<TransactionAttributes, TransactionCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @IsIn([['failed', 'pending', 'validated']])
  @Column({ allowNull: false })
  state!: string

  @IsIn([['card', 'cash']])
  @Column({ allowNull: false })
  payment_method!: string

  @ForeignKey(() => User)
  @Column
  user_id?: number

  @ForeignKey(() => Shop)
  @Column({ allowNull: false })
  shop_id!: number

  @ForeignKey(() => Receipt)
  @Column({ allowNull: false })
  receipt_id!: number

  @Column(DataType.DATE)
  created_at!: Date

  @BelongsTo(() => User)
  user!: User

  @BelongsTo(() => Shop)
  shop!: Shop

  @BelongsTo(() => Receipt)
  receipt!: Receipt
}
