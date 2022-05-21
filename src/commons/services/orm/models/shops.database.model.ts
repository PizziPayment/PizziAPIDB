import { AutoIncrement, Column, ForeignKey, HasMany, HasOne, Model, PrimaryKey, Table, DataType } from 'sequelize-typescript'
import Credential from './credentials.database.model'
import Picture from './pictures.database.model'
import Transaction from './transactions.database.model'

interface ShopAttributes {
  id: number
  name: string
  phone: string
  description?: string
  siret: number
  address: string
  city: string
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

  @Column({ allowNull: false })
  name!: string

  @Column({ allowNull: false })
  phone!: string

  @Column
  description?: string

  @Column({ type: DataType.BIGINT, allowNull: false })
  siret!: number

  @Column({ allowNull: false })
  address!: string

  @Column({ allowNull: false })
  city!: string

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

  @HasOne(() => Credential)
  credential!: Credential

  @HasMany(() => Transaction)
  transactions!: Array<Transaction>
}
