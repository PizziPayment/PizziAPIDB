import { AutoIncrement, Column, DataType, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import User from './users.database.model'
import Receipt from './receipts.database.model'
import Shop from './shops.database.model'

interface TransactionAttributes {
  id: number
  state: TransactionState
  payment_method: PaymentMethod
  user_id?: number
  shop_id: number
  receipt_id: number
}

export type TransactionCreation = Omit<TransactionAttributes, 'id'>

export type PaymentMethod = 'card' | 'cash'
export type TransactionState = 'failed' | 'pending' | 'validated'

@Table({ tableName: 'transactions', timestamps: false })
export default class Transaction extends Model<TransactionAttributes, TransactionCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column(DataType.ENUM('failed', 'pending', 'validated'))
  state!: TransactionState

  @Column(DataType.ENUM('card', 'cash'))
  payment_method!: PaymentMethod

  @Column
  @ForeignKey(() => User)
  user_id?: number

  @Column
  @ForeignKey(() => Shop)
  shop_id!: number

  @Column
  @ForeignKey(() => Receipt)
  receipt_id!: number
}
