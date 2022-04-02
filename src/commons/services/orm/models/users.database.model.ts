import { AutoIncrement, Column, ForeignKey, HasMany, Model, NotNull, PrimaryKey, Table } from 'sequelize-typescript'
import Picture from './pictures.database.model'
import Transaction from './transactions.database.model'

interface UserAttributes {
  id: number
  firstname: string
  surname: string
  picture_id?: number
  address: string
  zipcode: number
}

export type UserCreation = Omit<UserAttributes, 'id'>

@Table({ tableName: 'users', timestamps: false })
export default class User extends Model<UserAttributes, UserCreation> {
  @PrimaryKey
  @AutoIncrement
  @Column
  declare id: number

  @NotNull
  @Column({ allowNull: false })
  firstname!: string

  @NotNull
  @Column({ allowNull: false })
  surname!: string

  @ForeignKey(() => Picture)
  @Column
  picture_id?: number

  @NotNull
  @Column({ allowNull: false })
  address!: string

  @NotNull
  @Column({ allowNull: false })
  zipcode!: number

  @HasMany(() => Transaction)
  transactions!: Array<Transaction>
}
