import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import User from './users.database.model'
import Receipt from './receipts.database.model'

interface TransactionAttributes {
  id: number
  state: number
  user_id: number
  receipt_id: number
}

export type TransactionCreation = Omit<TransactionAttributes, 'id'>

@Table({ tableName: 'transactions', timestamps: false })
export default class Transaction extends Model<TransactionAttributes, TransactionCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column
  state!: number

  @Column
  @ForeignKey(() => User)
  user_id?: number

  @Column
  @ForeignKey(() => Receipt)
  receipt_id!: number
}
