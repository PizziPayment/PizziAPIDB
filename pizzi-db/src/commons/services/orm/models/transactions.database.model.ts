import { AutoIncrement, Column, ForeignKey, IsIn, Model, PrimaryKey, Table } from 'sequelize-typescript'
import User from './users.database.model'
import Receipt from './receipts.database.model'
import Shop from './shops.database.model'

interface TransactionAttributes {
  id: number
  state: string
  payment_method: string
  user_id?: number
  shop_id: number
  receipt_id: number
}

export type TransactionCreation = Omit<TransactionAttributes, 'id'>

@Table({ tableName: 'transactions', timestamps: false })
export default class Transaction extends Model<TransactionAttributes, TransactionCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @IsIn([['failed', 'pending', 'validated']])
  state!: string

  @IsIn([['card', 'cash']])
  payment_method!: string

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
