import { AutoIncrement, BelongsTo, Column, ForeignKey, Model, PrimaryKey, Table, Unique } from 'sequelize-typescript'
import ReceiptItem from './receipt_items.database.model'

interface ProductReturnCertificatesAttributes {
  id: number
  receipt_item_id: number
  reason: string
  quantity: number
  return_date: Date
}

export type ProductReturnCertificatesCreation = Omit<ProductReturnCertificatesAttributes, 'id'>

@Table({ tableName: 'product_return_certificates', timestamps: false })
export default class ProductReturnCertificates extends Model<
  ProductReturnCertificatesAttributes,
  ProductReturnCertificatesCreation
> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Unique
  @ForeignKey(() => ReceiptItem)
  @Column({ allowNull: false })
  receipt_item_id!: number

  @Column({ allowNull: true })
  reason!: string
  
  @Column({ allowNull: false })
  quantity!: number

  @Column({ allowNull: false })
  return_date!: Date

  @BelongsTo(() => ReceiptItem)
  receipt_item!: ReceiptItem
}
