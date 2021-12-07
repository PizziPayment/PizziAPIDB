import { AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from 'sequelize-typescript'
import Shop from './shop.database.model'

interface ProductAttributes {
  id: number
  name: string
  price_u: number
  shop_id: number
}

export type ProductCreation = Omit<ProductAttributes, 'id'>

@Table({ tableName: 'products', timestamps: false })
export default class Product extends Model<ProductAttributes, ProductCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @Column
  name!: string

  @Column
  unit_price!: number

  @ForeignKey(() => Shop)
  @Column
  shop_id!: number
}
