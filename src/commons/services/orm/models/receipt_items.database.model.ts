import { AutoIncrement, BelongsTo, Column, ForeignKey, HasOne, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Receipt from './receipts.database.model'
import ShopItem from './shop_items.database.model'
import ProductReturnCertificates from './product_return_certificates.database.model'

interface ReceiptItemsAttributes {
  id: number
  receipt_id: number
  shop_item_id: number
  quantity: number
  warranty: string
  eco_tax: number
  tva_percentage: number
  discount: number
}

export type ReceiptItemsCreation = Omit<ReceiptItemsAttributes, 'id'>

@Table({ tableName: 'receipt_items', timestamps: false })
export default class ReceiptItem extends Model<ReceiptItemsAttributes, ReceiptItemsCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @ForeignKey(() => Receipt)
  @Column({ allowNull: false })
  receipt_id!: number

  @ForeignKey(() => ShopItem)
  @Column({ allowNull: false })
  shop_item_id!: number

  @Column({ allowNull: false })
  quantity!: number

  @Column({ allowNull: false })
  warranty!: string

  @Column({ allowNull: false })
  eco_tax!: number

  @Column({ allowNull: false })
  tva_percentage!: number

  @Column({ allowNull: false })
  discount!: number

  @BelongsTo(() => Receipt)
  receipt!: Receipt

  @BelongsTo(() => ShopItem)
  shop_item!: ShopItem

  @HasOne(() => ProductReturnCertificates)
  product_return_certificate?: ProductReturnCertificates
}
