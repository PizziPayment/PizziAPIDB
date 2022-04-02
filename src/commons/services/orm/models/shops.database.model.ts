import { AutoIncrement, Column, ForeignKey, HasMany, Model, NotNull, PrimaryKey, Table } from 'sequelize-typescript'
import Picture from './pictures.database.model'
import Transaction from './transactions.database.model'

interface ShopAttributes {
  id: number
  name: string
  phone: string
  description?: string
  address: string
  zipcode: number
  logo?: number
  website?: string
  instagram?: string
  twitter?: string
  facebook?: string
}

export type ShopCreation = Omit<ShopAttributes, 'id'>

@Table({ tableName: 'shops', timestamps: false })
export default class Shop extends Model<ShopAttributes, ShopCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @NotNull
  @Column({ allowNull: false })
  name!: string

  @NotNull
  @Column({ allowNull: false })
  phone!: string

  @Column
  description?: string

  @NotNull
  @Column({ allowNull: false })
  address!: string

  @NotNull
  @Column({ allowNull: false })
  zipcode!: number

  @Column
  @ForeignKey(() => Picture)
  logo?: number

  @Column
  website?: string

  @Column
  instagram?: string

  @Column
  twitter?: string

  @Column
  facebook?: string

  @HasMany(() => Transaction)
  transactions!: Array<Transaction>
}
