import {
  AutoIncrement,
  Column,
  DataType,
  HasMany,
  HasOne,
  Model,
  NotNull,
  PrimaryKey,
  Table,
} from 'sequelize-typescript'
import ReceiptItem from './receipt_items.database.model'
import Transaction from './transactions.database.model'

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

  @NotNull
  @Column({ allowNull: false, type: DataType.FLOAT })
  tva_percentage!: number

  @NotNull
  @Column({ allowNull: false, type: DataType.DECIMAL(16, 4) })
  total_price!: string

  @HasMany(() => ReceiptItem)
  items!: Array<ReceiptItem>

  @HasOne(() => Transaction)
  transaction!: Transaction
}
