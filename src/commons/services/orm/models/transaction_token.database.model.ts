import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Transaction from './transactions.database.model'

interface TemporaryTransactionTokenAttributes {
  id: number
  transaction_id: number
  token: string
}

export type UserCreation = Omit<TemporaryTransactionTokenAttributes, 'id'>

@Table({ tableName: 'transaction_tokens', timestamps: false })
export default class TransactionToken extends Model<TemporaryTransactionTokenAttributes, UserCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @ForeignKey(() => Transaction)
  @Column({ allowNull: false })
  transaction_id!: number

  @Column({ allowNull: false })
  token!: string
}
